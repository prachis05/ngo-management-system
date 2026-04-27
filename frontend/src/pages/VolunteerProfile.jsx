import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

/* ─── Volunteer FAQ data ──────────────────────────────── */
const VOLUNTEER_FAQ = [
    {
        q: 'How do I join an event?',
        a: 'Browse available events from your dashboard or the Events section. Click on any event and select "Register". Once the NGO confirms your spot, the event will appear in your activity list.',
    },
    {
        q: 'How are tasks assigned to me?',
        a: 'Tasks are assigned by the NGO coordinator after you register for an event. You will see all assigned tasks in the "My Tasks" section of this page along with their current status.',
    },
    {
        q: 'How do I update my skills or profile information?',
        a: 'Contact your NGO coordinator or the system administrator to request a profile update. Skill updates may be made directly from the settings section once that feature is available.',
    },
    {
        q: 'What should I do if I cannot attend a registered event?',
        a: 'Notify the NGO coordinator as early as possible through the contact information listed on the event page. Timely communication helps the NGO reassign tasks and plan accordingly.',
    },
    {
        q: 'How do I contact the NGO I am working with?',
        a: 'The contact details of the NGO are available on the event page and in the NGO directory under "Browse NGOs". You can reach them directly via the email listed on their profile.',
    },
    {
        q: 'Will I receive a certificate or proof of volunteering?',
        a: 'Certificates of participation are issued at the discretion of the NGO after an event is marked as completed. Check with your NGO coordinator for their specific process.',
    },
    {
        q: 'Can I volunteer with more than one NGO at the same time?',
        a: 'Yes. You can register for events from multiple NGOs simultaneously. Your complete activity history across all NGOs is visible in the "NGOs You Have Helped" section below.',
    },
];

/* ─── FAQ accordion item ──────────────────────────────── */
const FaqItem = ({ item }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`faq-item${open ? ' faq-open' : ''}`}>
            <button
                className="faq-question"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span>{item.q}</span>
                <span className="faq-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="faq-answer">{item.a}</div>}
        </div>
    );
};

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

    const { volunteer, events, tasks, ngosWorkedWith } = details;

    console.log(user);

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>My Volunteer Insights</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Drill down into your participation, tasks, and historical impact.</p>
                </div>
            </div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>My Profile</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                    <div>
                        <strong>Name:</strong>
                        <p>{user?.name || 'N/A'}</p>
                    </div>

                    <div>
                        <strong>Email:</strong>
                        <p>{user?.email || 'N/A'}</p>
                    </div>

                    <div>
                        <strong>City:</strong>
                        <p>{volunteer?.city || 'N/A'}</p>
                    </div>

                    <div>
                        <strong>Phone:</strong>
                        <p>{volunteer?.phone || 'N/A'}</p>
                    </div>

                    <div style={{ gridColumn: '1 / span 2' }}>
                        <strong>Skills:</strong>
                        <p>
                            {volunteer?.skills && volunteer.skills.length > 0
                                ? volunteer.skills.join(', ')
                                : 'No skills added'}
                        </p>
                    </div>

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

            {/* ── Volunteer FAQ ── */}
            <div className="faq-section">
                <div className="faq-section-header">
                    <h3>Frequently Asked Questions</h3>
                    <p>Common questions about volunteering, tasks, and participation.</p>
                </div>
                <div className="faq-list">
                    {VOLUNTEER_FAQ.map((item, i) => (
                        <FaqItem key={i} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VolunteerProfile;
