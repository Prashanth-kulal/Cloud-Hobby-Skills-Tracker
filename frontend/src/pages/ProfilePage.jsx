import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi, filesApi } from '../services/api';
import {
  User,
  Camera,
  Mail,
  Calendar,
  CheckCircle,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    interests: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfileAndFiles = async () => {
    try {
      setLoading(true);
      const [profRes, filesRes] = await Promise.all([
        profileApi.getProfile(),
        filesApi.getMyFiles()
      ]);
      setProfile({
        full_name: profRes.data.full_name || '',
        bio: profRes.data.bio || '',
        interests: profRes.data.interests || ''
      });
      setFiles(filesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndFiles();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await profileApi.updateProfile(profile);
      updateUser(res.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await profileApi.uploadProfileImage(formData);
      updateUser({ profile_picture: res.data.profile_picture });
      setMessage('Profile picture updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file from cloud storage?')) return;
    try {
      await filesApi.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  if (loading) {
    return <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading profile...</div>;
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Account & Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Manage your personal bio, profile image, and cloud-stored achievement proofs.
          </p>
        </div>

        {user?.username && (
          <Link to={`/users/${user.username}`} className="btn btn-secondary btn-sm" id="btn-view-public-profile">
            <ExternalLink size={15} /> View Public Profile
          </Link>
        )}
      </div>

      {message && (
        <div className="alert alert-success" id="profile-success-alert">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Info Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar with upload overlay */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: '700',
              overflow: 'hidden',
              border: '3px solid var(--border)'
            }}>
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <label
              htmlFor="profile-pic-upload"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--primary)',
                color: '#fff',
                padding: '0.45rem',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Change profile picture"
            >
              <Camera size={16} />
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                style={{ display: 'none' }}
                disabled={uploadingPic}
              />
            </label>
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{user?.full_name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>@{user?.username}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              <Mail size={14} /> {user?.email}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              id="profile-input-fullname"
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Bio & Goals
            </label>
            <textarea
              id="profile-input-bio"
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell others about what hobbies or skills you are developing..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Interests (Comma separated)
            </label>
            <input
              id="profile-input-interests"
              type="text"
              value={profile.interests}
              onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
              placeholder="e.g. Photography, Acoustic Guitar, Python, UI Design"
            />
          </div>

          <div>
            <button id="profile-btn-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Cloud Object Storage Files Card */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Cloud Storage Proofs & Documents
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Certificates and achievement proofs stored via Cloud Object Storage.
        </p>

        {files.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No achievement files uploaded yet. Upload proofs from your skill details page or community posts.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {files.map(file => (
              <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={18} color="var(--primary)" />
                  <div>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                      {file.file_name}
                    </a>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      Category: {file.file_category || 'General'} • {file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteFile(file.id)}
                  style={{ color: 'var(--danger)', padding: '0.3rem' }}
                  title="Delete file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
