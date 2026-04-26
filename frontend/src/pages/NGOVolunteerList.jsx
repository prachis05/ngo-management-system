import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NGOVolunteerList = () => {
    const { user } = useContext(AuthContext);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchNGOVolunteers = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/ngo/volunteers', config);
                // Remove duplicates if the volunteer is assigned to multiple events
                const uniqueVolunteers = Array.from(new Set(data.map(v => v._id)))
                    .map(id => data.find(v => v._id === id));
                setVolunteers(uniqueVolunteers);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchNGOVolunteers();
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Event Volunteers...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>NGO Control Panel: Volunteers</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage volunteers participating in your events</p>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Joined Events</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.map(v => (
                            <tr key={v._id}>
                                <td style={{ fontWeight: 600 }}>{v.name}</td>
                                <td>{v.email}</td>
                                <td>
                                    <span className={`badge ${v.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td>{v.assignedEvents?.length || 0} Events</td>
                                <td>
                                    <Link to={`/ngo/volunteer/${v._id}`} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                         View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {volunteers.length === 0 && (
                            <tr><td colSpan="5" className="table-empty">No volunteers have joined your events yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NGOVolunteerList;
