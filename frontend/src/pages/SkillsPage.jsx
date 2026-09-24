import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { skillsApi, practiceApi, goalsApi } from '../services/api';
import Modal from '../components/Modal';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Target,
  ArrowUpRight,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Form states
  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    category: 'General',
    current_level: 'BEGINNER',
    target_level: 'INTERMEDIATE',
    description: '',
    target_date: ''
  });

  const [practiceForm, setPracticeForm] = useState({
    duration_minutes: 60,
    activity: '',
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await skillsApi.getSkills();
      setSkills(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await skillsApi.createSkill(skillForm);
      setCreateModalOpen(false);
      setSkillForm({ skill_name: '', category: 'General', current_level: 'BEGINNER', target_level: 'INTERMEDIATE', description: '', target_date: '' });
      await fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating skill');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkill) return;
    setSaving(true);
    try {
      await skillsApi.updateSkill(selectedSkill.id, skillForm);
      setEditModalOpen(false);
      setSelectedSkill(null);
      await fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to delete "${skillName}" and its practice history?`)) return;
    try {
      await skillsApi.deleteSkill(skillId);
      await fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const handleLogPractice = async (e) => {
    e.preventDefault();
    if (!selectedSkill) return;
    setSaving(true);
    try {
      await practiceApi.logPractice({
        skill_id: selectedSkill.id,
        duration_minutes: practiceForm.duration_minutes,
        activity: practiceForm.activity,
        notes: practiceForm.notes
      });
      setPracticeModalOpen(false);
      setPracticeForm({ duration_minutes: 60, activity: '', notes: '' });
      await fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging practice');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['All', ...new Set(skills.map(s => s.category).filter(Boolean))];
  const filteredSkills = filterCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category?.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Skills & Hobbies</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Manage the skills you are actively developing and monitor your expertise levels.
          </p>
        </div>

        <button
          id="btn-create-skill"
          className="btn btn-primary"
          onClick={() => {
            setSkillForm({ skill_name: '', category: 'General', current_level: 'BEGINNER', target_level: 'INTERMEDIATE', description: '', target_date: '' });
            setCreateModalOpen(true);
          }}
        >
          <Plus size={18} /> Add New Skill
        </button>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="btn btn-sm"
              style={{
                backgroundColor: filterCategory === cat ? 'var(--primary)' : '#ffffff',
                color: filterCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your skills...
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Sparkles size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No skills found</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Start tracking a new hobby, instrument, coding language, or craft today!
          </p>
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={18} /> Add Skill Now
          </button>
        </div>
      ) : (
        <div className="grid-cols-3">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      <Link to={`/skills/${skill.id}`} style={{ color: 'inherit' }}>
                        {skill.skill_name}
                      </Link>
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {skill.category || 'General'}
                    </span>
                  </div>
                  <span className={`badge badge-${skill.current_level.toLowerCase()}`}>
                    {skill.current_level}
                  </span>
                </div>

                {skill.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {skill.description}
                  </p>
                )}

                {/* Level progression */}
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Target Level</div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{skill.target_level}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Practice Time</div>
                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{skill.total_practice_hours} hrs</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    id={`btn-log-practice-skill-${skill.id}`}
                    className="btn btn-secondary btn-sm"
                    title="Log Practice"
                    onClick={() => {
                      setSelectedSkill(skill);
                      setPracticeModalOpen(true);
                    }}
                  >
                    <Clock size={15} /> Log
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="Edit Skill"
                    onClick={() => {
                      setSelectedSkill(skill);
                      setSkillForm({
                        skill_name: skill.skill_name,
                        category: skill.category || 'General',
                        current_level: skill.current_level,
                        target_level: skill.target_level,
                        description: skill.description || '',
                        target_date: skill.target_date || ''
                      });
                      setEditModalOpen(true);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="Delete Skill"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleDeleteSkill(skill.id, skill.skill_name)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Link to={`/skills/${skill.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.65rem' }}>
                  Details <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Skill Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Skill">
        <form onSubmit={handleCreateSkill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Skill Name *</label>
            <input
              id="input-new-skill-name"
              type="text"
              value={skillForm.skill_name}
              onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
              placeholder="e.g. Photography, Cooking, Piano"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Category</label>
            <input
              type="text"
              value={skillForm.category}
              onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
              placeholder="e.g. Arts, Music, Programming"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Current Level</label>
              <select
                value={skillForm.current_level}
                onChange={(e) => setSkillForm({ ...skillForm, current_level: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Target Level</label>
              <select
                value={skillForm.target_level}
                onChange={(e) => setSkillForm({ ...skillForm, target_level: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Description</label>
            <textarea
              rows={3}
              value={skillForm.description}
              onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
              placeholder="Describe what you aim to achieve with this skill..."
            />
          </div>
          <button id="btn-submit-create-skill" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Save Skill'}
          </button>
        </form>
      </Modal>

      {/* Edit Skill Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit ${selectedSkill?.skill_name}`}>
        <form onSubmit={handleEditSkill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Skill Name *</label>
            <input
              type="text"
              value={skillForm.skill_name}
              onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Category</label>
            <input
              type="text"
              value={skillForm.category}
              onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Current Level</label>
              <select
                value={skillForm.current_level}
                onChange={(e) => setSkillForm({ ...skillForm, current_level: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Target Level</label>
              <select
                value={skillForm.target_level}
                onChange={(e) => setSkillForm({ ...skillForm, target_level: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Description</label>
            <textarea
              rows={3}
              value={skillForm.description}
              onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating...' : 'Update Skill'}
          </button>
        </form>
      </Modal>

      {/* Log Practice for Specific Skill Modal */}
      <Modal isOpen={practiceModalOpen} onClose={() => setPracticeModalOpen(false)} title={`Log Practice: ${selectedSkill?.skill_name}`}>
        <form onSubmit={handleLogPractice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Duration (Minutes) *</label>
            <input
              id="skill-log-duration"
              type="number"
              min="1"
              max="1440"
              value={practiceForm.duration_minutes}
              onChange={(e) => setPracticeForm({ ...practiceForm, duration_minutes: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Activity</label>
            <input
              id="skill-log-activity"
              type="text"
              value={practiceForm.activity}
              onChange={(e) => setPracticeForm({ ...practiceForm, activity: e.target.value })}
              placeholder="e.g. Practiced chord progressions"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Notes</label>
            <textarea
              id="skill-log-notes"
              rows={3}
              value={practiceForm.notes}
              onChange={(e) => setPracticeForm({ ...practiceForm, notes: e.target.value })}
              placeholder="What went well or what needs improvement?"
            />
          </div>
          <button id="skill-log-submit" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Record Practice Session'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SkillsPage;
