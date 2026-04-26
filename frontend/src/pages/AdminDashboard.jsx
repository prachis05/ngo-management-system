import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
    Users,
    IndianRupee,
    Building2,
    Calendar,
    UserCheck,
    Clock
} from "lucide-react";

const formatINR = (num) => {
    if (num === undefined || num === null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [pendingNGOs, setPendingNGOs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allNGOs, setAllNGOs] = useState([]);
    const [toast, setToast] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchStats();
        fetchPendingNGOs();
        fetchAllUsers();
        fetchAllNGOs();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/dashboard', config);
            setStats(data);
        } catch (err) { console.error(err); }
    };

    const fetchPendingNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/pending-ngos', config);
            setPendingNGOs(data);
        } catch (err) { console.error(err); }
    };

    const fetchAllUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setAllUsers(data);
        } catch (err) { console.error(err); }
    };

    const fetchAllNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/ngos', config);
            setAllNGOs(data);
        } catch (err) { console.error(err); }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/approve/${id}`, {}, config);
            showToast(' NGO approved successfully!');
            fetchPendingNGOs();
            fetchAllUsers();
            fetchStats();
        } catch (err) {
            showToast('Error approving NGO', 'error');
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Reject and remove this NGO registration?')) {
            try {
                await axios.put(`http://localhost:5000/api/admin/reject/${id}`, {}, config);
                showToast(' NGO registration rejected');
                fetchPendingNGOs();
                fetchAllUsers();
                fetchStats();
            } catch (err) {
                showToast('Error rejecting NGO', 'error');
            }
        }
    };

    const getRoleBadge = (role) => {
        const map = { 'Admin': 'badge-danger', 'NGO': 'badge-info', 'Donor': 'badge-success', 'Volunteer': 'badge-warning' };
        return map[role] || 'badge-default';
    };

    return (
        <div className="container">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

            <div className="page-header">
                <span className="icon">️</span>
                <div>
                    <h2>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>System overview & management</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid">

                <div className="stat-card indigo">
                    <div className="stat-header">
                        <Users size={18} />
                        <span>Total Users</span>
                    </div>
                    <div className="stat-value">{stats.totalUsers || 0}</div>
                </div>

                <div className="stat-card green">
                    <div className="stat-header">
                        <IndianRupee size={18} />
                        <span>Total Donations</span>
                    </div>
                    <div className="stat-value">{formatINR(stats.totalDonations)}</div>
                </div>

                <div className="stat-card amber">
                    <div className="stat-header">
                        <Building2 size={18} />
                        <span>Approved NGOs</span>
                    </div>
                    <div className="stat-value">{stats.totalNGOs || 0}</div>
                </div>

                <div className="stat-card red">
                    <div className="stat-header">
                        <Calendar size={18} />
                        <span>Total Events</span>
                    </div>
                    <div className="stat-value">{stats.totalEvents || 0}</div>
                </div>

            </div>

            <div className="stat-grid" style={{ marginTop: '1rem' }}>

                <div className="stat-card green">
                    <div className="stat-header">
                        <UserCheck size={18} />
                        <span>Volunteers</span>
                    </div>
                    <div className="stat-value">{stats.totalVolunteers || 0}</div>
                </div>

                <div className="stat-card indigo">
                    <div className="stat-header">
                        <Users size={18} />
                        <span>Donors</span>
                    </div>
                    <div className="stat-value">{stats.totalDonors || 0}</div>
                </div>

                <div className="stat-card amber">
                    <div className="stat-header">
                        <Clock size={18} />
                        <span>Pending NGOs</span>
                    </div>
                    <div className="stat-value">{stats.pendingNGOs || 0}</div>
                </div>

                <div className="stat-card red">
                    <div className="stat-header">
                        <Clock size={18} />
                        <span>Pending Tasks</span>
                    </div>
                    <div className="stat-value">
                        {stats.pendingTasks || 0} / {stats.totalTasks || 0}
                    </div>
                </div>

            </div>

            {/* Pending NGO Approvals */}
            {pendingNGOs.length > 0 && (
                <>
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Pending NGO Approvals
                    </h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>NGO Name</th>
                                    <th>Owner</th>
                                    <th>Email</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingNGOs.map(ngo => (
                                    <tr key={ngo._id}>
                                        <td style={{ fontWeight: 600 }}>️ {ngo.ngoName}</td>
                                        <td>{ngo.name}</td>
                                        <td>{ngo.email}</td>
                                        <td>{formatDate(ngo.createdAt)}</td>
                                        <td>
                                            <button className="btn btn-sm btn-success" onClick={() => handleApprove(ngo._id)} style={{ marginRight: '0.4rem' }}> Approve</button>
                                            <button className="btn btn-sm btn-delete" onClick={() => handleReject(ngo._id)}> Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* All NGOs */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ️ NGOs Overview
            </h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>NGO Name</th>
                            <th>Owner</th>
                            <th>Status</th>
                            <th>Donations</th>
                            <th>Amount</th>
                            <th>Events</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allNGOs.map(ngo => (
                            <tr key={ngo._id}>
                                <td style={{ fontWeight: 600 }}>️ {ngo.ngoName}</td>
                                <td>{ngo.name}</td>
                                <td>
                                    <span className={`badge ${ngo.isApproved ? 'badge-success' : 'badge-warning'}`}>
                                        {ngo.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td>{ngo.totalDonations}</td>
                                <td style={{ fontWeight: 600 }}>{formatINR(ngo.totalAmount)}</td>
                                <td>{ngo.totalEvents}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => navigate(`/admin/ngo/${ngo._id}`)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {allNGOs.length === 0 && <tr><td colSpan="7" className="table-empty">No NGOs found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* All Users */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                User Activity
            </h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map(u => (
                            <tr key={u._id}>
                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                <td>{u.email}</td>
                                <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                                <td>
                                    {u.role === 'NGO' ? (
                                        <span className={`badge ${u.isApproved ? 'badge-success' : 'badge-warning'}`}>
                                            {u.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    ) : (
                                        <span className="badge badge-success">Active</span>
                                    )}
                                </td>
                                <td>{formatDate(u.createdAt)}</td>
                            </tr>
                        ))}
                        {allUsers.length === 0 && <tr><td colSpan="5" className="table-empty">No users found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Recent Donations */}
            {stats.recentDonations && stats.recentDonations.length > 0 && (
                <>
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Recent Transactions
                    </h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Donor</th>
                                    <th>NGO</th>
                                    <th>Campaign</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentDonations.map(d => (
                                    <tr key={d._id}>
                                        <td style={{ fontWeight: 500 }}>{d.donorName}</td>
                                        <td>{d.ngoName || '-'}</td>
                                        <td>{d.campaign}</td>
                                        <td style={{ fontWeight: 600 }}>{formatINR(d.amount)}</td>
                                        <td><span className={`badge ${d.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
