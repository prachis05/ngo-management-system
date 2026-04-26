import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const formatINR = (num) => {
    if (num === undefined || num === null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const DonationDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchDonation = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/donations/${id}/details`, config);
                setDonation(data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchDonation();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Donation Details...</div>;
    if (!donation) return <div className="container" style={{ padding: '2rem', color: 'red' }}>Donation not found or unauthorized.</div>;

    const getStatusBadge = (status) => {
        if (status === 'Completed') return 'badge-success';
        if (status === 'Pending') return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/donations" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    ← Back to My Donations
                </Link>
            </div>

            <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="icon" style={{ fontSize: '3rem', margin: '0 auto 1rem auto' }}></div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Donation Receipt</h2>
                    <span className={`badge ${getStatusBadge(donation.status)}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
                        {donation.status}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Contributed</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{formatINR(donation.amount)}{donation.isRecurring ? '/mo' : ''}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600 }}>{new Date(donation.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Campaign / Purpose</div>
                        <div style={{ fontWeight: 500 }}>{donation.campaign || 'General Donation'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Donation Type</div>
                        <div style={{ fontWeight: 500 }}>
                            <span className={`badge ${donation.isRecurring ? 'badge-info' : 'badge-default'}`}>
                                {donation.isRecurring ? 'Monthly Recurring' : 'One-Time'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Beneficiary Organization</div>
                        <div style={{ fontWeight: 500 }}>️ {donation.ngoName || 'Global NGO System Fund'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transaction ID</div>
                        <div style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.9rem' }}>{donation._id}</div>
                    </div>
                </div>
                
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => window.print()}>️ Print Receipt</button>
                </div>
            </div>
        </div>
    );
};

export default DonationDetail;
