import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const formatINR = (num) => {
    if (num === undefined || num === null) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AdminReports = () => {
    const { user } = useContext(AuthContext);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', ngoId: '', eventId: '' });
    const [ngos, setNgos] = useState([]);
    const [events, setEvents] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchNGOs();
        fetchEvents();
    }, []);

    const fetchNGOs = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/users?role=NGO', config);
            setNgos(data);
        } catch (err) { console.error(err); }
    };

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/events', config);
            setEvents(data);
        } catch (err) { console.error(err); }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.ngoId) params.append('ngoId', filters.ngoId);
            if (filters.eventId) params.append('eventId', filters.eventId);

            const { data } = await axios.get(`http://localhost:5000/api/admin/reports?${params.toString()}`, config);
            setReport(data);
            setGenerated(true);
        } catch (err) {
            console.error(err);
            alert('Error generating report');
        }
        setLoading(false);
    };

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', ngoId: '', eventId: '' });
        setReport(null);
        setGenerated(false);
    };

    const exportCSV = () => {
        if (!report || !report.donations.length) return;

        const headers = ['Donor', 'NGO', 'Campaign', 'Type', 'Amount (₹)', 'Status', 'Date'];
        const rows = report.donations.map(d => [
            d.donorName,
            d.ngoName || 'General',
            d.campaign,
            d.isRecurring ? 'Monthly' : 'One-Time',
            d.amount,
            d.status,
            formatDate(d.createdAt),
        ]);

        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ngo_report_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Chart helpers
    const maxTrendAmount = report ? Math.max(...report.monthlyTrend.map(m => m.amount), 1) : 1;
    const maxNgoAmount = report && report.donationsByNGO.length ? Math.max(...report.donationsByNGO.map(n => n.amount), 1) : 1;
    const pieColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon"></span>
                <div>
                    <h2>Report Generation</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generate filtered reports with insights</p>
                </div>
            </div>

            {/* Filters */}
            <div className="form-card">
                <h3> Report Filters</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>NGO</label>
                        <select value={filters.ngoId} onChange={e => setFilters({ ...filters, ngoId: e.target.value })}>
                            <option value="">All NGOs</option>
                            {ngos.map(n => (
                                <option key={n._id} value={n._id}>{n.ngoName || n.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Event</label>
                        <select value={filters.eventId} onChange={e => setFilters({ ...filters, eventId: e.target.value })}>
                            <option value="">All Events</option>
                            {events.map(ev => (
                                <option key={ev._id} value={ev._id}>{ev.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={generateReport}
                        disabled={loading}
                    >
                        {loading ? ' Generating...' : ' Generate Report'}
                    </button>
                    <button className="btn btn-secondary" onClick={clearFilters}>
                         Clear Filters
                    </button>
                    {report && report.donations.length > 0 && (
                        <button className="btn btn-success" style={{ marginLeft: 'auto' }} onClick={exportCSV}>
                             Export CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {generated && report && (
                <>
                    {/* Summary Stats */}
                    <div className="stat-grid" style={{ marginTop: '2rem' }}>
                        <div className="stat-card green">
                            <div className="stat-icon"></div>
                            <div className="stat-label">Total Amount</div>
                            <div className="stat-value" style={{ color: 'var(--success)' }}>{formatINR(report.totalAmount)}</div>
                        </div>
                        <div className="stat-card indigo">
                            <div className="stat-icon"></div>
                            <div className="stat-label">Total Donations</div>
                            <div className="stat-value" style={{ color: 'var(--primary)' }}>{report.totalDonations}</div>
                        </div>
                        <div className="stat-card amber">
                            <div className="stat-icon"></div>
                            <div className="stat-label">Total Events</div>
                            <div className="stat-value" style={{ color: 'var(--accent)' }}>{report.totalEvents}</div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="chart-grid" style={{ marginTop: '1.5rem' }}>
                        {/* Monthly Trend Bar Chart */}
                        <div className="chart-card">
                            <h3> Monthly Donation Trend</h3>
                            {report.monthlyTrend.some(m => m.amount > 0) ? (
                                <div className="bar-chart">
                                    {report.monthlyTrend.map((m, i) => (
                                        <div key={i} className="bar-group">
                                            <div className="bar-value">{formatINR(m.amount)}</div>
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${(m.amount / maxTrendAmount) * 100}%`,
                                                    background: pieColors[i % pieColors.length],
                                                }}
                                            ></div>
                                            <div className="bar-label">{m.month}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No donation data for chart</div>
                            )}
                        </div>

                        {/* Donations by NGO - Pie-style breakdown */}
                        <div className="chart-card">
                            <h3>️ Donations by NGO</h3>
                            {report.donationsByNGO.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    {report.donationsByNGO.map((ngo, i) => {
                                        const pct = report.totalAmount > 0 ? ((ngo.amount / report.totalAmount) * 100).toFixed(1) : 0;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                        <span style={{
                                                            display: 'inline-block', width: '10px', height: '10px',
                                                            borderRadius: '50%', background: pieColors[i % pieColors.length],
                                                            marginRight: '0.5rem'
                                                        }}></span>
                                                        {ngo.ngoName}
                                                    </span>
                                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {formatINR(ngo.amount)} ({pct}%)
                                                    </span>
                                                </div>
                                                <div style={{
                                                    height: '8px', borderRadius: '4px',
                                                    background: 'var(--border)', overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%', borderRadius: '4px',
                                                        width: `${pct}%`,
                                                        background: pieColors[i % pieColors.length],
                                                        transition: 'width 0.6s ease',
                                                    }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No NGO breakdown data</div>
                            )}
                        </div>
                    </div>

                    {/* Donations Table */}
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         Donation Records ({report.totalDonations})
                    </h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Donor</th>
                                    <th>NGO</th>
                                    <th>Campaign</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.donations.map(d => (
                                    <tr key={d._id}>
                                        <td style={{ fontWeight: 500 }}>{d.donorName}</td>
                                        <td>️ {d.ngoName || 'General'}</td>
                                        <td>{d.campaign}</td>
                                        <td>
                                            <span className={`badge ${d.isRecurring ? 'badge-info' : 'badge-default'}`}>
                                                {d.isRecurring ? 'Monthly' : 'One-Time'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{formatINR(d.amount)}{d.isRecurring ? '/mo' : ''}</td>
                                        <td>
                                            <span className={`badge ${d.status === 'Completed' ? 'badge-success' : d.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(d.createdAt)}</td>
                                    </tr>
                                ))}
                                {report.donations.length === 0 && (
                                    <tr><td colSpan="7" className="table-empty">No donations match the filters</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Events Table */}
                    <h3 style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         Event Records ({report.totalEvents})
                    </h3>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>NGO</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Volunteers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.events.map(ev => (
                                    <tr key={ev._id}>
                                        <td>
                                            <strong>{ev.title}</strong>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.description}</div>
                                        </td>
                                        <td>️ {ev.createdBy?.ngoName || ev.createdBy?.name || '-'}</td>
                                        <td>{formatDate(ev.date)}</td>
                                        <td> {ev.location}</td>
                                        <td>
                                            <span className={`badge ${
                                                ev.status === 'Completed' ? 'badge-success' :
                                                ev.status === 'Upcoming' ? 'badge-info' :
                                                ev.status === 'Ongoing' ? 'badge-warning' : 'badge-danger'
                                            }`}>{ev.status}</span>
                                        </td>
                                        <td>{ev.volunteersAssigned?.map(v => v.name).join(', ') || <span style={{ color: 'var(--text-muted)' }}>None</span>}</td>
                                    </tr>
                                ))}
                                {report.events.length === 0 && (
                                    <tr><td colSpan="6" className="table-empty">No events match the filters</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Empty state before generating */}
            {!generated && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--dark)' }}>No Report Generated Yet</h3>
                    <p>Use the filters above and click "Generate Report" to view insights.</p>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
