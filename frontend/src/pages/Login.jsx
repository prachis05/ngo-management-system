import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await login(email, password);
        setLoading(false);
    };

    const isDisabled = !email || !password || loading;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏛️</div>
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to NGO Management System</p>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={isDisabled}>
                        {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
                    <p className="auth-link">Don't have an account? <Link to="/register">Create one</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
