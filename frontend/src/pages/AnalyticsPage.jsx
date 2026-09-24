import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import StatCard from '../components/StatCard';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  Clock,
  Flame,
  Award,
  Target,
  Sparkles,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [dashRes, practiceRes, skillsRes] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getPracticeAnalytics(),
          analyticsApi.getSkillsAnalytics()
        ]);

        setData({
          summary: practiceRes.data.summary,
          weekly_trend: practiceRes.data.weekly_trend,
          monthly_trend: practiceRes.data.monthly_trend,
          hours_by_skill: skillsRes.data.hours_by_skill,
          goal_stats: skillsRes.data.goal_stats,
          skill_distribution: skillsRes.data.skill_distribution
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading analytics...</div>;
  }

  const summary = data?.summary || {};

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Personal Learning Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Data-driven insights into your practice hours, streak habits, and skill mastery.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Total Practice"
          value={summary.total_practice_hours || 0}
          unit="hrs"
          icon={Clock}
          color="var(--primary)"
          subtitle={`${summary.monthly_practice_hours || 0} hrs this month`}
        />
        <StatCard
          title="Weekly Trend"
          value={summary.weekly_practice_hours || 0}
          unit="hrs"
          icon={TrendingUp}
          color="var(--secondary)"
          subtitle="Past 7 days"
        />
        <StatCard
          title="Practice Streak"
          value={summary.current_streak || 0}
          unit="days"
          icon={Flame}
          color="#f97316"
          subtitle={`Best: ${summary.longest_streak || 0} days`}
        />
        <StatCard
          title="Most Practiced"
          value={summary.most_practiced_skill || 'None'}
          icon={Sparkles}
          color="var(--success)"
          subtitle={`${summary.milestones_achieved || 0} milestones unlocked`}
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
        {/* Chart 1: Practice Hours by Skill */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--primary)" /> Practice Hours by Skill
          </h2>
          <div style={{ height: '260px' }}>
            {(!data?.hours_by_skill || data.hours_by_skill.length === 0) ? (
              <p style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--text-light)' }}>No practice records yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hours_by_skill}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
                  <YAxis unit="h" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Practice Time']} />
                  <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Weekly Practice Trend */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--secondary)" /> Daily Practice Trend (Past 7 Days)
          </h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.weekly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis unit="h" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} hrs`, 'Practice']} />
                <Line type="monotone" dataKey="hours" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Practice Trend */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--success)" /> Monthly Practice Progress (Past 4 Weeks)
          </h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis unit="h" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`${value} hrs`, 'Hours']} />
                <Bar dataKey="hours" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Skill Distribution by Category */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={18} color="#ec4899" /> Skill Category Distribution
          </h2>
          <div style={{ height: '260px' }}>
            {(!data?.skill_distribution || data.skill_distribution.length === 0) ? (
              <p style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--text-light)' }}>No skills categorized yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.skill_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.skill_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
