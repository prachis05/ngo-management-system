import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const formatINR = (num) => {
    if (num === undefined || num === null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminNGODetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const config = {
        headers: {
            Authorization: user?.token ? `Bearer ${user.token}` : ''
        }
    };

    useEffect(() => {
        if (user) {
            fetchNGODetails();
        }
    }, [id, user]);

    const fetchNGODetails = async () => {
        if (!user || !user.token) {
            setError("User not authenticated");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data: result } = await axios.get(`http://localhost:5000/api/admin/ngo/${id}/details`, config);
            setData(result);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch NGO details');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        if (!data) return;

        const { ngo, donations, events, volunteers, stats } = data;

        const reportLines = [
            '══════════════════════════════════════════════════',
            `           NGO REPORT — ${ngo.ngoName}`,
            '══════════════════════════════════════════════════',
            '',
            `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            '',
            '── NGO Information ──────────────────────────────',
            `  NGO Name      : ${ngo.ngoName}`,
            `  Owner         : ${ngo.name}`,
            `  Email         : ${ngo.email}`,
            `  Status        : ${ngo.isApproved ? 'Approved' : 'Pending'}`,
            `  Registered    : ${formatDate(ngo.createdAt)}`,
            '',
            '── Summary Statistics ───────────────────────────',
            `  Total Donations   : ${stats.totalDonations}`,
            `  Total Amount      : ${formatINR(stats.totalAmount)}`,
            `  Total Events      : ${stats.totalEvents}`,
            `  Total Volunteers  : ${stats.totalVolunteers}`,
            '',
        ];

        if (donations.length > 0) {
            reportLines.push('── Donations ───────────────────────────────────');
            reportLines.push(`  ${'Donor'.padEnd(20)} ${'Campaign'.padEnd(20)} ${'Amount'.padEnd(15)} Status`);
            reportLines.push(`  ${'─'.repeat(20)} ${'─'.repeat(20)} ${'─'.repeat(15)} ${'─'.repeat(10)}`);
            donations.forEach(d => {
                reportLines.push(`  ${(d.donorName || '-').padEnd(20)} ${(d.campaign || '-').padEnd(20)} ${formatINR(d.amount).padEnd(15)} ${d.status}`);
            });
            reportLines.push('');
        }

        if (events.length > 0) {
            reportLines.push('── Events ──────────────────────────────────────');
            reportLines.push(`  ${'Title'.padEnd(25)} ${'Date'.padEnd(15)} ${'Location'.padEnd(20)} Status`);
            reportLines.push(`  ${'─'.repeat(25)} ${'─'.repeat(15)} ${'─'.repeat(20)} ${'─'.repeat(10)}`);
            events.forEach(e => {
                reportLines.push(`  ${(e.title || '-').padEnd(25)} ${formatDate(e.date).padEnd(15)} ${(e.location || '-').padEnd(20)} ${e.status}`);
            });
            reportLines.push('');
        }

        if (volunteers.length > 0) {
            reportLines.push('── Volunteers ──────────────────────────────────');
            reportLines.push(`  ${'Name'.padEnd(20)} ${'Email'.padEnd(30)} Status`);
            reportLines.push(`  ${'─'.repeat(20)} ${'─'.repeat(30)} ${'─'.repeat(10)}`);
            volunteers.forEach(v => {
                reportLines.push(`  ${(v.name || '-').padEnd(20)} ${(v.email || '-').padEnd(30)} ${v.status}`);
            });
            reportLines.push('');
        }

        reportLines.push('══════════════════════════════════════════════════');
        reportLines.push('              End of Report');
        reportLines.push('══════════════════════════════════════════════════');

        const reportText = reportLines.join('\n');
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NGO_Report_${ngo.ngoName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading NGO details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></div>
                    <p style={{ color: 'var(--danger)' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { ngo, donations, events, volunteers, stats } = data;

    return (
        <div className="container">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={() => navigate('/')}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ️ {ngo.ngoName}
                        </h2>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Managed by {ngo.name} • {ngo.email}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${ngo.isApproved ? 'badge-success' : 'badge-warning'}`}>
                        {ngo.isApproved ? ' Approved' : ' Pending'}
                    </span>
                    <button className="btn btn-primary" onClick={generateReport}>
                         Generate Report
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card green">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Donations</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.totalDonations}</div>
                </div>
                <div className="stat-card indigo">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Amount</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{formatINR(stats.totalAmount)}</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Events</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalEvents}</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon"></div>
                    <div className="stat-label">Total Volunteers</div>
                    <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.totalVolunteers}</div>
                </div>
            </div>

            {/* Donations Table */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 Donations ({donations.length})
            </h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Donor</th>
                            <th>Campaign</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(d => (
                            <tr key={d._id}>
                                <td style={{ fontWeight: 500 }}>{d.donorName}</td>
                                <td>{d.campaign}</td>
                                <td style={{ fontWeight: 600 }}>{formatINR(d.amount)}</td>
                                <td>
                                    <span className={`badge ${d.status === 'Completed' ? 'badge-success' : d.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td>{formatDate(d.createdAt)}</td>
                            </tr>
                        ))}
                        {donations.length === 0 && (
                            <tr><td colSpan="5" className="table-empty">No donations found for this NGO</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Events Table */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 Events ({events.length})
            </h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Volunteers</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(e => (
                            <tr key={e._id}>
                                <td style={{ fontWeight: 500 }}>{e.title}</td>
                                <td>{formatDate(e.date)}</td>
                                <td>{e.location}</td>
                                <td>
                                    <span className={`badge ${e.status === 'Completed' ? 'badge-success' :
                                        e.status === 'Upcoming' ? 'badge-info' :
                                            e.status === 'Ongoing' ? 'badge-warning' :
                                                'badge-danger'
                                        }`}>
                                        {e.status}
                                    </span>
                                </td>
                                <td>
                                    {e.volunteersAssigned && e.volunteersAssigned.length > 0
                                        ? e.volunteersAssigned.map(v => v.name).join(', ')
                                        : <span style={{ color: 'var(--text-muted)' }}>None</span>
                                    }
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr><td colSpan="5" className="table-empty">No events found for this NGO</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Volunteers Table */}
            <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 Volunteers ({volunteers.length})
            </h3>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Skills</th>
                            <th>Status</th>
                            <th>Assigned Events</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.map(v => (
                            <tr key={v._id}>
                                <td style={{ fontWeight: 500 }}>{v.name}</td>
                                <td>{v.email}</td>
                                <td>{v.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                <td>{v.skills && v.skills.length > 0 ? v.skills.join(', ') : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                <td>
                                    <span className={`badge ${v.status === 'Available' ? 'badge-success' :
                                        v.status === 'Assigned' ? 'badge-info' :
                                            'badge-warning'
                                        }`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td>
                                    {v.assignedEvents && v.assignedEvents.length > 0
                                        ? v.assignedEvents.map(e => e.title).join(', ')
                                        : <span style={{ color: 'var(--text-muted)' }}>None</span>
                                    }
                                </td>
                            </tr>
                        ))}
                        {volunteers.length === 0 && (
                            <tr><td colSpan="6" className="table-empty">No volunteers assigned to this NGO's events</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminNGODetail;
