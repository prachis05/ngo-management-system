import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminVolunteerList = () => {
    const { user } = useContext(AuthContext);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/admin/volunteers', config);
                setVolunteers(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchAll();
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Volunteers...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>Volunteer Insights & Activity Monitor</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Track volunteer engagement across NGOs, events, and tasks</p>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Skills</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.map(v => (
                            <tr key={v._id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}> {v.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        {v.city || 'Unknown'} • {v.createdAt ? `Joined ${new Date(v.createdAt).getFullYear()}` : ''}
                                    </div>
                                </td>
                                <td>{v.email}</td>
                                <td>
                                    <span className={`badge ${v.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {v.skills?.slice(0, 3).map((s, i) => (
                                            <span key={i} style={{ background: 'var(--bg-lighter)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{s}</span>
                                        ))}
                                        {v.skills?.length > 3 && <span style={{ fontSize: '0.8rem' }}>+{v.skills.length - 3} more</span>}
                                    </div>
                                </td>
                                <td>
                                    <Link
                                        to={`/admin/volunteer/${v._id}`}
                                        className="btn btn-secondary"
                                        style={{
                                            fontSize: '0.85rem',
                                            padding: '0.4rem 0.8rem',
                                            backgroundColor: '#1e3a8a',
                                            color: 'white',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        Open Profile →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {volunteers.length === 0 && (
                            <tr><td colSpan="5" className="table-empty">No volunteers found in the system.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminVolunteerList;
