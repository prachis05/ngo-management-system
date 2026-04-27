import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import placeholder1 from '../assets/placeholder1.jpg';
import placeholder2 from '../assets/placeholder2.jpg';
import placeholder3 from '../assets/placeholder3.webp';
import placeholder4 from '../assets/placeholder4.jpg';

const placeholders = [placeholder1, placeholder2, placeholder3, placeholder4];

const BrowseNGOs = () => {
    const { user } = useContext(AuthContext);
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => { fetchNGOs(); }, []);

    const fetchNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations/ngos', config);
            setNgos(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="container">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '0.5rem' }}>
                <h2>Browse NGOs</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                Discover verified NGOs making a difference. Choose one to explore their campaigns and donate.
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div className="causes-spinner" />
                    <p style={{ marginTop: '1rem' }}>Loading NGOs…</p>
                </div>
            ) : ngos.length === 0 ? (
                <div className="causes-empty">
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏛️</div>
                    <p>No approved NGOs available at the moment.</p>
                </div>
            ) : (
                <div className="ngo-browse-grid">
                    {ngos.map((ngo, index) => {
                        const fallback = placeholders[index % placeholders.length];
                        return (
                            <Link
                                to={`/ngo/${ngo._id}`}
                                key={ngo._id}
                                className="ngo-browse-card"
                            >
                                {/* Card image */}
                                <div className="ngo-browse-img-wrap">
                                    <img
                                        src={ngo.image ? `http://localhost:5000/uploads/${ngo.image}` : fallback}
                                        onError={e => (e.target.src = fallback)}
                                        alt={ngo.ngoName || ngo.name}
                                        className="ngo-browse-img"
                                    />
                                    <div className="ngo-browse-img-overlay" />
                                    <span className="ngo-browse-verified">✔ Verified</span>
                                </div>

                                {/* Card body */}
                                <div className="ngo-browse-body">
                                    <h3 className="ngo-browse-name">{ngo.ngoName || ngo.name}</h3>
                                    <p className="ngo-browse-managed">Managed by {ngo.name}</p>
                                    <div className="ngo-browse-cta">
                                        View Campaigns →
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BrowseNGOs;