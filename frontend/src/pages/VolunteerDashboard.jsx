import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
    const map = { 'Upcoming': 'badge-info', 'Ongoing': 'badge-warning', 'Completed': 'badge-success', 'Cancelled': 'badge-danger' };
    return map[status] || 'badge-default';
};

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({});
    const [allEvents, setAllEvents] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [toast, setToast] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchStats();
        fetchEvents();
        fetchTasks();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/dashboard', config);
            setStats(data);
        } catch (err) { console.error(err); }
    };

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/events', config);
            setAllEvents(data);
        } catch (err) { console.error(err); }
    };

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/tasks', config);
            // Show only my tasks
            setMyTasks(data.filter(t => t.assignedTo?._id === user._id || t.assignedTo === user._id));
        } catch (err) { console.error(err); }
    };

    const handleJoin = async (eventId) => {
        try {
            await axios.post(`http://localhost:5000/api/events/${eventId}/join`, {}, config);
            showToast(' Successfully joined the event!');
            fetchEvents();
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error joining event', 'error');
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, config);
            fetchTasks();
            fetchStats();
        } catch (err) { console.error(err); }
    };

    const isJoined = (event) => {
        return event.volunteersAssigned?.some(v => v._id === user._id || v === user._id);
    };

    // Separate joined and available events
    const joinedEvents = allEvents.filter(e => isJoined(e));
    const availableEvents = allEvents.filter(e => !isJoined(e) && (e.status === 'Upcoming' || e.status === 'Ongoing'));

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>Volunteer Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome, {user.name} — Thank you for volunteering!</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card indigo">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Events Joined</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.joinedEvents || 0}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon"></div>
                    <div className="stat-label">My Tasks</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.myTasks || 0}</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Completed Tasks</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.completedTasks || 0}</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Available Events</div>
                    <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.availableEvents || 0}</div>
                </div>
            </div>

            {/* Available Events to Join */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> Available Events</h3>
            {availableEvents.length > 0 ? (
                <div className="event-cards-grid">
                    {availableEvents.map(ev => (
                        <div key={ev._id} className="card" style={{ marginBottom: '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{ev.title}</h4>
                                <span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{ev.description}</p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                <span> {ev.location}</span> &nbsp;|&nbsp; <span> {formatDate(ev.date)}</span>
                                {ev.createdBy && <span> &nbsp;|&nbsp; ️ {ev.createdBy.ngoName || ev.createdBy.name}</span>}
                            </div>
                            <button className="btn btn-success btn-sm" onClick={() => handleJoin(ev._id)}> Join Event</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="form-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No available events to join right now
                </div>
            )}

            {/* My Joined Events */}
            {joinedEvents.length > 0 && (
                <>
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> My Joined Events</h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>NGO</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {joinedEvents.map(ev => (
                                    <tr key={ev._id}>
                                        <td style={{ fontWeight: 600 }}>{ev.title}</td>
                                        <td>{formatDate(ev.date)}</td>
                                        <td> {ev.location}</td>
                                        <td>{ev.createdBy?.ngoName || ev.createdBy?.name || '-'}</td>
                                        <td><span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* My Tasks */}
            {myTasks.length > 0 && (
                <>
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> My Assigned Tasks</h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTasks.map(t => (
                                    <tr key={t._id}>
                                        <td style={{ fontWeight: 600 }}>{t.title}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.description || '-'}</td>
                                        <td>
                                            <span className={`badge ${t.status === 'Done' ? 'badge-success' : t.status === 'In Progress' ? 'badge-info' : 'badge-default'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={t.status}
                                                onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}
                                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                                            >
                                                <option value="To Do"> To Do</option>
                                                <option value="In Progress"> In Progress</option>
                                                <option value="Done"> Done</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default VolunteerDashboard;
