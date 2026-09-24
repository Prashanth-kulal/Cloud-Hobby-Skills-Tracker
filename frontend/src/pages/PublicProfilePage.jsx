import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi, followApi } from '../services/api';
import {
  User,
  Heart,
  UserPlus,
  UserMinus,
  Sparkles,
  Calendar,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const PublicProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getPublicProfile(username);
      setData(res.data);

      const targetUserId = res.data.user.id;
      // Fetch followers & following
      const [followersRes, followingRes] = await Promise.all([
        followApi.getFollowers(targetUserId),
        followApi.getFollowing(targetUserId)
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);

      if (currentUser) {
        setIsFollowing(followersRes.data.some(f => f.id === currentUser.id));
      }
    } catch (err) {
      console.error(err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow creators.');
      return;
    }
    setActionLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollowUser(data.user.id);
        setIsFollowing(false);
        setFollowers(prev => prev.filter(f => f.id !== currentUser.id));
      } else {
        await followApi.followUser(data.user.id);
        setIsFollowing(true);
        setFollowers(prev => [...prev, currentUser]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating follow status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading profile...</div>;
  }

  if (error || !data) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">{error || 'User not found'}</div>
        <Link to="/community" className="btn btn-secondary"><ArrowLeft size={16} /> Back to Community</Link>
      </div>
    );
  }

  const { user, skills, posts } = data;
  const isOwnProfile = currentUser && currentUser.id === user.id;

  return (
    <div className="page-wrapper" style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Community Feed
        </Link>
      </div>

      {/* Profile Header */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: '700',
              overflow: 'hidden'
            }}>
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.full_name}</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>@{user.username}</div>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span><strong>{followers.length}</strong> Followers</span>
                <span><strong>{following.length}</strong> Following</span>
                <span><strong>{skills.length}</strong> Skills</span>
              </div>
            </div>
          </div>

          {!isOwnProfile && isAuthenticated && (
            <button
              id="btn-toggle-follow"
              className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggleFollow}
              disabled={actionLoading}
            >
              {isFollowing ? (
                <>
                  <UserMinus size={16} /> Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Follow
                </>
              )}
            </button>
          )}
        </div>

        {user.bio && (
          <p style={{ marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
            {user.bio}
          </p>
        )}

        {user.interests && (
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {user.interests.split(',').map((interest, i) => (
              <span key={i} className="badge" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {interest.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Grid: Public Skills / Shared Posts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Skills */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary)" /> Public Skills
          </h2>

          {skills.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>No public skills shared yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {skills.map((s, idx) => (
                <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{s.skill_name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>{s.category}</span>
                    <span className="badge badge-beginner">{s.level}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Recent Community Posts
          </h2>

          {posts.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
              No public posts yet.
            </div>
          ) : (
            posts.map(p => (
              <div key={p.id} className="card" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: p.media_url ? '0.75rem' : '0' }}>
                  {p.content}
                </p>
                {p.media_url && (
                  <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '250px', marginTop: '0.5rem' }}>
                    <img src={p.media_url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
                  <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)' }}>
                    <Heart size={14} fill="var(--danger)" /> {p.likes}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
