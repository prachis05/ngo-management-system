import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const formatINR = (num) => {
    if (num === undefined || num === null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
    const map = { 'Upcoming': 'badge-info', 'Ongoing': 'badge-warning', 'Completed': 'badge-success', 'Cancelled': 'badge-danger' };
    return map[status] || 'badge-default';
};

const NGODashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({});
    const [events, setEvents] = useState([]);
    const [donations, setDonations] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', status: 'Upcoming' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchStats();
        fetchEvents();
        fetchDonations();
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
            setEvents(data);
        } catch (err) { console.error(err); }
    };

    const fetchDonations = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations', config);
            setDonations(data);
        } catch (err) { console.error(err); }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/events', formData, config);
            showToast('🎉 Event created successfully!');
            setFormData({ title: '', description: '', date: '', location: '', status: 'Upcoming' });
            fetchEvents();
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error creating event', 'error');
        }
        setLoading(false);
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Delete this event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${id}`, config);
                showToast('Event deleted');
                fetchEvents();
                fetchStats();
            } catch (err) { showToast('Error deleting event', 'error'); }
        }
    };

    const isDisabled = !formData.title || !formData.date || !formData.location || !formData.description || loading;

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon">🏛️</span>
                <div>
                    <h2>NGO Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.ngoName || user.name} — Managing your organization</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card indigo">
                    <div className="stat-icon">📅</div>
                    <div className="stat-label">My Events</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.myEvents || 0}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">💰</div>
                    <div className="stat-label">Donations Received</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{formatINR(stats.totalDonations)}</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon">🎁</div>
                    <div className="stat-label">Donation Count</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.donationCount || 0}</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon">🤝</div>
                    <div className="stat-label">Volunteers Engaged</div>
                    <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.volunteerCount || 0}</div>
                </div>
            </div>

            {/* Quick Create Event */}
            <div className="form-card" style={{ marginTop: '2rem' }}>
                <h3>➕ Create New Event</h3>
                <form onSubmit={handleCreateEvent}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Title</label>
                            <input type="text" placeholder="Community Cleanup" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Event Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" placeholder="Mumbai, Maharashtra" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option>Upcoming</option>
                                <option>Ongoing</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input type="text" placeholder="Describe the event..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isDisabled}>
                        {loading ? '⏳ Creating...' : '➕ Create Event'}
                    </button>
                </form>
            </div>

            {/* My Events */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📅 My Events</h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Volunteers</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev._id}>
                                <td>
                                    <strong>{ev.title}</strong>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.description}</div>
                                </td>
                                <td>{formatDate(ev.date)}</td>
                                <td>📍 {ev.location}</td>
                                <td><span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span></td>
                                <td>{ev.volunteersAssigned?.length || 0}</td>
                                <td>
                                    <button className="btn btn-sm btn-delete" onClick={() => handleDeleteEvent(ev._id)}>🗑️ Delete</button>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && <tr><td colSpan="6" className="table-empty">No events yet. Create one above!</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Donations Received */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>💰 Donations Received</h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Donor</th>
                            <th>Campaign</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(d => (
                            <tr key={d._id}>
                                <td style={{ fontWeight: 500 }}>{d.donorName}</td>
                                <td>{d.campaign}</td>
                                <td style={{ fontWeight: 600 }}>{formatINR(d.amount)}</td>
                                <td><span className={`badge ${d.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                                <td>{formatDate(d.createdAt)}</td>
                            </tr>
                        ))}
                        {donations.length === 0 && <tr><td colSpan="5" className="table-empty">No donations received yet</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NGODashboard;
