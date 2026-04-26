import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const formatINR = (num) => {
    if (num === undefined || num === null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DonorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({});
    const [ngos, setNgos] = useState([]);
    const [donations, setDonations] = useState([]);
    const [formData, setFormData] = useState({ amount: '', campaign: '', ngoId: '', isRecurring: false });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchStats();
        fetchNGOs();
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

    const fetchNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations/ngos', config);
            setNgos(data);
        } catch (err) { console.error(err); }
    };

    const fetchDonations = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations', config);
            setDonations(data);
        } catch (err) { console.error(err); }
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                frequency: formData.isRecurring ? 'Monthly' : 'One-Time'
            };
            await axios.post('http://localhost:5000/api/donations', payload, config);
            showToast(' Donation successful! Thank you for your generosity.');
            setFormData({ amount: '', campaign: '', ngoId: '', isRecurring: false });
            fetchDonations();
            fetchStats();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error processing donation', 'error');
        }
        setLoading(false);
    };

    const isDisabled = !formData.amount || !formData.campaign || !formData.ngoId || loading;

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>Donor Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome, {user.name} — Your generosity makes a difference!</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card green">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Donated</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{formatINR(stats.totalDonated)}</div>
                </div>
                <div className="stat-card indigo">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Donations Made</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.donationCount || 0}</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon">️</div>
                    <div className="stat-label">Available NGOs</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.availableNGOs || 0}</div>
                </div>
            </div>

            {/* Quick Donate */}
            <div className="form-card" style={{ marginTop: '2rem', maxWidth: '560px' }}>
                <h3> Make a Donation</h3>
                <form onSubmit={handleDonate}>
                    <div className="form-group">
                        <label>Select NGO</label>
                        <select value={formData.ngoId} onChange={e => setFormData({...formData, ngoId: e.target.value})} required>
                            <option value="">Choose an NGO...</option>
                            {ngos.map(n => (
                                <option key={n._id} value={n._id}>{n.ngoName || n.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Campaign / Purpose</label>
                        <input type="text" placeholder="e.g. Clean Water Initiative" value={formData.campaign} onChange={e => setFormData({...formData, campaign: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" placeholder="1000" min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label>UPI / Card Number (Mock)</label>
                        <input type="text" placeholder="user@upi or 1111-2222-3333-4444" required />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <input 
                            type="checkbox" 
                            id="isRecurringDashboard"
                            checked={formData.isRecurring}
                            onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                            style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <label htmlFor="isRecurringDashboard" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>Make this a monthly donation</label>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isDisabled}>
                        {loading ? ' Processing...' : formData.isRecurring ? ' Setup Monthly Donation' : ' Donate Now'}
                    </button>
                </form>
            </div>

            {/* My Donation History */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> My Donation History</h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>NGO</th>
                            <th>Campaign</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(d => (
                            <tr key={d._id}>
                                <td style={{ fontWeight: 500 }}>️ {d.ngoName || 'General'}</td>
                                <td>{d.campaign}</td>
                                <td>
                                    <span className={`badge ${d.isRecurring ? 'badge-info' : 'badge-default'}`}>
                                        {d.isRecurring ? 'Monthly' : 'One-Time'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{formatINR(d.amount)}{d.isRecurring ? '/mo' : ''}</td>
                                <td><span className={`badge ${d.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                                <td>{formatDate(d.createdAt)}</td>
                                <td>
                                    <Link to={`/donations/${d._id}`} className="btn btn-sm btn-secondary">
                                         Receipt
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {donations.length === 0 && <tr><td colSpan="7" className="table-empty">No donations yet. Make your first donation above!</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DonorDashboard;
