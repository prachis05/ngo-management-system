import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import NGODashboard from './NGODashboard';
import DonorDashboard from './DonorDashboard';
import VolunteerDashboard from './VolunteerDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    // NGO users who are not approved see a pending message
    if (user.role === 'NGO' && !user.isApproved) {
        return (
            <div className="container">
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    maxWidth: '500px',
                    margin: '2rem auto'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
                    <h2 style={{ marginBottom: '0.75rem', color: 'var(--dark)' }}>Approval Pending</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
                        Your NGO registration for <strong>{user.ngoName}</strong> is currently under review. 
                        An admin will approve your account shortly. Please check back later.
                    </p>
                    <div className="form-card" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600 }}>NGO Name</span>
                            <span>{user.ngoName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontWeight: 600 }}>Owner</span>
                            <span>{user.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <span style={{ fontWeight: 600 }}>Status</span>
                            <span className="badge badge-warning">Pending Approval</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    switch (user.role) {
        case 'Admin':
            return <AdminDashboard />;
        case 'NGO':
            return <NGODashboard />;
        case 'Donor':
            return <DonorDashboard />;
        case 'Volunteer':
            return <VolunteerDashboard />;
        default:
            return <VolunteerDashboard />;
    }
};

export default Dashboard;
