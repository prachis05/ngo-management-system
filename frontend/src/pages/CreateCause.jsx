import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateCause = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.targetAmount) {
            showToast('Title and Target Amount are required', 'error');
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('targetAmount', formData.targetAmount);
        if (image) {
            data.append('image', image);
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            };
            await axios.post('http://localhost:5000/api/causes', data, config);
            showToast('Cause created successfully!', 'success');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            showToast(error.response?.data?.message || 'Error creating cause', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
            
            <div className="page-header">
                <span className="icon"></span>
                <h2>Create a New Cause</h2>
            </div>

            <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title <span style={{color: 'red'}}>*</span></label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g., Clean Water Initiative"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Provide details about this cause..."
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Target Amount (₹) <span style={{color: 'red'}}>*</span></label>
                        <input
                            type="number"
                            name="targetAmount"
                            placeholder="e.g., 50000"
                            min="1"
                            value={formData.targetAmount}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Cause Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? ' Creating...' : ' Create Cause'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCause;
