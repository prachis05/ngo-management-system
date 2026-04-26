import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AdminVerifications = () => {
    const { user } = useContext(AuthContext);
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/pending-verifications', config);
            setPending(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/admin/${action}-verification/${id}`, {}, config);
            setPending(pending.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} verification`);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading verification queue...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon">️</span>
                <div>
                    <h2>Identity Verifications</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review identity proofs to verify NGOs and Volunteers</p>
                </div>
            </div>

            {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--dark)' }}>No Pending Verifications</h3>
                    <p>All queue requests have been handled.</p>
                </div>
            ) : (
                <div className="grid-cards">
                    {pending.map(record => (
                        <div key={record._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{record.name}</h4>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{record.email}</span>
                                </div>
                                <span className={`badge ${record.role === 'NGO' ? 'badge-primary' : 'badge-info'}`}>
                                    {record.role}
                                </span>
                            </div>
                            
                            {record.role === 'NGO' && (
                                <div style={{ background: 'var(--bg-lighter)', padding: '8px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <strong>NGO Target:</strong> {record.ngoName}
                                </div>
                            )}

                            <div style={{ margin: '1rem 0' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID Proof Document:</label>
                                {record.idProof ? (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <a href={`http://localhost:5000/uploads/${record.idProof}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem', fontSize: '0.85rem' }}>
                                             View Document
                                        </a>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>No Document Uploaded</div>
                                )}
                            </div>
                            
                            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-success" onClick={() => handleAction(record._id, 'approve')} style={{ flex: 1 }}>
                                     Approve
                                </button>
                                <button className="btn btn-danger" onClick={() => handleAction(record._id, 'reject')} style={{ flex: 1 }}>
                                     Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
