import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import placeholder1 from '../assets/placeholder1.jpg';
import placeholder2 from '../assets/placeholder2.jpg';
import placeholder3 from '../assets/placeholder3.webp';
import placeholder4 from '../assets/placeholder4.jpg';

const causePlaceholders = [placeholder1, placeholder2, placeholder3, placeholder4];
const formatINR = (num) => '₹' + Number(num || 0).toLocaleString('en-IN');
const PRESETS = [500, 1000, 2000, 5000];

/* ─────────────────────────────────────────────────────────
   FAQ data & component
   ───────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
    {
        q: 'How is my donation used?',
        a: 'Every rupee you donate goes directly to the cause. The NGO uses the funds for field operations, resources, and beneficiary support. You can track real-time progress on this page.',
    },
    {
        q: 'Is my donation secure?',
        a: 'Yes. All transactions are processed through encrypted channels. Your payment details are never stored on our servers.',
    },
    {
        q: 'Can I get a receipt for my donation?',
        a: 'Absolutely. A receipt is automatically generated and available in your donation history under My Donations once the transaction is complete.',
    },
    {
        q: 'Can I set up a monthly recurring donation?',
        a: 'Yes — check the "Make this a monthly donation" option inside the donation form. You can cancel anytime from your donor dashboard.',
    },
    {
        q: 'Is my donation tax-deductible?',
        a: 'Donations to verified NGOs registered under 80G may be eligible for tax deductions. Please consult the NGO directly for their 80G certificate details.',
    },
];

const FaqItem = ({ item }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`faq-item${open ? ' faq-open' : ''}`}>
            <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span>{item.q}</span>
                <span className="faq-chevron">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="faq-answer">{item.a}</div>}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   Donation Modal
   ───────────────────────────────────────────────────────── */
const DonationModal = ({ cause, onClose, onDonate, fallbackImg }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [recurring, setRecurring] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll while modal open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const selectPreset = (p) => setAmount(String(p));

    const handleSubmit = async () => {
        setError('');
        const parsed = Number(amount);
        if (!parsed || parsed <= 0) { setError('Please enter a valid donation amount.'); return; }
        if (paymentMethod === 'upi' && !upiId.trim()) { setError('Please enter your UPI ID.'); return; }
        if (paymentMethod === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 16) { setError('Please enter a valid 16-digit card number.'); return; }
            if (!cardExpiry.trim()) { setError('Please enter your card expiry date.'); return; }
            if (cardCvv.length < 3) { setError('Please enter a valid CVV.'); return; }
        }
        setSubmitting(true);
        await onDonate(cause, parsed, recurring);
        setSubmitting(false);
        onClose();
    };

    const progress = cause.targetAmount > 0
        ? Math.min((cause.raisedAmount / cause.targetAmount) * 100, 100)
        : 0;
    const isFullyFunded = progress >= 100;
    const imageUrl = cause.image ? `http://localhost:5000${cause.image}` : fallbackImg;

    // Format card number with spaces
    const handleCardNumber = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 16);
        const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    // Format expiry MM/YY
    const handleExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        setCardExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
    };

    return (
        <div className="dm-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="dm-panel" role="dialog" aria-modal="true" aria-label={`Donate to ${cause.title}`}>

                {/* ── Header ── */}
                <div className="dm-header">
                    <div className="dm-header-left">
                        <img src={imageUrl} onError={e => (e.target.src = fallbackImg)} alt={cause.title} className="dm-header-img" />
                        <div>
                            <div className="dm-header-label">You are donating to</div>
                            <div className="dm-header-title">{cause.title}</div>
                            <div className="dm-header-progress">
                                <div className="dm-progress-bar-bg">
                                    <div className="dm-progress-bar-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="dm-progress-txt">
                                    {formatINR(cause.raisedAmount)} raised · {progress.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="dm-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="dm-body">
                    {isFullyFunded ? (
                        <div className="dm-funded">
                            <div style={{ fontSize: '2.5rem' }}>🎉</div>
                            <p>This campaign has reached its goal!</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                Thank you for your interest. Check out other active campaigns.
                            </p>
                            <button className="dm-close-btn" onClick={onClose}>Close</button>
                        </div>
                    ) : (
                        <>
                            {/* ── Step 1: Amount ── */}
                            <div className="dm-section">
                                <div className="dm-section-label">
                                    <span className="dm-step">1</span> Choose an amount
                                </div>
                                <div className="dm-presets">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p}
                                            className={`dm-preset-btn${amount == p ? ' active' : ''}`}
                                            onClick={() => selectPreset(p)}
                                        >
                                            ₹{p.toLocaleString('en-IN')}
                                        </button>
                                    ))}
                                </div>
                                <div className="dm-custom-row">
                                    <span className="dm-currency">₹</span>
                                    <input
                                        type="number"
                                        className="dm-custom-input"
                                        placeholder="Enter custom amount"
                                        value={amount}
                                        min="1"
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* ── Step 2: Payment ── */}
                            <div className="dm-section">
                                <div className="dm-section-label">
                                    <span className="dm-step">2</span> Payment method
                                </div>
                                <div className="dm-method-tabs">
                                    <button
                                        className={`dm-method-tab${paymentMethod === 'upi' ? ' active' : ''}`}
                                        onClick={() => setPaymentMethod('upi')}
                                    >
                                        📱 UPI
                                    </button>
                                    <button
                                        className={`dm-method-tab${paymentMethod === 'card' ? ' active' : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        💳 Card
                                    </button>
                                    <button
                                        className={`dm-method-tab${paymentMethod === 'netbanking' ? ' active' : ''}`}
                                        onClick={() => setPaymentMethod('netbanking')}
                                    >
                                        🏦 Net Banking
                                    </button>
                                </div>

                                {paymentMethod === 'upi' && (
                                    <div className="dm-payment-field">
                                        <label className="dm-field-label">UPI ID</label>
                                        <input
                                            type="text"
                                            className="dm-field-input"
                                            placeholder="yourname@upi"
                                            value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                        />
                                        <span className="dm-field-hint">e.g. name@okicici, name@paytm</span>
                                    </div>
                                )}

                                {paymentMethod === 'card' && (
                                    <div className="dm-payment-field">
                                        <label className="dm-field-label">Card Number</label>
                                        <input
                                            type="text"
                                            className="dm-field-input"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={e => handleCardNumber(e.target.value)}
                                            maxLength="19"
                                        />
                                        <div className="dm-card-row">
                                            <div>
                                                <label className="dm-field-label">Expiry</label>
                                                <input
                                                    type="text"
                                                    className="dm-field-input"
                                                    placeholder="MM/YY"
                                                    value={cardExpiry}
                                                    onChange={e => handleExpiry(e.target.value)}
                                                    maxLength="5"
                                                />
                                            </div>
                                            <div>
                                                <label className="dm-field-label">CVV</label>
                                                <input
                                                    type="password"
                                                    className="dm-field-input"
                                                    placeholder="•••"
                                                    value={cardCvv}
                                                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                    maxLength="4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'netbanking' && (
                                    <div className="dm-payment-field">
                                        <label className="dm-field-label">Select your bank</label>
                                        <select className="dm-field-input">
                                            <option value="">-- Choose bank --</option>
                                            <option>State Bank of India</option>
                                            <option>HDFC Bank</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                            <option>Kotak Mahindra Bank</option>
                                            <option>Punjab National Bank</option>
                                            <option>Bank of Baroda</option>
                                            <option>Other</option>
                                        </select>
                                        <span className="dm-field-hint">You'll be redirected to your bank's portal.</span>
                                    </div>
                                )}
                            </div>

                            {/* ── Step 3: Recurring ── */}
                            <div className="dm-section dm-section-recurring">
                                <label className="dm-recurring-label">
                                    <input
                                        type="checkbox"
                                        checked={recurring}
                                        onChange={e => setRecurring(e.target.checked)}
                                        className="dm-recurring-check"
                                    />
                                    <div>
                                        <span className="dm-recurring-title">🔁 Make this a monthly donation</span>
                                        <span className="dm-recurring-sub">You can cancel anytime from your dashboard</span>
                                    </div>
                                </label>
                            </div>

                            {/* ── Error ── */}
                            {error && <div className="dm-error">{error}</div>}

                            {/* ── Summary + CTA ── */}
                            <div className="dm-footer">
                                <div className="dm-summary">
                                    {amount && Number(amount) > 0 && (
                                        <>
                                            <span className="dm-summary-amount">{formatINR(amount)}</span>
                                            <span className="dm-summary-label">
                                                {recurring ? '/ month' : 'one-time donation'}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="dm-cta-row">
                                    <button className="dm-cancel-btn" onClick={onClose} disabled={submitting}>
                                        Cancel
                                    </button>
                                    <button
                                        className="dm-submit-btn"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? 'Processing…'
                                            : recurring
                                            ? '🔁 Setup Monthly Donation'
                                            : '❤ Confirm Donation'}
                                    </button>
                                </div>
                                <div className="dm-secure-note">
                                    🔒 Payments are secure & encrypted. Receipt sent to your account.
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────── */
const NGOCauses = () => {
    const { id: ngoId } = useParams();
    const { user } = useContext(AuthContext);
    const [causes, setCauses] = useState([]);
    const [ngoDetails, setNgoDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modal state — null or the cause object being donated to
    const [activeCause, setActiveCause] = useState(null);

    const config = {
        headers: { Authorization: user?.token ? `Bearer ${user.token}` : '' },
    };

    useEffect(() => { fetchCausesAndNGO(); }, [ngoId]);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const fetchCausesAndNGO = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/causes/ngo/${ngoId}`, config);
            if (data && data.causes !== undefined) {
                setCauses(data.causes);
                setNgoDetails(data.ngo);
            } else {
                setCauses(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
            showToast('Error fetching causes', 'error');
        }
        setLoading(false);
    };

    // Called from inside DonationModal — actual API call
    const handleDonate = async (cause, amount, recurring) => {
        try {
            await axios.post('http://localhost:5000/api/donations', {
                amount,
                ngoId: cause.ngoId,
                causeId: cause._id,
                campaign: cause.title,
                isRecurring: recurring,
                frequency: recurring ? 'Monthly' : 'One-Time',
            }, config);
            showToast(
                `✅ ${recurring ? 'Monthly donation' : 'Donation'} of ${formatINR(amount)} confirmed for "${cause.title}"!`,
                'success'
            );
            fetchCausesAndNGO();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error processing donation', 'error');
            throw error; // re-throw so modal knows it failed
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <div className="causes-spinner" />
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading campaigns…</p>
            </div>
        );
    }

    return (
        <div>
            {/* Toast */}
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            {/* Donation Modal */}
            {activeCause && (
                <DonationModal
                    cause={activeCause}
                    fallbackImg={causePlaceholders[causes.indexOf(activeCause) % causePlaceholders.length]}
                    onClose={() => setActiveCause(null)}
                    onDonate={handleDonate}
                />
            )}

            {/* ── Hero Banner ── */}
            <div className="causes-hero">
                <img src={placeholder2} alt="NGO Banner" className="causes-hero-bg" />
                <div className="causes-hero-overlay" />
                <div className="causes-hero-content container">
                    <div className="causes-hero-badge">
                        {ngoDetails?.isApproved ? '✔ Verified NGO' : 'NGO'}
                    </div>
                    <h1 className="causes-hero-title">
                        {ngoDetails?.ngoName || ngoDetails?.name || 'NGO Campaigns'}
                    </h1>
                    <p className="causes-hero-sub">
                        {ngoDetails?.email && <span>✉ {ngoDetails.email}</span>}
                        {ngoDetails?.city && <span>&nbsp;•&nbsp; 📍 {ngoDetails.city}</span>}
                    </p>
                    <div className="causes-hero-stats">
                        <div className="causes-hero-stat">
                            <span className="causes-hero-stat-val">{causes.length}</span>
                            <span className="causes-hero-stat-label">Active Campaigns</span>
                        </div>
                        <div className="causes-hero-stat">
                            <span className="causes-hero-stat-val">
                                {formatINR(causes.reduce((s, c) => s + (c.raisedAmount || 0), 0))}
                            </span>
                            <span className="causes-hero-stat-label">Total Raised</span>
                        </div>
                        <div className="causes-hero-stat">
                            <span className="causes-hero-stat-val">
                                {formatINR(causes.reduce((s, c) => s + (c.targetAmount || 0), 0))}
                            </span>
                            <span className="causes-hero-stat-label">Total Goal</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Section header */}
                <div className="causes-section-header">
                    <div>
                        <h2 className="causes-section-title">Active Campaigns</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                            Choose a cause and make a direct, measurable impact.
                        </p>
                    </div>
                    <span className="badge badge-info">
                        {causes.length} campaign{causes.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ── Cause cards ── */}
                {causes.length === 0 ? (
                    <div className="causes-empty">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                        <p>No active campaigns yet for this NGO.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                            Check back soon — campaigns are being added regularly.
                        </p>
                    </div>
                ) : (
                    <div className="cause-cards-grid">
                        {causes.map((cause, index) => {
                            const progress = cause.targetAmount > 0
                                ? Math.min((cause.raisedAmount / cause.targetAmount) * 100, 100)
                                : 0;
                            const fallback = causePlaceholders[index % causePlaceholders.length];
                            const imageUrl = cause.image
                                ? `http://localhost:5000${cause.image}`
                                : fallback;
                            const isFullyFunded = progress >= 100;

                            return (
                                <div key={cause._id} className="cause-card">
                                    {/* Image */}
                                    <div className="cause-card-img-wrap">
                                        <img
                                            src={imageUrl}
                                            onError={e => (e.target.src = fallback)}
                                            alt={cause.title}
                                            className="cause-card-img"
                                        />
                                        {isFullyFunded && (
                                            <div className="cause-card-funded-badge">🎉 Fully Funded</div>
                                        )}
                                    </div>

                                    {/* Body — clean, no inline form */}
                                    <div className="cause-card-body">
                                        <h3 className="cause-card-title">{cause.title}</h3>
                                        <p className="cause-card-desc">
                                            {cause.description
                                                ? cause.description.length > 120
                                                    ? cause.description.slice(0, 120) + '…'
                                                    : cause.description
                                                : 'Support this important cause and make a lasting difference.'}
                                        </p>

                                        {/* Progress */}
                                        <div className="cause-card-progress-wrap">
                                            <div className="cause-card-amounts">
                                                <span>
                                                    <strong style={{ color: 'var(--success)' }}>
                                                        {formatINR(cause.raisedAmount)}
                                                    </strong>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}> raised</span>
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    of {formatINR(cause.targetAmount)}
                                                </span>
                                            </div>
                                            <div className="cause-progress-bar-bg">
                                                <div
                                                    className="cause-progress-bar-fill"
                                                    style={{
                                                        width: `${progress}%`,
                                                        background: isFullyFunded
                                                            ? 'var(--success)'
                                                            : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                                                    }}
                                                />
                                            </div>
                                            <div className="cause-progress-pct">
                                                {progress.toFixed(1)}% funded
                                            </div>
                                        </div>

                                        {/* Single clean CTA — opens modal */}
                                        <button
                                            className={`cause-open-modal-btn${isFullyFunded ? ' funded' : ''}`}
                                            onClick={() => !isFullyFunded && setActiveCause(cause)}
                                            disabled={isFullyFunded}
                                        >
                                            {isFullyFunded ? '✔ Goal Reached' : '❤ Donate to this Cause'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Trust strip */}
                <div className="causes-trust-strip">
                    <div className="causes-trust-item">🔒 Secure & Encrypted</div>
                    <div className="causes-trust-item">✅ Verified NGO</div>
                    <div className="causes-trust-item">📋 Tax Receipt Available</div>
                    <div className="causes-trust-item">🔁 Cancel Anytime</div>
                </div>

                {/* FAQ */}
                <div className="causes-faq-section">
                    <h2 className="causes-section-title" style={{ marginBottom: '0.25rem' }}>
                        Frequently Asked Questions
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                        Everything you need to know before you donate.
                    </p>
                    <div className="faq-list">
                        {FAQ_ITEMS.map((item, i) => <FaqItem key={i} item={item} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGOCauses;
