import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import axios from 'axios';

const UpdatesPage = () => {
    const navigate = useNavigate(); // Initialize the navigate hook
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Please log in to view updates.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:3000/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setNotifications(response.data);
            } catch (err) {
                console.error("Error fetching updates:", err);
                setError("Could not load updates. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatType = (type) => {
        return type ? type.replace('_', ' ').toUpperCase() : 'UPDATE';
    };

    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Activity Feed...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            
            {/* BACK BUTTON: This fixes the navigation issue */}
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => navigate('/resident')} 
                    style={{
                        background: '#0f4c3a',
                        color: 'white',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    ← Back to Dashboard
                </button>
            </div>

            <header style={{ marginBottom: '30px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', margin: 0 }}>Activity Updates</h1>
                <p style={{ color: '#666', marginTop: '5px' }}>Track your reports and community interactions.</p>
            </header>

            {error ? (
                <div style={{ padding: '20px', backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px' }}>{error}</div>
            ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '12px' }}>
                    <p style={{ color: '#888' }}>No new updates yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {notifications.map((note) => (
                        <div key={note.id} style={{
                            padding: '20px',
                            borderRadius: '10px',
                            backgroundColor: note.is_read ? '#ffffff' : '#f0f7ff',
                            border: `1px solid ${note.is_read ? '#e0e0e0' : '#cce3ff'}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: '800', 
                                    color: note.type === 'status_change' ? '#28a745' : '#007bff'
                                }}>
                                    {formatType(note.type)}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                    {formatTime(note.created_at)}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#2c3e50' }}>{note.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpdatesPage;