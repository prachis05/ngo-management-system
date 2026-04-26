import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const VolunteerProfile = () => {
    const { user } = useContext(AuthContext);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/volunteers/me/dashboard', config);
                setDetails(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Personal Profile...</div>;
    if (!details) return <div className="container" style={{ padding: '2rem', color: 'red' }}>Error loading data.</div>;

    const { events, tasks, ngosWorkedWith } = details;

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>My Volunteer Insights</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Drill down into your participation, tasks, and historical impact.</p>
                </div>
            </div>

            <div className="stat-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card indigo">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Events Joined</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{events.length}</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Tasks Handled</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{tasks.length}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">️</div>
                    <div className="stat-label">NGOs Supported</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{ngosWorkedWith.length}</div>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-card">
                    <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}> My Event History</h3>
                    {events.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                            {events.map(e => (
                                <li key={e._id} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-lighter)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{e.title}</div>
                                        <span className={`badge ${e.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>{e.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        Organized by: ️ {e.createdBy?.ngoName || e.createdBy?.name || 'Unknown'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                                        {new Date(e.date).toLocaleDateString('en-IN')} •  {e.location}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't joined any events yet.</p>
                    )}
                </div>

                <div className="form-card">
                    <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}> My Tasks</h3>
                    {tasks.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                            {tasks.map(t => (
                                <li key={t._id} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-lighter)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                                        <span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Event: {t.eventId?.title || 'General'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No specific tasks assigned yet.</p>
                    )}
                </div>
            </div>

            {ngosWorkedWith.length > 0 && (
                <div className="form-card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}> NGOs You Have Helped</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {ngosWorkedWith.map((ngo, idx) => (
                            <span key={idx} style={{ background: 'var(--bg-lighter)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 500, border: '1px solid var(--border)' }}>
                                {ngo}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerProfile;
