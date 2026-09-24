# System Architecture

## 1. Overview
The **Online Hobby & Skills Tracker with Community Sharing on Cloud** is designed using a decoupled client-server architecture capable of operating in local mode (for development and academic demonstration) and cloud mode (for production scale on Google Cloud / Firebase).

---

## 2. Local vs. Cloud Architecture

### Local Development Architecture
```
+-------------------------------------------------------------+
|                      Client Browser                         |
|           (React 18 + Vite + Vanilla CSS Tokens)            |
+-------------------------------------------------------------+
                               |
                               | HTTP / REST (JSON)
                               v
+-------------------------------------------------------------+
|                     FastAPI Application                     |
|           (Uvicorn ASGI Server, Python 3.12)                |
|  - Routers: Auth, Profile, Skills, Goals, Practice, Feed    |
|  - Services: Progress Engine, Business Validation           |
|  - Local JWT Token Authentication (HS256)                   |
+-------------------------------------------------------------+
               |                               |
               v                               v
+-----------------------------+ +-----------------------------+
|      SQLite Database        | |     Local File Storage      |
|    (SQLAlchemy + aiosqlite) | |      (uploads/ directory)   |
+-----------------------------+ +-----------------------------+
```

### Production Cloud Architecture (Google Cloud Platform)
```
+-------------------------------------------------------------+
|                 Firebase Hosting (Global CDN)               |
|            Static Web Assets (React Production SPA)         |
+-------------------------------------------------------------+
                               |
                               | HTTPS / WSS
                               v
+-------------------------------------------------------------+
|                 Google Cloud Run (Serverless)               |
|            FastAPI Docker Container with Auto-scaling       |
|  - Managed Environment: 0 to N container instances          |
|  - Port listening via dynamic $PORT                         |
|  - IAM Role Binding & Secret Manager                        |
+-------------------------------------------------------------+
               |                               |
       +-------+-------+               +-------+-------+
       |               |               |               |
       v               v               v               v
+-------------+ +-------------+ +-------------+ +-------------+
| Google Cloud| | Firebase    | | Google Cloud| | Firebase    |
|  Firestore  | |    Auth     | |   Storage   | | Performance |
| (NoSQL /    | |  (Managed   | |  (Bucket /  | | & Cloud     |
| Real-time)  | |  Identity)  | |  Blob Store)| | Monitoring  |
+-------------+ +-------------+ +-------------+ +-------------+
```

---

## 3. Data & Operational Flows

### A. Authentication Flow
1. User submits registration/login credentials to `/api/auth/register` or `/api/auth/login`.
2. In local mode, passwords are encrypted with bcrypt (cost factor 12) and verified against the user store. A JSON Web Token (JWT) signed with `JWT_SECRET` is returned.
3. In cloud mode, Firebase Authentication handles token issuance, and FastAPI decodes Firebase ID tokens using the `firebase-admin` SDK.
4. Subsequent requests pass `Authorization: Bearer <token>`, validated via dependency injection in FastAPI.

### B. Practice & Streak Calculation Flow
1. User logs a practice session specifying skill ID, duration (in minutes), date, and activity notes.
2. The practice service persists the entry and automatically increments the `current_value` on matching active goals for that skill.
3. Milestones whose thresholds (`target_value`) have been met are automatically set to `achieved=True`.
4. The streak engine runs: it normalizes calendar practice dates, deduplicates sessions occurring on the same day, checks for consecutive-day sequences ending today or yesterday, and derives current and longest practice streaks.

### C. Community Feed & Interaction Flow
1. Users share milestones or practice sessions by posting text and optional achievement image proofs to `/api/posts`.
2. Public feed queries `/api/feed` with category filtering and keyword search.
3. When a post is liked, a composite unique constraint (`user_id + post_id`) guarantees that duplicate likes are rejected with HTTP 409 Conflict.
4. Comments are linked to the post; only the comment author can delete their own comment.

### D. File Storage Abstraction Flow
1. Client sends multipart form-data to `/api/files/upload`.
2. The `StorageService` interface checks file MIME types, enforces a 10MB file size limit, and sanitizes filenames.
3. The underlying provider stores the binary payload:
   - `LocalStorageService`: Writes file into sanitized subfolder within `./uploads/`.
   - `FirebaseCloudStorageService`: Streams blob to Google Cloud Storage bucket with public read access.
4. Metadata is written to the database returning a safe download/view URL.

---

## 4. Security Principles
- **No Hardcoded Secrets**: All keys, secrets, and configurations read from environment variables (`.env`).
- **Data Isolation**: Database queries strictly filter by `user_id == current_user.id` for private skills, goals, practice records, and files.
- **Path Traversal Protection**: Local file downloads verify paths remain strictly within `LOCAL_UPLOAD_DIR`.
