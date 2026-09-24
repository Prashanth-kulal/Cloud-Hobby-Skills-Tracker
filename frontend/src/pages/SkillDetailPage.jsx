import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { skillsApi, goalsApi, practiceApi, filesApi } from '../services/api';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import {
  Sparkles,
  Target,
  Clock,
  Plus,
  ArrowLeft,
  Calendar,
  Award,
  Upload,
  FileCheck,
  Trash2
} from 'lucide-react';

const SkillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [goals, setGoals] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Forms
  const [goalForm, setGoalForm] = useState({ title: '', target_value: 20, unit: 'hours' });
  const [practiceForm, setPracticeForm] = useState({ duration_minutes: 60, activity: '', notes: '' });
  const [fileToUpload, setFileToUpload] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSkillData = async () => {
    try {
      setLoading(true);
      const [skillRes, goalsRes, practiceRes] = await Promise.all([
        skillsApi.getSkill(id),
        goalsApi.getGoals(id),
        practiceApi.getSkillPractice(id)
      ]);
      setSkill(skillRes.data);
      setGoals(goalsRes.data);
      setPracticeSessions(practiceRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load skill details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillData();
  }, [id]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalsApi.createGoal({
        ...goalForm,
        skill_id: id
      });
      setGoalModalOpen(false);
      setGoalForm({ title: '', target_value: 20, unit: 'hours' });
      await fetchSkillData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating goal');
    } finally {
      setSaving(false);
    }
  };

  const handleLogPractice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await practiceApi.logPractice({
        ...practiceForm,
        skill_id: id
      });
      setPracticeModalOpen(false);
      setPracticeForm({ duration_minutes: 60, activity: '', notes: '' });
      await fetchSkillData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging practice');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('category', 'achievement');
      await filesApi.uploadFile(formData);
      setUploadModalOpen(false);
      setFileToUpload(null);
      alert('Achievement proof uploaded successfully to Cloud Object Storage!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading file');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading skill details...</div>;
  }

  if (error || !skill) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">{error || 'Skill not found'}</div>
        <Link to="/skills" className="btn btn-secondary"><ArrowLeft size={16} /> Back to Skills</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Navigation breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/skills" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to all skills
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{skill.skill_name}</h1>
              <span className={`badge badge-${skill.current_level.toLowerCase()}`}>{skill.current_level}</span>
              <span className="badge badge-active">{skill.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: '650px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {skill.description || 'No description provided for this skill.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button id="btn-skill-detail-log" className="btn btn-primary" onClick={() => setPracticeModalOpen(true)}>
              <Clock size={16} /> Log Practice
            </button>
            <button id="btn-skill-detail-add-goal" className="btn btn-secondary" onClick={() => setGoalModalOpen(true)}>
              <Target size={16} /> Add Goal
            </button>
            <button id="btn-skill-detail-upload" className="btn btn-secondary" onClick={() => setUploadModalOpen(true)}>
              <Upload size={16} /> Upload Proof
            </button>
          </div>
        </div>

        {/* Stats summary banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Category</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{skill.category || 'General'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Total Practice</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{skill.total_practice_hours} hours</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Target Level</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{skill.target_level}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Started</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
              {skill.start_date ? new Date(skill.start_date).toLocaleDateString() : 'Recently'}
            </div>
          </div>
        </div>
      </div>

      {/* Two column grid: Goals & Milestones / Practice Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Goals & Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={18} color="var(--primary)" /> Goals & Milestones
              </h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setGoalModalOpen(true)}>
                <Plus size={14} /> New Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                No specific goals created for this skill yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {goals.map((g) => (
                  <div key={g.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{g.title}</h3>
                      <span className={`badge ${g.status === 'COMPLETED' ? 'badge-completed' : 'badge-active'}`}>
                        {g.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <ProgressBar percent={g.progress_percent} showLabel height={8} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        <span>Current: {g.current_value} {g.unit}</span>
                        <span>Target: {g.target_value} {g.unit}</span>
                      </div>
                    </div>

                    {/* Milestones attached to this goal */}
                    {g.milestones && g.milestones.length > 0 && (
                      <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          Milestones:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {g.milestones.map((m) => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                              <Award size={15} color={m.achieved ? 'var(--success)' : 'var(--text-light)'} />
                              <span style={{ textDecoration: m.achieved ? 'line-through' : 'none', color: m.achieved ? 'var(--text-light)' : 'var(--text-main)' }}>
                                {m.title} ({m.target_value} {g.unit})
                              </span>
                              {m.achieved && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>✓ Achieved</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Practice Sessions History for this skill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--secondary)" /> Practice History
              </h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setPracticeModalOpen(true)}>
                <Plus size={14} /> Log
              </button>
            </div>

            {practiceSessions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                No practice sessions recorded yet for {skill.skill_name}.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {practiceSessions.map((p) => (
                  <div key={p.id} style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{p.activity || 'Practice Session'}</span>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>
                        {p.duration_minutes} mins
                      </span>
                    </div>
                    {p.notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0' }}>{p.notes}</p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> {p.practiced_at ? new Date(p.practiced_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} title={`Create Goal for ${skill.skill_name}`}>
        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Goal Title *</label>
            <input
              type="text"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="e.g. Master portrait lighting"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Target Value *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={goalForm.target_value}
                onChange={(e) => setGoalForm({ ...goalForm, target_value: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Unit</label>
              <input
                type="text"
                value={goalForm.unit}
                onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Save Goal'}
          </button>
        </form>
      </Modal>

      {/* Practice Modal */}
      <Modal isOpen={practiceModalOpen} onClose={() => setPracticeModalOpen(false)} title={`Log Practice: ${skill.skill_name}`}>
        <form onSubmit={handleLogPractice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Duration (Minutes) *</label>
            <input
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
              type="text"
              value={practiceForm.activity}
              onChange={(e) => setPracticeForm({ ...practiceForm, activity: e.target.value })}
              placeholder="e.g. Practiced chord progressions"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Notes</label>
            <textarea
              rows={3}
              value={practiceForm.notes}
              onChange={(e) => setPracticeForm({ ...practiceForm, notes: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Log Practice'}
          </button>
        </form>
      </Modal>

      {/* Upload Proof Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Achievement Proof">
        <form onSubmit={handleUploadProof} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Upload certificate, project screenshot, or audio/photo demonstration to cloud object storage.
          </p>
          <div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFileToUpload(e.target.files[0])}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving || !fileToUpload}>
            {saving ? 'Uploading...' : 'Upload to Cloud Storage'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SkillDetailPage;
