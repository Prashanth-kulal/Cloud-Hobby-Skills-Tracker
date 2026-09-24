import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { communityApi, skillsApi, filesApi } from '../services/api';
import Modal from '../components/Modal';
import {
  Users,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Search,
  Filter,
  Image,
  Send,
  Trash2,
  Sparkles,
  UserCheck
} from 'lucide-react';

const CommunityPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals & Active states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState({}); // { [postId]: comments[] }
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: string }

  // Create post form
  const [postForm, setPostForm] = useState({
    skill_id: '',
    category: 'General',
    content: '',
    media_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'Coding', 'Music', 'Photography', 'Art', 'Fitness', 'Cooking', 'General'];

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await communityApi.getFeed(params);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [categoryFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      skillsApi.getSkills().then(res => setSkills(res.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeed();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.content.trim()) return;
    setSubmitting(true);

    try {
      let media_url = postForm.media_url;

      // If user selected an image file, upload to cloud storage first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('category', 'post');
        const uploadRes = await filesApi.uploadFile(formData);
        media_url = uploadRes.data.file_url;
      }

      await communityApi.createPost({
        ...postForm,
        media_url: media_url || undefined,
        skill_id: postForm.skill_id || undefined
      });

      setCreateModalOpen(false);
      setPostForm({ skill_id: '', category: 'General', content: '', media_url: '' });
      setSelectedFile(null);
      await fetchFeed();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (post) => {
    if (!isAuthenticated) {
      alert('Please log in to like posts.');
      return;
    }

    try {
      if (post.user_liked) {
        const res = await communityApi.unlikePost(post.id);
        setPosts(prev => prev.map(p => p.id === post.id ? res.data : p));
      } else {
        const res = await communityApi.likePost(post.id);
        setPosts(prev => prev.map(p => p.id === post.id ? res.data : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComments = async (postId) => {
    if (expandedComments[postId]) {
      // Toggle close
      setExpandedComments(prev => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });
    } else {
      // Fetch post comments
      try {
        const res = await communityApi.getPost(postId);
        setExpandedComments(prev => ({ ...prev, [postId]: res.data.comments || [] }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    if (!isAuthenticated) {
      alert('Please log in to comment.');
      return;
    }

    try {
      const res = await communityApi.addComment(postId, { content: text });
      setExpandedComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      // Increment comment count in feed post
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await communityApi.deleteComment(commentId);
      setExpandedComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, p.comment_count - 1) } : p));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await communityApi.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '850px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Community Feed</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Discover skills, celebrate milestones, and connect with other learners.
          </p>
        </div>

        {isAuthenticated && (
          <button id="btn-create-post-top" className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={18} /> Share Progress
          </button>
        )}
      </div>

      {/* Search Bar & Category Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id="input-community-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts by skill, username, or topic..."
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="var(--text-light)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button id="btn-community-search" type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="btn btn-sm"
              style={{
                backgroundColor: categoryFilter === cat ? 'var(--primary)' : '#ffffff',
                color: categoryFilter === cat ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Users size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No community posts found</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Be the first to share an achievement, practice session, or hobby milestone!
          </p>
          {isAuthenticated && (
            <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
              <Plus size={18} /> Create Post
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
            <article key={post.id} className="card" style={{ padding: '1.5rem' }}>
              {/* Post Author Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={`/users/${post.author?.username}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      overflow: 'hidden'
                    }}>
                      {post.author?.profile_picture ? (
                        <img src={post.author.profile_picture} alt={post.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        post.author?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link to={`/users/${post.author?.username}`} style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {post.author?.full_name || post.author?.username}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      @{post.author?.username} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Just now'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {post.skill_name && (
                    <span className="badge badge-beginner">{post.skill_name}</span>
                  )}
                  {user && user.id === post.user_id && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{ color: 'var(--text-light)', padding: '0.3rem' }}
                      title="Delete your post"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: post.media_url ? '1rem' : '1.25rem', whiteSpace: 'pre-line' }}>
                {post.content}
              </p>

              {/* Media Image */}
              {post.media_url && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem', maxHeight: '420px', border: '1px solid var(--border)' }}>
                  <img src={post.media_url} alt="Community attachment" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              {/* Actions: Likes & Comments */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <button
                  id={`btn-like-${post.id}`}
                  onClick={() => handleToggleLike(post)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: post.user_liked ? 'var(--danger)' : 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  <Heart size={18} fill={post.user_liked ? 'var(--danger)' : 'none'} />
                  <span>{post.like_count} {post.like_count === 1 ? 'Like' : 'Likes'}</span>
                </button>

                <button
                  id={`btn-comment-${post.id}`}
                  onClick={() => handleToggleComments(post.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  <MessageSquare size={18} />
                  <span>{post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[post.id] && (
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  {/* List comments */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {expandedComments[post.id].length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        No comments yet. Start the conversation!
                      </p>
                    ) : (
                      expandedComments[post.id].map(comment => (
                        <div key={comment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'var(--bg-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{comment.author?.username || 'User'}: </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{comment.content}</span>
                          </div>
                          {user && user.id === comment.user_id && (
                            <button
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              style={{ color: 'var(--text-light)', padding: '0.2rem' }}
                              title="Delete comment"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment input */}
                  {isAuthenticated && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddComment(post.id)}
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Share Progress or Achievement">
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Category</label>
            <select
              value={postForm.category}
              onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
            >
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {skills.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Associated Skill (Optional)</label>
              <select
                value={postForm.skill_id}
                onChange={(e) => setPostForm({ ...postForm, skill_id: e.target.value })}
              >
                <option value="">None / General Post</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.skill_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Post Content *</label>
            <textarea
              id="input-post-content"
              rows={4}
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              placeholder="What skill milestone did you accomplish today? Share tips or details..."
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Attach Photo / Certificate</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              Files are securely stored in Cloud Object Storage.
            </div>
          </div>

          <button id="btn-submit-post" type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CommunityPage;
