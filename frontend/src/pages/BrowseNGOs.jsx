import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const BrowseNGOs = () => {
    const { user } = useContext(AuthContext);
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchNGOs();
    }, []);

    const fetchNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/donations/ngos', config);
            setNgos(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon">️</span>
                <h2>Browse NGOs</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Discover verified NGOs making a difference. Choose one to support with your donation.
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading NGOs...</div>
            ) : ngos.length === 0 ? (
                <div className="form-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No approved NGOs available at the moment.
                </div>
            ) : (
                <div className="ngo-cards-grid">
                    {ngos.map(ngo => (
                        <Link to={`/ngo/${ngo._id}`} key={ngo._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card ngo-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                                <div className="ngo-card-icon">️</div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                    {ngo.ngoName || ngo.name}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                    Managed by {ngo.name}
                                </p>
                                <span className="badge badge-success"> Verified</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BrowseNGOs;
