import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Volunteer', ngoName: ''
    });
    const [loading, setLoading] = useState(false);

    const { name, email, password, role, ngoName } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await register(name, email, password, role, ngoName);
        setLoading(false);
    };

    const isDisabled = !name || !email || !password || (role === 'NGO' && !ngoName) || loading;

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join the NGO Management System</p>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" placeholder="Your full name" value={name} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="you@example.com" value={email} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="••••••••" value={password} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={role} onChange={onChange}>
                            <option value="Volunteer">Volunteer</option>
                            <option value="Donor">Donor</option>
                            <option value="NGO">NGO Owner</option>
                        </select>
                    </div>
                    {role === 'NGO' && (
                        <div className="form-group">
                            <label>NGO Name</label>
                            <input type="text" name="ngoName" placeholder="e.g. Green Earth Foundation" value={ngoName} onChange={onChange} required />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                ⓘ Your NGO registration will require admin approval before access.
                            </small>
                        </div>
                    )}
                    <button type="submit" className="btn-primary" disabled={isDisabled}>
                        {loading ? '⏳ Creating...' : '🚀 Register'}
                    </button>
                    <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Register;
