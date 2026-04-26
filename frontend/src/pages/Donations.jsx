import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const formatINR = (num) => '₹' + Number(num).toLocaleString('en-IN');

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
    const map = {
        'Completed': 'badge-success',
        'Pending':   'badge-warning',
        'Failed':    'badge-danger',
    };
    return map[status] || 'badge-default';
};

const Donations = () => {
    const { user } = useContext(AuthContext);
    const [donations, setDonations] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [formData, setFormData] = useState({ amount: '', campaign: '', ngoId: '', isRecurring: false });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    useEffect(() => {
        fetchDonations();
        if (user.role === 'Donor' || user.role === 'Admin') {
            fetchNGOs();
        }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchDonations = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations', config);
            setDonations(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations/ngos', config);
            setNgos(data);
        } catch (error) {
            console.error(error);
        }
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
            showToast(' Donation successful! Thank you for your contribution.', 'success');
            setFormData({ amount: '', campaign: '', ngoId: '', isRecurring: false });
            fetchDonations();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error processing donation', 'error');
        }
        setLoading(false);
    };

    const isDisabled = !formData.amount || !formData.campaign || !formData.ngoId || loading;
    const showForm = user.role === 'Donor' || user.role === 'Admin';

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon"></span>
                <h2>{user.role === 'NGO' ? 'Donations Received' : 'Donations'}</h2>
            </div>

            {/* Donation Form - Only for Donors and Admin */}
            {showForm && (
                <div className="form-card" style={{ maxWidth: '520px' }}>
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
                            <label>Campaign Name</label>
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
                                id="isRecurring"
                                checked={formData.isRecurring}
                                onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                                style={{ width: 'auto', cursor: 'pointer' }}
                            />
                            <label htmlFor="isRecurring" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>Make this a monthly donation</label>
                        </div>
                        <button type="submit" className="btn-primary" disabled={isDisabled}>
                            {loading ? ' Processing...' : formData.isRecurring ? ' Setup Monthly Donation' : ' Donate Now'}
                        </button>
                    </form>
                </div>
            )}

            {/* Donation History */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 {user.role === 'Admin' ? 'All Donations' : user.role === 'NGO' ? 'Donations to My NGO' : 'My Donation History'}
            </h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            {(user.role === 'Admin' || user.role === 'NGO') && <th>Donor</th>}
                            {user.role !== 'NGO' && <th>NGO</th>}
                            <th>Campaign</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            {user.role === 'Donor' && <th>Receipt</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(d => (
                            <tr key={d._id}>
                                {(user.role === 'Admin' || user.role === 'NGO') && <td style={{ fontWeight: 500 }}>{d.donorName}</td>}
                                {user.role !== 'NGO' && <td>️ {d.ngoName || 'General'}</td>}
                                <td>{d.campaign}</td>
                                <td>
                                    <span className={`badge ${d.isRecurring ? 'badge-info' : 'badge-default'}`}>
                                        {d.isRecurring ? 'Monthly' : 'One-Time'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{formatINR(d.amount)}{d.isRecurring ? '/mo' : ''}</td>
                                <td><span className={`badge ${statusBadge(d.status)}`}>{d.status}</span></td>
                                <td>{formatDate(d.createdAt)}</td>
                                {user.role === 'Donor' && (
                                    <td>
                                        <Link to={`/donations/${d._id}`} className="btn btn-sm btn-secondary">
                                             View Receipt
                                        </Link>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {donations.length === 0 && (
                            <tr><td colSpan={user.role === 'Donor' ? 7 : 7} className="table-empty">No donations found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Donations;
