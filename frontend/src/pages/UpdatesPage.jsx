import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const UpdatesPage = () => {
    const navigate = useNavigate(); 
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

    const formatReporterName = (email) => {
        if (!email) return "Resident";
        return email.split('@')[0];
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Activity Feed...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            
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
                            backgroundColor: note.is_read ? '#ffffff' : '#f0fdf4',
                            border: `1px solid ${note.is_read ? '#e0e0e0' : '#cce3ff'}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: '800', 
                                    color: note.type === 'status_change' ? '#28a745' : '#007bff'
                                }}>
                                    {formatType(note.type)}
                                    {note.hazard_id && ` | REPORT #${note.hazard_id}`}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                    {formatTime(note.created_at)}
                                </span>
                            </div>

                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '1rem', color: '#2c3e50', fontWeight: '500' }}>
                                    {note.message}
                                </p>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                                    {note.location_name && (
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                            📍 {note.location_name}
                                        </p>
                                    )}
                                    {/* Added: Display who the report belongs to */}
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                                        👤 By: {formatReporterName(note.reporter_email || note.email)}
                                    </p>
                                </div>
                            </div>

                            {note.hazard_id && (
                                <button 
                                    onClick={() => navigate('/resident', { state: { openHazardId: note.hazard_id } })}
                                    style={{
                                        alignSelf: 'flex-start',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 14px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#059669'}
                                    onMouseOut={(e) => e.target.style.background = '#10b981'}
                                >
                                    GO TO ISSUE →
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpdatesPage;