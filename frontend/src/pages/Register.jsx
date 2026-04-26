import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Volunteer',
        ngoName: '',
        idProof: null,
        city: '',
        skills: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    const { name, email, password, role, ngoName, idProof, city, skills } = formData;

    const onChange = (e) => {
        if (e.target.name === 'idProof') {
            setFormData({ ...formData, idProof: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {

            const skillArray = skills ? skills.split(',').map(s => s.trim()) : [];

            const data = new FormData();
            data.append('name', name);
            data.append('email', email);
            data.append('password', password);
            data.append('role', role);

            if (role === 'NGO') {
                data.append('ngoName', ngoName);
            }

            if (role === 'NGO' || role === 'Volunteer') {
                if (!idProof) {
                    setError('ID Proof Document is required for this role.');
                    setLoading(false);
                    return;
                }
                data.append('idProof', idProof);
            }

            if (role === 'Volunteer') {
                data.append('city', city);
                data.append('skills', JSON.stringify(skillArray));
            }


            const res = await axios.post('http://localhost:5000/api/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '2rem' }}>
            <div className="form-card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className="icon">️</span> Register Account
                </h2>
                {error && <div className="badge badge-danger" style={{ display: 'block', fontSize: '1rem', padding: '0.75rem', marginBottom: '1rem' }}>{error}</div>}
                {success && <div className="badge badge-success" style={{ display: 'block', fontSize: '1rem', padding: '0.75rem', marginBottom: '1rem' }}>{success}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Register As</label>
                        <select name="role" value={role} onChange={onChange}>
                            <option value="Volunteer">Volunteer</option>
                            <option value="NGO">NGO Owner</option>
                            <option value="Donor">Donor</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={name} onChange={onChange} required />
                    </div>

                    {role === 'NGO' && (
                        <div className="form-group">
                            <label>NGO Target Name</label>
                            <input type="text" name="ngoName" value={ngoName} onChange={onChange} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={email} onChange={onChange} required />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} required minLength="6" />
                    </div>

                    {(role === 'NGO' || role === 'Volunteer') && (
                        <div className="form-group" style={{
                            background: 'var(--bg-lighter)', padding: '15px', borderRadius: '8px',
                            borderLeft: '4px solid var(--warning)'
                        }}>
                            <label><strong>Identity Verification Required</strong></label>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Please upload a valid ID Proof (PDF/JPG/PNG). Your account will require Admin approval.
                            </p>
                            <input type="file" name="idProof" onChange={onChange} required accept=".jpg,.jpeg,.png,.pdf" />
                        </div>
                    )}

                    {role === 'Volunteer' && (
                        <>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={city}
                                    onChange={onChange}
                                    placeholder="Enter your city"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Skills</label>
                                <input
                                    type="text"
                                    name="skills"
                                    value={skills}
                                    onChange={onChange}
                                    placeholder="e.g. Teaching, Cooking, Driving"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Register'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p>Already have an account? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
