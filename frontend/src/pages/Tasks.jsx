import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Tasks = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => { fetchTasks(); }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/tasks', config);
            setTasks(data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/tasks', { ...formData, status: 'To Do' }, config);
            setFormData({ title: '', description: '' });
            fetchTasks();
        } catch (err) { alert('Error creating task'); }
        setLoading(false);
    };

    const handleMove = async (task, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/tasks/${task._id}`, { status: newStatus }, config);
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this task?')) {
            try {
                await axios.delete(`http://localhost:5000/api/tasks/${id}`, config);
                fetchTasks();
            } catch (err) { console.error(err); }
        }
    };

    const columns = [
        { key: 'To Do',       label: ' To Do',        className: 'todo' },
        { key: 'In Progress', label: ' In Progress',  className: 'progress' },
        { key: 'Done',        label: ' Done',          className: 'done' },
    ];

    const isDisabled = !formData.title || loading;

    return (
        <div className="container">
            <div className="page-header">
                <span className="icon"></span>
                <h2>Agile Task Board</h2>
            </div>

            {/* Create Task Form */}
            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                <h3> New Task</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                        <label>Title</label>
                        <input type="text" placeholder="Design landing page" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                        <label>Description</label>
                        <input type="text" placeholder="Optional description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-success btn-sm" style={{ padding: '0.7rem 1.25rem', marginBottom: '0' }} disabled={isDisabled}>
                        {loading ? '' : ' Add Task'}
                    </button>
                </form>
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.key);
                    return (
                        <div key={col.key} className={`kanban-column ${col.className}`}>
                            <div className="kanban-header">
                                <h3>{col.label}</h3>
                                <span className="kanban-count">{colTasks.length}</span>
                            </div>
                            
                            {colTasks.map(task => (
                                <div key={task._id} className="kanban-card">
                                    <h4>{task.title}</h4>
                                    {task.description && <p>{task.description}</p>}
                                    <div className="kanban-card-actions">
                                        <select 
                                            value={task.status} 
                                            onChange={(e) => handleMove(task, e.target.value)}
                                        >
                                            <option value="To Do"> To Do</option>
                                            <option value="In Progress"> In Progress</option>
                                            <option value="Done"> Done</option>
                                        </select>
                                        <button className="btn btn-sm btn-delete" onClick={() => handleDelete(task._id)}>
                                            ️
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {colTasks.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    No tasks here
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Tasks;
