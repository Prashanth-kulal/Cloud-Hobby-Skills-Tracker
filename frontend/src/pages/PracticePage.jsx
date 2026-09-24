import React, { useState, useEffect } from 'react';
import { practiceApi, skillsApi } from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import {
  Clock,
  Plus,
  Flame,
  Calendar,
  Trash2,
  Filter,
  CheckCircle,
  FileText
} from 'lucide-react';

const PracticePage = () => {
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('');

  // Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [form, setForm] = useState({
    skill_id: '',
    duration_minutes: 60,
    activity: '',
    notes: '',
    practiced_at: new Date().toISOString().slice(0, 10)
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, skillsRes, summaryRes] = await Promise.all([
        practiceApi.getPracticeHistory(selectedSkillFilter ? { skill_id: selectedSkillFilter } : {}),
        skillsApi.getSkills(),
        practiceApi.getSummary()
      ]);
      setSessions(sessionsRes.data);
      setSkills(skillsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSkillFilter]);

  const handleLogPractice = async (e) => {
    e.preventDefault();
    if (!form.skill_id) {
      alert('Please select a skill');
      return;
    }
    setSaving(true);
    try {
      await practiceApi.logPractice(form);
      setLogModalOpen(false);
      setForm({
        skill_id: skills.length > 0 ? skills[0].id : '',
        duration_minutes: 60,
        activity: '',
        notes: '',
        practiced_at: new Date().toISOString().slice(0, 10)
      });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording practice');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this practice entry?')) return;
    try {
      await practiceApi.deletePractice(id);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete practice');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Practice Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Record sessions, track daily consistency, and build unbroken practice streaks.
          </p>
        </div>

        <button
          id="btn-log-practice-page"
          className="btn btn-primary"
          onClick={() => {
            if (skills.length > 0 && !form.skill_id) {
              setForm(prev => ({ ...prev, skill_id: skills[0].id }));
            }
            setLogModalOpen(true);
          }}
        >
          <Plus size={18} /> Record Practice Session
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Today's Practice"
          value={summary?.today_hours || 0}
          unit="hrs"
          icon={Clock}
          color="var(--primary)"
          subtitle={`${summary?.today_minutes || 0} minutes`}
        />
        <StatCard
          title="This Week"
          value={summary?.this_week_hours || 0}
          unit="hrs"
          icon={Calendar}
          color="var(--secondary)"
          subtitle="Mon - Sun total"
        />
        <StatCard
          title="This Month"
          value={summary?.this_month_hours || 0}
          unit="hrs"
          icon={CheckCircle}
          color="var(--success)"
          subtitle="Calendar month"
        />
        <StatCard
          title="Practice Streak"
          value={summary?.current_streak || 0}
          unit={summary?.current_streak === 1 ? 'day' : 'days'}
          icon={Flame}
          color="#f97316"
          subtitle={`Best streak: ${summary?.longest_streak || 0} days`}
        />
      </div>

      {/* Filter and Session List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '600' }}>Session History</h2>

          {skills.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="">All Skills</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.skill_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <Clock size={40} color="var(--border-focus)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ fontWeight: '500' }}>No practice sessions logged yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
              Record your first practice session to start your streak!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Skill</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Activity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Notes</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {s.practiced_at ? new Date(s.practiced_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      {s.skill_name || 'Skill'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--primary)' }}>
                      {s.duration_minutes} mins ({round(s.duration_minutes / 60, 1)} hrs)
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {s.activity || '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                      {s.notes || '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        style={{ color: 'var(--danger)', padding: '0.3rem', cursor: 'pointer' }}
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Modal */}
      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title="Record Practice Session">
        <form onSubmit={handleLogPractice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Skill *</label>
            <select
              value={form.skill_id}
              onChange={(e) => setForm({ ...form, skill_id: e.target.value })}
              required
            >
              <option value="">Select skill</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>{s.skill_name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Duration (Minutes) *</label>
              <input
                id="input-practice-duration"
                type="number"
                min="1"
                max="1440"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Practice Date</label>
              <input
                type="date"
                value={form.practiced_at}
                onChange={(e) => setForm({ ...form, practiced_at: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Activity Title</label>
            <input
              id="input-practice-activity"
              type="text"
              value={form.activity}
              onChange={(e) => setForm({ ...form, activity: e.target.value })}
              placeholder="e.g. Practiced fingerstyle guitar drills"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>Notes & Reflections</label>
            <textarea
              id="input-practice-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Details on what was learned or practiced..."
            />
          </div>
          <button id="btn-submit-practice" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

function round(val, dec = 1) {
  return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
}

export default PracticePage;
