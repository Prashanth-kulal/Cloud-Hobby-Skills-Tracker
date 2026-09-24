import React, { useState, useEffect } from 'react';
import { goalsApi, skillsApi } from '../services/api';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import {
  Target,
  Plus,
  Award,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit3,
  Flag
} from 'lucide-react';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED

  // Modals
  const [createGoalModalOpen, setCreateGoalModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Forms
  const [goalForm, setGoalForm] = useState({
    skill_id: '',
    title: '',
    target_value: 20,
    unit: 'hours',
    deadline: ''
  });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', target_value: 5 });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalsRes, skillsRes] = await Promise.all([
        goalsApi.getGoals(),
        skillsApi.getSkills()
      ]);
      setGoals(goalsRes.data);
      setSkills(skillsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalsApi.createGoal(goalForm);
      setCreateGoalModalOpen(false);
      setGoalForm({ skill_id: '', title: '', target_value: 20, unit: 'hours', deadline: '' });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating goal');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setSaving(true);
    try {
      await goalsApi.addMilestone(selectedGoal.id, milestoneForm);
      setMilestoneModalOpen(false);
      setMilestoneForm({ title: '', target_value: 5 });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding milestone');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id, title) => {
    if (!window.confirm(`Delete goal "${title}"?`)) return;
    try {
      await goalsApi.deleteGoal(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await goalsApi.deleteMilestone(milestoneId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete milestone');
    }
  };

  const filteredGoals = goals.filter(g => {
    if (filter === 'ACTIVE') return g.status === 'ACTIVE';
    if (filter === 'COMPLETED') return g.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Practice Goals & Milestones</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Set quantifiable targets. Logged practice automatically updates your progress and unlocks milestones.
          </p>
        </div>

        <button id="btn-create-goal-page" className="btn btn-primary" onClick={() => setCreateGoalModalOpen(true)}>
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="btn btn-sm"
            style={{
              backgroundColor: filter === tab ? 'var(--primary)' : '#ffffff',
              color: filter === tab ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} Goals
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading goals...</div>
      ) : filteredGoals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Target size={48} color="var(--border-focus)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No goals found</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Set a target number of practice hours or project milestones to maintain motivation!
          </p>
          <button className="btn btn-primary" onClick={() => setCreateGoalModalOpen(true)}>
            <Plus size={18} /> Create Goal Now
          </button>
        </div>
      ) : (
        <div className="grid-cols-2">
          {filteredGoals.map((goal) => {
            const skillObj = skills.find(s => s.id === goal.skill_id);
            return (
              <div key={goal.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{goal.title}</h3>
                      {skillObj && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
                          Skill: {skillObj.skill_name}
                        </span>
                      )}
                    </div>
                    <span className={`badge ${goal.status === 'COMPLETED' ? 'badge-completed' : 'badge-active'}`}>
                      {goal.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ margin: '1rem 0' }}>
                    <ProgressBar percent={goal.progress_percent} showLabel height={10} color={goal.status === 'COMPLETED' ? 'var(--success)' : 'var(--primary)'} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      <span>Current: <strong>{goal.current_value}</strong> {goal.unit}</span>
                      <span>Target: <strong>{goal.target_value}</strong> {goal.unit}</span>
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Milestones ({goal.milestones ? goal.milestones.filter(m => m.achieved).length : 0}/{goal.milestones ? goal.milestones.length : 0})
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedGoal(goal);
                          setMilestoneModalOpen(true);
                        }}
                      >
                        <Plus size={12} /> Add Step
                      </button>
                    </div>

                    {(!goal.milestones || goal.milestones.length === 0) ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        No milestones added. Add checkpoints like "5 hours", "10 hours".
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {goal.milestones.map((m) => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <CheckCircle2 size={16} color={m.achieved ? 'var(--success)' : 'var(--border-focus)'} />
                              <span style={{ textDecoration: m.achieved ? 'line-through' : 'none', color: m.achieved ? 'var(--text-light)' : 'var(--text-main)', fontWeight: m.achieved ? '400' : '500' }}>
                                {m.title} ({m.target_value} {goal.unit})
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {m.achieved && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>✓ Done</span>
                              )}
                              <button
                                onClick={() => handleDeleteMilestone(m.id)}
                                style={{ color: 'var(--text-light)', padding: '0.2rem' }}
                                title="Delete milestone"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer delete */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleDeleteGoal(goal.id, goal.title)}
                  >
                    <Trash2 size={14} /> Delete Goal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={createGoalModalOpen} onClose={() => setCreateGoalModalOpen(false)} title="Create Practice Goal">
        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Skill</label>
            <select
              value={goalForm.skill_id}
              onChange={(e) => setGoalForm({ ...goalForm, skill_id: e.target.value })}
            >
              <option value="">General (All / No specific skill)</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>{s.skill_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Goal Title *</label>
            <input
              type="text"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="e.g. Complete 50 Hours of Coding"
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
                placeholder="hours, sessions"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Save Goal'}
          </button>
        </form>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal isOpen={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} title={`Add Milestone to ${selectedGoal?.title}`}>
        <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Milestone Title *</label>
            <input
              type="text"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              placeholder="e.g. Reach 10 Hours checkpoint"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Target Value ({selectedGoal?.unit}) *</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={milestoneForm.target_value}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, target_value: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Adding...' : 'Add Milestone'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default GoalsPage;
