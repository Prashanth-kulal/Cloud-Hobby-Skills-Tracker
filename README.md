# 🌟 Online Hobby & Skills Tracker with Community Sharing on Cloud

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Cloud_Run_%7C_Storage_%7C_Firestore-4285F4.svg?style=flat&logo=googlecloud&logoColor=white)](https://cloud.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Online Hobby & Skills Tracker** is a full-stack, cloud-ready web application engineered to help individuals build consistent habits, master skills, track practice sessions, reach measurable milestones, visualize progress via rich analytics, and celebrate achievements in an interactive social community feed.

---

## 📑 Table of Contents

- [Overview & Highlights](#-overview--highlights)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
  - [Local Development Architecture](#local-development-architecture)
  - [Production Cloud Architecture](#production-cloud-architecture-gcp--firebase)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [API Reference](#-api-reference)
- [Core Algorithms & Progress Engine](#-core-algorithms--progress-engine)
- [Cloud Deployment (GCP & Firebase)](#-cloud-deployment-gcp--firebase)
- [Running Automated Tests](#-running-automated-tests)
- [Security & Best Practices](#-security--best-practices)
- [License](#-license)

---

## 🌟 Overview & Highlights

Whether you're learning the piano, writing code, mastering watercolor painting, or training for a 10K, consistency is key. The **Online Hobby & Skills Tracker** bridges personal habit-tracking and community motivation:

1. **Dual Execution Mode**: Runs seamlessly on local workstations (SQLite + Local File Storage) or fully managed serverless infrastructure on Google Cloud Platform (Cloud Run + Firestore + Cloud Storage + Firebase Hosting).
2. **Automated Progress Propagation**: Logging a single practice session automatically cascades through active goals, recalculates milestone completions, and refreshes current/longest practice streaks.
3. **Interactive Community Space**: Share milestones with proof images, like posts, engage in discussions, and follow fellow creators.
4. **Data-Driven Visual Analytics**: Comprehensive dashboards featuring practice distributions, weekly velocity trends, monthly progress, and goal achievement bars.

---

## ✨ Key Features

### 🎯 Skill & Category Management
- Categorize skills (e.g., *Programming, Music, Art, Languages, Fitness, Writing*).
- Define experience levels (*Beginner, Intermediate, Advanced, Expert*).
- Add custom color accents, descriptions, and tags.

### ⏱️ Practice Session Logging
- Record practice sessions with date, time, duration (minutes), notes, and reflection logs.
- Automatic updates to skill cumulative hours and connected goals.

### 📈 Goals & Milestones Engine
- Create target-oriented goals (e.g., "Practice 50 hours of Rust by Q3").
- Automated milestone checkpoints (e.g., "Complete 10 hours", "Build first CLI tool").
- Auto-status progression: dynamically transitions goals from `in_progress` to `completed`.

### 🔥 Intelligent Streak Engine
- Tracks **Current Streak** and **Longest Streak**.
- Calendar-aware normalization (deduplicates multiple sessions on the same calendar date).
- Consecutive day checks with grace period for today/yesterday.

### 📊 Visual Analytics & Reporting
- Powered by [Recharts](https://recharts.org/):
  - **Weekly Practice Trend**: Daily breakdown across the past 7 days.
  - **Hours by Skill**: Comparative distribution of time invested across skills.
  - **Monthly Velocity**: 4-week practice momentum tracking.
  - **Skill Category Distribution**: Donut/pie charts of skill focus areas.

### 🌐 Community Feed & Social Network
- Public and category-filtered feed of practice updates and milestone achievements.
- Image uploads for proof of work and visual showcase.
- Anti-duplicate like engine (409 Conflict rejection for duplicate likes).
- Threaded post comments and follower/following relationships.

### 👤 Profile & Portfolio
- Public user portfolio showcasing active skills, total hours, streak statistics, and posts.
- Avatar uploads and custom bio personalization.

---

## 🏗️ System Architecture

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

### Production Cloud Architecture (GCP + Firebase)

```
+-------------------------------------------------------------+
|                 Firebase Hosting (Global CDN)               |
|            Static Web Assets (React Production SPA)         |
+-------------------------------------------------------------+
                               |
                               | HTTPS / REST
                               v
+-------------------------------------------------------------+
|                 Google Cloud Run (Serverless)               |
|            FastAPI Docker Container with Auto-scaling       |
|  - Managed Environment: 0 to N container instances          |
|  - Port listening via dynamic $PORT                         |
|  - Secret Manager & IAM Cloud Roles                         |
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

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18.2](https://reactjs.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visualizations**: [Recharts 2.10](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Vanilla CSS with structured design system tokens (dark/light contrast, glassmorphism, responsive cards)

### Backend
- **Framework**: [FastAPI 0.104](https://fastapi.tiangolo.com/)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **ORM & Database**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) with `aiosqlite` (Async)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/) & `pydantic-settings`
- **Security**: `passlib` with `bcrypt` (cost 12), `python-jose` for JWT
- **File Handling**: `aiofiles`, `python-multipart`, `Pillow`

### Cloud & Infrastructure
- **Serverless Compute**: Google Cloud Run
- **Object Storage**: Google Cloud Storage / Firebase Cloud Storage
- **Cloud Database**: Google Cloud Firestore (modular abstraction in `cloud/database_service.py`)
- **Hosting**: Firebase Hosting

---

## 📁 Project Directory Structure

```text
Cloud-Hobby-Skills-Tracker/
│
├── .env.example                 # Environment configuration template
├── .gitignore                   # Git ignore specifications
├── hobby_tracker.db             # Local SQLite database instance
│
├── analytics/                   # Data processing & algorithmic calculations
│   └── progress_service.py      # Streak & progress aggregation logic
│
├── backend/                     # FastAPI ASGI backend
│   ├── app.py                   # App entrypoint, lifespan & router registration
│   ├── config.py                # Pydantic BaseSettings environment config
│   ├── database.py              # Async SQLAlchemy engine & session factory
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── requirements.txt         # Python dependencies
│   ├── middleware/              # Custom ASGI middlewares
│   ├── models/                  # SQLAlchemy ORM models (User, Skill, Goal, Post, etc.)
│   ├── repositories/            # Data-access repositories (User, Skill, Practice, Follow)
│   ├── routes/                  # API routers (auth, skills, practice, feed, etc.)
│   ├── services/                # Business logic services (skill_service, goal_service)
│   └── utils/                   # Password hashing, JWT token utilities
│
├── cloud/                       # Cloud provider abstraction layer
│   ├── auth_service.py          # Abstract & Firebase Cloud Auth providers
│   ├── database_service.py      # Abstract & Firestore Cloud DB providers
│   └── storage_service.py       # Abstract, Local & GCS/Firebase Storage providers
│
├── frontend/                    # Vite + React single-page frontend
│   ├── package.json             # NPM dependencies & scripts
│   ├── vite.config.js           # Vite configuration & backend proxy
│   ├── index.html               # SPA HTML entry point
│   └── src/
│       ├── App.jsx              # Main routing and navigation shell
│       ├── index.css            # Global CSS tokens and aesthetic layout styles
│       ├── components/          # Reusable UI widgets (Navbar, Modal, Cards)
│       ├── context/             # Authentication & user state context
│       ├── pages/               # Application views:
│       │   ├── LandingPage.jsx      # Hero landing page
│       │   ├── DashboardPage.jsx    # User central activity dashboard
│       │   ├── SkillsPage.jsx       # Skills catalog & management
│       │   ├── SkillDetailPage.jsx  # Individual skill analytics & logs
│       │   ├── PracticePage.jsx     # Practice timer & session logger
│       │   ├── GoalsPage.jsx        # Goal & milestone progress tracker
│       │   ├── CommunityPage.jsx    # Social feed, post publisher & comments
│       │   ├── AnalyticsPage.jsx    # Visual trend charts & performance graphs
│       │   ├── ProfilePage.jsx      # User profile editor & avatar settings
│       │   └── PublicProfilePage.jsx# Public user portfolio
│       └── services/            # Axios API client integrations
│
├── docs/                        # Architecture & system documentation
│   └── architecture.md          # Technical design specification
│
├── tests/                       # Automated test suite
│   └── test_api.py              # End-to-end integration test suite
│
└── uploads/                     # Local storage directory for media & proofs
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Python**: `3.10` or higher (`python --version`)
- **Node.js**: `18.x` or higher (`node -v`) and **npm** (`npm -v`)
- **Git**

---

### Backend Setup (FastAPI)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   In the root or `backend` folder, ensure your `.env` is set up (you can copy `.env.example`):
   ```bash
   cp ../.env.example .env
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```
   - API is running at: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`
   - ReDoc Documentation: `http://localhost:8000/redoc`

---

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open your browser at `http://localhost:5173`
   - Vite is pre-configured to proxy `/api` requests directly to `http://localhost:8000`.

---

## ⚙️ Configuration & Environment Variables

The project uses Pydantic Settings to validate environment parameters. Create a `.env` file based on `.env.example`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `"Online Hobby & Skills Tracker"` | Name of the application |
| `APP_VERSION` | `"1.0.0"` | SemVer release version |
| `DEBUG` | `True` | Debug mode toggle |
| `PORT` | `8000` | Port for the backend service (auto-read by Cloud Run) |
| `FRONTEND_URL` | `"http://localhost:5173"` | Allowed origin for CORS |
| `DATABASE_URL` | `"sqlite+aiosqlite:///./hobby_tracker.db"` | Async SQLAlchemy database connection string |
| `JWT_SECRET` | *(string)* | Secret key for signing HS256 JWT access tokens |
| `JWT_ALGORITHM`| `"HS256"` | Cryptographic algorithm for JWT |
| `JWT_EXPIRE_MINUTES` | `1440` | Token lifetime (default: 24 hours) |
| `STORAGE_TYPE` | `"local"` | Storage backend: `"local"` or `"firebase"` |
| `LOCAL_UPLOAD_DIR` | `"./uploads"` | Directory path for local file storage |
| `FIREBASE_PROJECT_ID` | `""` | GCP Project ID (for cloud deployment) |
| `FIREBASE_STORAGE_BUCKET`| `""` | Cloud Storage bucket name |
| `FIREBASE_CLIENT_EMAIL` | `""` | Service account client email |
| `FIREBASE_PRIVATE_KEY` | `""` | Service account private key |

---

## 📡 API Reference

All backend API routes are prefixed under `/api`.

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and receive Bearer JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | ✅ |

### 👤 Profile & Users (`/api/profile`, `/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/profile` | Retrieve personal profile | ✅ |
| `PUT` | `/api/profile` | Update bio, interests, and profile info | ✅ |
| `GET` | `/api/users/{user_id}/public` | Retrieve public portfolio of another user | ❌ |
| `POST` | `/api/users/{user_id}/follow` | Follow a user | ✅ |
| `DELETE` | `/api/users/{user_id}/follow` | Unfollow a user | ✅ |

### 🎯 Skills (`/api/skills`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/skills` | List all skills for current user | ✅ |
| `POST` | `/api/skills` | Create a new skill | ✅ |
| `GET` | `/api/skills/{skill_id}` | Get detailed analytics and milestones for a skill | ✅ |
| `PUT` | `/api/skills/{skill_id}` | Update skill attributes | ✅ |
| `DELETE` | `/api/skills/{skill_id}` | Delete a skill | ✅ |

### ⏱️ Practice Sessions (`/api/practice`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/practice` | List user's logged practice sessions | ✅ |
| `POST` | `/api/practice` | Log a practice session (auto-updates goals & streak) | ✅ |
| `DELETE` | `/api/practice/{session_id}` | Delete a practice log entry | ✅ |

### 🎯 Goals & Milestones (`/api/goals`, `/api/milestones`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/goals` | List all goals with progress percentages | ✅ |
| `POST` | `/api/goals` | Create a new skill-linked goal | ✅ |
| `PUT` | `/api/goals/{goal_id}` | Update target or status of a goal | ✅ |
| `DELETE` | `/api/goals/{goal_id}` | Delete a goal | ✅ |
| `POST` | `/api/milestones` | Add a milestone checkpoint to a goal | ✅ |
| `PUT` | `/api/milestones/{id}/toggle` | Manually mark milestone achieved/unachieved | ✅ |

### 🌐 Community Posts & Interactions (`/api/posts`, `/api/comments`, `/api/likes`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/posts` | Retrieve community feed (with filters & search) | ❌ |
| `POST` | `/api/posts` | Share a practice update or milestone achievement | ✅ |
| `DELETE` | `/api/posts/{post_id}` | Delete post (author only) | ✅ |
| `POST` | `/api/posts/{post_id}/like` | Like a post | ✅ |
| `DELETE` | `/api/posts/{post_id}/like` | Unlike a post | ✅ |
| `POST` | `/api/posts/{post_id}/comments` | Add a comment to a post | ✅ |
| `DELETE` | `/api/comments/{comment_id}` | Delete comment (author only) | ✅ |

### 📊 Analytics & Files (`/api/analytics`, `/api/files`, `/api/health`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/analytics` | Summary cards & chart data (weekly, monthly, hours) | ✅ |
| `POST` | `/api/files/upload` | Upload proof image or avatar (Max 10MB) | ✅ |
| `GET` | `/api/files/download/{path}` | Stream stored file securely | ❌ |
| `GET` | `/api/health` | Healthcheck endpoint (`{"status": "ok"}`) | ❌ |

---

## 📊 Core Algorithms & Progress Engine

The business analytics logic resides in `analytics/progress_service.py`:

### 1. Streak Calculation (`calculate_streaks`)
- **Deduplication**: Gathers all practice timestamps, converting them into unique UTC calendar dates.
- **Longest Streak**: Iterates chronologically through sorted dates; increments on consecutive days (`date_difference == 1`) and records maximum continuous span.
- **Current Streak**: Verifies if the most recent session was logged *today* or *yesterday* (within 1 calendar day grace period). If yes, steps backwards to tally the active consecutive days. If no practice occurred in the last 48 hours, resets `current_streak` to `0`.

### 2. Automated Goal Cascading
- When a user submits a practice session of `N` minutes, the system queries all active goals associated with that `skill_id`.
- For `target_hours` goals, `current_value` is incremented by `N / 60.0`.
- For `target_sessions` goals, `current_value` is incremented by `1`.
- Any linked milestone where `current_value >= milestone.target_value` is automatically marked as achieved.

---

## ☁️ Cloud Deployment (GCP & Firebase)

### Deploying the Backend to Google Cloud Run

Google Cloud Run enables serverless, auto-scaling deployment directly from a Docker container:

1. **Build and push container image using Google Cloud Build**:
   ```bash
   gcloud builds submit --tag gcr.io/<YOUR_PROJECT_ID>/hobby-tracker-backend ./backend
   ```

2. **Deploy container to Cloud Run**:
   ```bash
   gcloud run deploy hobby-tracker-backend \
     --image gcr.io/<YOUR_PROJECT_ID>/hobby-tracker-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars STORAGE_TYPE=firebase,FIREBASE_PROJECT_ID=<YOUR_PROJECT_ID>,FIREBASE_STORAGE_BUCKET=<YOUR_BUCKET>.appspot.com
   ```

### Deploying the Frontend to Firebase Hosting

1. **Build production frontend assets**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Initialize Firebase in the frontend directory**:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Set public directory to `dist`
   - Configure as a single-page app (rewrite all URLs to `/index.html`)

3. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

---

## 🧪 Running Automated Tests

The repository includes a comprehensive integration test suite covering authentication, streak calculations, goal updates, post interactions, permissions, and security constraints.

To run the test suite using the virtual environment:

```bash
# From the project root:
backend\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

*Note: For a fresh test run, ensure tests operate against a clean test database or remove test user conflicts.*

---

## 🔒 Security & Best Practices

- **Password Hashing**: Industry-standard `bcrypt` password hashing with salt cost factor of 12.
- **Data Isolation**: User data (skills, goals, practice records) is strictly query-scoped by `user_id == current_user.id`.
- **Duplicate Prevention**: Composite unique constraints prevent duplicate likes (`user_id + post_id`) and duplicate usernames/emails.
- **Path Traversal Protection**: File download endpoints enforce path sanitization within the designated `LOCAL_UPLOAD_DIR`.
- **Upload Validation**: Enforces MIME type checks and a strict 10MB payload size limit.
- **Graceful Error Handling**: Global FastAPI exception handlers return unified, predictable JSON responses.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
