import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NGOVolunteerDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/ngo/volunteer/${id}`, config);
                setDetails(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Volunteer Insights...</div>;
    if (!details) return <div className="container" style={{ padding: '2rem', color: 'red' }}>Error loading volunteer.</div>;

    const { volunteer, events, tasks } = details;

    return (
        <div className="container">
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/ngo/volunteers" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to My Volunteers
                </Link>
            </div>

            <div className="page-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0 }}>Volunteer Insights: {volunteer.name}</h2>
                        <span className={`badge ${volunteer.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                            {volunteer.status}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>{volunteer.email}</p>
                </div>
            </div>

            <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Events Section */}
                <div className="form-card">
                    <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}> Participated in My Events</h3>
                    {events.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {events.map(e => (
                                <li key={e._id} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-lighter)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{e.title}</div>
                                        <span className={`badge ${e.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>{e.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                                        {new Date(e.date).toLocaleDateString('en-IN')} •  {e.location}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This volunteer hasn't joined any events yet.</p>
                    )}
                </div>

                {/* Tasks Section */}
                <div className="form-card">
                    <h3 style={{ borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}> Task Assignments (My Events)</h3>
                    {tasks.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No specific tasks assigned for your events.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NGOVolunteerDetail;
