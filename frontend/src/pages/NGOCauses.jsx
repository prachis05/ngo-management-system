import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const formatINR = (num) => '₹' + Number(num).toLocaleString('en-IN');

const NGOCauses = () => {
    const { id: ngoId } = useParams();
    const { user } = useContext(AuthContext);
    const [causes, setCauses] = useState([]);
    const [ngoDetails, setNgoDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [donationAmount, setDonationAmount] = useState({});
    const [isRecurring, setIsRecurring] = useState({});

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchCausesAndNGO();
    }, [ngoId]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCausesAndNGO = async () => {
        setLoading(true);
        try {
            // We could fetch NGO details if needed, for now we will just get the causes
            // To get NGO name we could fetch user by ID or rely on the causes if we populate it
            // For simplicity, we just fetch causes.
            const { data } = await axios.get(`http://localhost:5000/api/causes/ngo/${ngoId}`, config);
            setCauses(data);
        } catch (error) {
            console.error(error);
            showToast('Error fetching causes', 'error');
        }
        setLoading(false);
    };

    const handleAmountChange = (causeId, amount) => {
        setDonationAmount({ ...donationAmount, [causeId]: amount });
    };

    const handleRecurringChange = (causeId, checked) => {
        setIsRecurring({ ...isRecurring, [causeId]: checked });
    };

    const handleDonate = async (cause) => {
        const amount = donationAmount[cause._id];
        const recurring = isRecurring[cause._id] || false;
        
        if (!amount || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            const donationData = {
                amount,
                ngoId: cause.ngoId,
                causeId: cause._id,
                campaign: cause.title,
                isRecurring: recurring,
                frequency: recurring ? 'Monthly' : 'One-Time'
            };

            await axios.post('http://localhost:5000/api/donations', donationData, config);
            showToast(` Successfully set up ${recurring ? 'monthly' : 'one-time'} donation of ${formatINR(amount)} to ${cause.title}!`, 'success');
            
            // Clear input and refresh causes to update raised amount
            setDonationAmount({ ...donationAmount, [cause._id]: '' });
            setIsRecurring({ ...isRecurring, [cause._id]: false });
            fetchCausesAndNGO();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error processing donation', 'error');
        }
    };

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
            
            <div className="page-header">
                <span className="icon"></span>
                <h2>Campaigns & Causes</h2>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Support specific causes and make a direct impact.
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading Causes...</div>
            ) : causes.length === 0 ? (
                <div className="form-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No active causes found for this NGO.
                </div>
            ) : (
                <div className="ngo-cards-grid">
                    {causes.map((cause) => {
                        const progress = Math.min((cause.raisedAmount / cause.targetAmount) * 100, 100).toFixed(1);
                        const placeholderImage = 'https://via.placeholder.com/400x200?text=Support+This+Cause';
                        const imageUrl = cause.image ? `http://localhost:5000${cause.image}` : placeholderImage;
                        
                        return (
                            <div key={cause._id} className="card ngo-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '160px', width: '100%', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                                        {cause.title}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', flexGrow: 1 }}>
                                        {cause.description || 'No description provided.'}
                                    </p>
                                    
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                                            <span>Raised: {formatINR(cause.raisedAmount)}</span>
                                            <span>Target: {formatINR(cause.targetAmount)}</span>
                                        </div>
                                        <div style={{ height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--success-color)' }}></div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {progress}% Funded
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <input 
                                                type="checkbox" 
                                                id={`recurring-${cause._id}`}
                                                checked={isRecurring[cause._id] || false}
                                                onChange={(e) => handleRecurringChange(cause._id, e.target.checked)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label htmlFor={`recurring-${cause._id}`} style={{ margin: 0, cursor: 'pointer', fontWeight: 500, color: 'var(--text-muted)' }}>
                                                Make this a monthly donation
                                            </label>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input 
                                                type="number" 
                                                placeholder="Amount (₹)" 
                                                value={donationAmount[cause._id] || ''}
                                                onChange={(e) => handleAmountChange(cause._id, e.target.value)}
                                                style={{ width: '40%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                                            />
                                            <button 
                                                onClick={() => handleDonate(cause)}
                                                className="btn-primary" 
                                                style={{ width: '60%', padding: '0.75rem' }}
                                            >
                                                {isRecurring[cause._id] ? 'Setup Monthly' : 'Donate to Cause'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NGOCauses;
