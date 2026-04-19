import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
    const map = {
        'Upcoming':  'badge-info',
        'Ongoing':   'badge-warning',
        'Completed': 'badge-success',
        'Cancelled': 'badge-danger',
    };
    return map[status] || 'badge-default';
};

const Events = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', status: 'Upcoming' });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const canManage = user.role === 'Admin' || user.role === 'NGO';

    useEffect(() => {
        fetchEvents();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/events', config);
            setEvents(data);
        } catch (err) { console.error(err); }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editId) {
                await axios.put(`http://localhost:5000/api/events/${editId}`, formData, config);
                showToast('✅ Event updated!');
            } else {
                await axios.post('http://localhost:5000/api/events', formData, config);
                showToast('🎉 Event created!');
            }
            setFormData({ title: '', description: '', date: '', location: '', status: 'Upcoming' });
            setEditId(null);
            fetchEvents();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error saving event', 'error');
        }
        setLoading(false);
    };

    const handleEdit = (ev) => {
        setEditId(ev._id);
        setFormData({
            title: ev.title, description: ev.description,
            date: ev.date.split('T')[0], location: ev.location,
            status: ev.status,
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${id}`, config);
                showToast('Event deleted');
                fetchEvents();
            } catch (err) { showToast('Error deleting', 'error'); }
        }
    };

    const handleJoin = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/events/${id}/join`, {}, config);
            showToast('🎉 Successfully joined event!');
            fetchEvents();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error joining event', 'error');
        }
    };

    const isJoined = (event) => {
        return event.volunteersAssigned?.some(v => v._id === user._id || v === user._id);
    };

    const isDisabled = !formData.title || !formData.date || !formData.location || !formData.description || loading;

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon">📅</span>
                <h2>Event Management</h2>
            </div>
            
            {canManage && (
                <div className="form-card">
                    <h3>{editId ? '✏️ Edit Event' : '➕ Create Event'}</h3>
                    <form onSubmit={onSubmit}>
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
                                <input type="text" placeholder="Delhi" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option>Upcoming</option>
                                    <option>Ongoing</option>
                                    <option>Completed</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" placeholder="Describe the event..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isDisabled}>
                                {loading ? '⏳ Saving...' : (editId ? '💾 Update Event' : '➕ Create Event')}
                            </button>
                            {editId && (
                                <button type="button" className="btn btn-secondary" onClick={() => {setEditId(null); setFormData({title: '', description: '', date: '', location: '', status: 'Upcoming'});}}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>NGO</th>
                            <th>Status</th>
                            <th>Volunteers</th>
                            {(canManage || user.role === 'Volunteer') && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev._id}>
                                <td>
                                    <strong>{ev.title}</strong>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{ev.description}</div>
                                </td>
                                <td>{formatDate(ev.date)}</td>
                                <td>📍 {ev.location}</td>
                                <td>{ev.createdBy?.ngoName || ev.createdBy?.name || '-'}</td>
                                <td><span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span></td>
                                <td>
                                    {ev.volunteersAssigned?.map(v => v.name).join(', ') || <span style={{ color: 'var(--text-muted)' }}>None</span>}
                                </td>
                                {(canManage || user.role === 'Volunteer') && (
                                    <td>
                                        {canManage && (
                                            <>
                                                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(ev)} style={{ marginRight: '0.4rem' }}>✏️ Edit</button>
                                                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(ev._id)}>🗑️ Delete</button>
                                            </>
                                        )}
                                        {user.role === 'Volunteer' && !isJoined(ev) && (ev.status === 'Upcoming' || ev.status === 'Ongoing') && (
                                            <button className="btn btn-sm btn-success" onClick={() => handleJoin(ev._id)}>🙋 Join</button>
                                        )}
                                        {user.role === 'Volunteer' && isJoined(ev) && (
                                            <span className="badge badge-success">✅ Joined</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {events.length === 0 && <tr><td colSpan="7" className="table-empty">No events found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Events;
