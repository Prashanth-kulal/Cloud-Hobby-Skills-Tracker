import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, skillsApi, practiceApi, goalsApi } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import {
  Sparkles,
  Target,
  Clock,
  Flame,
  Award,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Share2
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // Form states for modals
  const [newSkill, setNewSkill] = useState({ skill_name: '', category: 'General', current_level: 'BEGINNER', target_level: 'INTERMEDIATE', description: '' });
  const [newPractice, setNewPractice] = useState({ skill_id: '', duration_minutes: 60, activity: '', notes: '' });
  const [newGoal, setNewGoal] = useState({ skill_id: '', title: '', target_value: 20, unit: 'hours' });
  const [allSkills, setAllSkills] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboard();
      setDashboardData(res.data);
      const skillsRes = await skillsApi.getSkills();
      setAllSkills(skillsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await skillsApi.createSkill(newSkill);
      setSkillModalOpen(false);
      setNewSkill({ skill_name: '', category: 'General', current_level: 'BEGINNER', target_level: 'INTERMEDIATE', description: '' });
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create skill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogPractice = async (e) => {
    e.preventDefault();
    if (!newPractice.skill_id) {
      alert('Please select a skill');
      return;
    }
    setActionLoading(true);
    try {
      await practiceApi.logPractice(newPractice);
      setPracticeModalOpen(false);
      setNewPractice({ skill_id: '', duration_minutes: 60, activity: '', notes: '' });
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log practice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await goalsApi.createGoal(newGoal);
      setGoalModalOpen(false);
      setNewGoal({ skill_id: '', title: '', target_value: 20, unit: 'hours' });
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--primary)', fontWeight: '600' }}>Loading your dashboard...</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    active_skills: 0,
    total_practice_hours: 0,
    completed_goals: 0,
    milestones_achieved: 0,
    current_streak: 0
  };

  return (
    <div className="page-wrapper">
      {/* Header & Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Here is your progress overview and learning consistency.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            id="dash-btn-add-skill"
            className="btn btn-secondary btn-sm"
            onClick={() => setSkillModalOpen(true)}
          >
            <Plus size={16} /> Add Skill
          </button>
          <button
            id="dash-btn-log-practice"
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (allSkills.length > 0 && !newPractice.skill_id) {
                setNewPractice(prev => ({ ...prev, skill_id: allSkills[0].id }));
              }
              setPracticeModalOpen(true);
            }}
          >
            <Clock size={16} /> Log Practice
          </button>
          <button
            id="dash-btn-create-goal"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (allSkills.length > 0 && !newGoal.skill_id) {
                setNewGoal(prev => ({ ...prev, skill_id: allSkills[0].id }));
              }
              setGoalModalOpen(true);
            }}
          >
            <Target size={16} /> Create Goal
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Active Skills"
          value={stats.active_skills}
          icon={Sparkles}
          color="var(--primary)"
          subtitle="Enrolled hobbies & skills"
        />
        <StatCard
          title="Practice Time"
          value={stats.total_practice_hours}
          unit="hrs"
          icon={Clock}
          color="var(--secondary)"
          subtitle={`${stats.today_practice_hours || 0} hrs logged today`}
        />
        <StatCard
          title="Current Streak"
          value={stats.current_streak}
          unit={stats.current_streak === 1 ? 'day' : 'days'}
          icon={Flame}
          color="#f97316"
          subtitle={`Best: ${stats.longest_streak || 0} consecutive days`}
        />
        <StatCard
          title="Milestones Achieved"
          value={stats.milestones_achieved}
          icon={Award}
          color="var(--success)"
          subtitle={`${stats.completed_goals} goals completed`}
        />
      </div>

      {/* Main Sections: Skills & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Skills Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '600' }}>Your Active Skills</h2>
              <Link to="/skills" style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {(!dashboardData?.recent_skills || dashboardData.recent_skills.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Sparkles size={36} color="var(--border-focus)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: '500' }}>No skills added yet</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  Add your first hobby or skill to begin tracking practice.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setSkillModalOpen(true)}
                >
                  <Plus size={16} /> Add Skill Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.recent_skills.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Link to={`/skills/${skill.id}`} style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>
                          {skill.skill_name}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Category: {skill.category || 'General'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`badge badge-${skill.current_level.toLowerCase()}`}>
                          {skill.current_level}
                        </span>
                        <span className="badge badge-active">{skill.status}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Practice Time: <strong>{skill.total_practice_hours} hrs</strong></span>
                      <span>Target: {skill.target_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Community Highlights */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #ffffff 0%, var(--primary-light) 100%)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Share Your Milestones With The Community
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Celebrate accomplishments, upload certificates, and inspire fellow learners.
              </p>
            </div>
            <Link to="/community" className="btn btn-primary btn-sm" id="btn-go-community">
              <Share2 size={16} /> Community Feed
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity & Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recent Practice Log */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>Recent Practice</h3>
              <Link to="/practice" style={{ fontSize: '0.8rem', fontWeight: '600' }}>History</Link>
            </div>

            {(!dashboardData?.recent_practice || dashboardData.recent_practice.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', padding: '1.5rem 0' }}>
                No recent practice recorded.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.recent_practice.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                      <span>{item.skill_name || 'Practice'}</span>
                      <span style={{ color: 'var(--primary)' }}>{item.duration_minutes} mins</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      {item.activity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Goals */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>Target Goals</h3>
              <Link to="/goals" style={{ fontSize: '0.8rem', fontWeight: '600' }}>All Goals</Link>
            </div>

            {(!dashboardData?.recent_goals || dashboardData.recent_goals.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', padding: '1.5rem 0' }}>
                No active goals yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dashboardData.recent_goals.map((g) => (
                  <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500' }}>
                      <span>{g.title}</span>
                      <span>{g.current_value} / {g.target_value} {g.unit}</span>
                    </div>
                    <ProgressBar percent={g.progress_percent} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal isOpen={skillModalOpen} onClose={() => setSkillModalOpen(false)} title="Add New Skill / Hobby">
        <form onSubmit={handleCreateSkill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Skill Name *</label>
            <input
              id="modal-skill-name"
              type="text"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
              placeholder="e.g. Photography, Guitar, Coding"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Category</label>
            <input
              id="modal-skill-category"
              type="text"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              placeholder="e.g. Arts, Music, Tech, Fitness"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Current Level</label>
              <select
                id="modal-skill-current-level"
                value={newSkill.current_level}
                onChange={(e) => setNewSkill({ ...newSkill, current_level: e.target.value })}
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Target Level</label>
              <select
                id="modal-skill-target-level"
                value={newSkill.target_level}
                onChange={(e) => setNewSkill({ ...newSkill, target_level: e.target.value })}
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
              id="modal-skill-desc"
              rows={3}
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              placeholder="What are your goals with this skill?"
            />
          </div>
          <button id="modal-skill-submit" type="submit" className="btn btn-primary" disabled={actionLoading} style={{ marginTop: '0.5rem' }}>
            {actionLoading ? 'Saving...' : 'Add Skill'}
          </button>
        </form>
      </Modal>

      {/* Log Practice Modal */}
      <Modal isOpen={practiceModalOpen} onClose={() => setPracticeModalOpen(false)} title="Log Practice Session">
        <form onSubmit={handleLogPractice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Skill *</label>
            <select
              id="modal-practice-skill"
              value={newPractice.skill_id}
              onChange={(e) => setNewPractice({ ...newPractice, skill_id: e.target.value })}
              required
            >
              <option value="">Select a skill</option>
              {allSkills.map(s => (
                <option key={s.id} value={s.id}>{s.skill_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Duration (Minutes) *</label>
            <input
              id="modal-practice-duration"
              type="number"
              min="1"
              max="1440"
              value={newPractice.duration_minutes}
              onChange={(e) => setNewPractice({ ...newPractice, duration_minutes: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Activity</label>
            <input
              id="modal-practice-activity"
              type="text"
              value={newPractice.activity}
              onChange={(e) => setNewPractice({ ...newPractice, activity: e.target.value })}
              placeholder="e.g. Practiced fingerpicking technique"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Notes</label>
            <textarea
              id="modal-practice-notes"
              rows={3}
              value={newPractice.notes}
              onChange={(e) => setNewPractice({ ...newPractice, notes: e.target.value })}
              placeholder="Key learnings, difficulties overcome, etc."
            />
          </div>
          <button id="modal-practice-submit" type="submit" className="btn btn-primary" disabled={actionLoading} style={{ marginTop: '0.5rem' }}>
            {actionLoading ? 'Logging...' : 'Log Practice'}
          </button>
        </form>
      </Modal>

      {/* Create Goal Modal */}
      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} title="Create Practice Goal">
        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Associated Skill</label>
            <select
              id="modal-goal-skill"
              value={newGoal.skill_id}
              onChange={(e) => setNewGoal({ ...newGoal, skill_id: e.target.value })}
            >
              <option value="">General (No specific skill)</option>
              {allSkills.map(s => (
                <option key={s.id} value={s.id}>{s.skill_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Goal Title *</label>
            <input
              id="modal-goal-title"
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="e.g. Practice Guitar for 30 hours"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Target Value *</label>
              <input
                id="modal-goal-target"
                type="number"
                min="0.1"
                step="0.1"
                value={newGoal.target_value}
                onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Unit</label>
              <input
                id="modal-goal-unit"
                type="text"
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                placeholder="hours, sessions"
                required
              />
            </div>
          </div>
          <button id="modal-goal-submit" type="submit" className="btn btn-primary" disabled={actionLoading} style={{ marginTop: '0.5rem' }}>
            {actionLoading ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
