import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const statusBadge = (status) => {
    const map = {
        'Available': 'badge-success',
        'Assigned':  'badge-info',
        'Inactive':  'badge-default',
    };
    return map[status] || 'badge-default';
};

const Volunteers = () => {
    const { user } = useContext(AuthContext);
    const [volunteers, setVolunteers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', skills: '', status: 'Available' });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchVolunteers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/volunteers', config);
            setVolunteers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...formData, skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean) };
        try {
            if (editId) {
                await axios.put(`http://localhost:5000/api/volunteers/${editId}`, payload, config);
                showToast(' Volunteer updated!');
            } else {
                await axios.post('http://localhost:5000/api/volunteers', payload, config);
                showToast(' Volunteer added!');
            }
            setFormData({ name: '', email: '', skills: '', status: 'Available' });
            setEditId(null);
            fetchVolunteers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error saving volunteer', 'error');
        }
        setLoading(false);
    };

    const handleEdit = (v) => {
        setEditId(v._id);
        setFormData({ name: v.name, email: v.email, skills: v.skills.join(', '), status: v.status });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this volunteer?')) {
            try {
                await axios.delete(`http://localhost:5000/api/volunteers/${id}`, config);
                showToast('Volunteer removed');
                fetchVolunteers();
            } catch (error) {
                showToast('Error deleting', 'error');
            }
        }
    };

    const isDisabled = !formData.name || !formData.email || loading;
    const canManage = user.role === 'Admin';

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon"></span>
                <h2>Volunteer Management</h2>
            </div>
            
            {canManage && (
                <div className="form-card">
                    <h3>{editId ? '️ Edit Volunteer' : ' Add Volunteer'}</h3>
                    <form onSubmit={onSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Skills (comma separated)</label>
                                <input type="text" placeholder="Teaching, First Aid, Cooking" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option>Available</option>
                                    <option>Assigned</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isDisabled}>
                                {loading ? ' Saving...' : (editId ? ' Update' : ' Add Volunteer')}
                            </button>
                            {editId && (
                                <button type="button" className="btn btn-secondary" onClick={() => {setEditId(null); setFormData({name: '', email: '', skills: '', status: 'Available'});}}>
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
                            <th>Name</th>
                            <th>Email</th>
                            <th>Skills</th>
                            <th>Status</th>
                            {canManage && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.map(v => (
                            <tr key={v._id}>
                                <td style={{ fontWeight: 600 }}>{v.name}</td>
                                <td>{v.email}</td>
                                <td>
                                    {v.skills.map((s, i) => (
                                        <span key={i} className="badge badge-default" style={{ marginRight: '0.3rem', marginBottom: '0.2rem' }}>{s}</span>
                                    ))}
                                </td>
                                <td><span className={`badge ${statusBadge(v.status)}`}>{v.status}</span></td>
                                {canManage && (
                                    <td>
                                        <button className="btn btn-sm btn-edit" onClick={() => handleEdit(v)} style={{ marginRight: '0.4rem' }}>️ Edit</button>
                                        <button className="btn btn-sm btn-delete" onClick={() => handleDelete(v._id)}>️ Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {volunteers.length === 0 && <tr><td colSpan="5" className="table-empty">No volunteers found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Volunteers;
