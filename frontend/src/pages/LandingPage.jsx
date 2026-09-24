import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Clock,
  BarChart3,
  Users,
  CheckCircle,
  Cloud,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const benefits = [
    {
      icon: Sparkles,
      title: "Track Any Skill or Hobby",
      desc: "Manage coding, musical instruments, photography, fitness, writing, and custom hobbies with skill levels."
    },
    {
      icon: Target,
      title: "Set Goals & Milestones",
      desc: "Define target hours or practice goals. Step-by-step milestones automatically unlock as you practice."
    },
    {
      icon: Clock,
      title: "Record Practice & Streaks",
      desc: "Log daily sessions with notes and durations. Build consecutive-day practice streaks to cement consistency."
    },
    {
      icon: BarChart3,
      title: "Visual Progress Analytics",
      desc: "Interactive visual charts break down practice hours by skill, weekly trends, and completion rates."
    },
    {
      icon: Cloud,
      title: "Cloud-Powered Storage",
      desc: "Attach certificate photos and proof of achievement securely stored with cloud object storage."
    },
    {
      icon: Users,
      title: "Community Social Sharing",
      desc: "Share your achievements with peers in the community feed. Like, comment, and celebrate milestones together."
    }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          <Cloud size={16} /> Cloud Computing Demonstration Project
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
          fontWeight: '800',
          color: 'var(--text-main)',
          lineHeight: '1.2',
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem'
        }}>
          Online Hobby & Skills Tracker <br />
          <span style={{ color: 'var(--primary)' }}>with Community Sharing</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
          color: 'var(--text-muted)',
          maxWidth: '750px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          Track your skills, build better habits, achieve your goals, and share your progress with a community. Built on cloud-ready architecture with seamless authentication, object storage, and analytics.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }} id="hero-btn-get-started">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }} id="hero-btn-login">
            Sign In
          </Link>
          <Link to="/community" className="btn btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }} id="hero-btn-community">
            Explore Community
          </Link>
        </div>
      </section>

      {/* Benefits Grid */}
      <section style={{
        backgroundColor: 'var(--bg-main)',
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Everything You Need to Master Your Passion
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive hobby and skill management with real database metrics and cloud persistence.
            </p>
          </div>

          <div className="grid-cols-3">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="card" style={{ padding: '2rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.65rem' }}>{b.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cloud Architecture Highlights */}
      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem' }}>
          Engineered for Scalable Cloud Deployment
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          Demonstrates modular REST services, JWT and Firebase Authentication abstractions, SQLite to Firestore cloud storage migration, and automated streak calculation algorithms.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={20} color="var(--success)" /> FastAPI & Python REST
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={20} color="var(--success)" /> React & Vite Frontend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={20} color="var(--success)" /> Cloud Object Storage
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={20} color="var(--success)" /> Google Cloud Run Ready
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-light)',
        fontSize: '0.9rem'
      }}>
        <p>© 2026 SkillPulse Cloud Hobby & Skills Tracker • Final Year CSE Demonstration Project</p>
      </footer>
    </div>
  );
};

export default LandingPage;
