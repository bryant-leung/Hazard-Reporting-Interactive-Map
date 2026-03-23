import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom" // 1. Import useNavigate
import { useAuth } from '../context/AuthContext.jsx';

function MyReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")
  const { highContrast } = useAuth();
  const navigate = useNavigate() // 2. Initialize navigate

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/my-reports", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        const data = await response.json()
        setReports(data)
        setLoading(false)
      } catch (err) {
        console.error("Error:", err)
        setLoading(false)
      }
    }
    fetchMyReports()
  }, [token])

  if (loading) return <p>Loading your reports...</p>

  return (
    <div style={{ padding: "20px" }}>
      {/* 3. Add the Back Button at the top */}
      <button 
        onClick={() => navigate('/resident')} 
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        ← Back to Map
      </button>

      <h1>My Submitted Reports</h1>
      
      {reports.length === 0 ? (
        <p>You haven't submitted any reports yet.</p>
      ) : (
        reports.map((report) => (
          <div key={report.id} style={{
            border: highContrast ? "2px solid #fff" : "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
            backgroundColor: highContrast ? "#000" : "#fff",
            color: highContrast ? "#fff" : "#000",
              }}>
              <p><strong>ID:</strong> {report.id}</p>
              <p><strong>Status:</strong>{" "}
                <span
                  style={{
                    color: highContrast
                      ? (report.status === "Fixed" ? "#00FF00" : "#FFD700")
                      : (report.status === "Fixed" ? "green" : "orange"),
                    fontWeight: "bold",
                  }}
                >{report.status}
                </span>
              </p>
              <p><strong>Category:</strong> {report.category}</p>
              <p><strong>Description:</strong> {report.description}</p>
              <p>
                <strong>Submitted on:</strong>{" "}
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
        ))
      )}
    </div>
  )
}

export default MyReportsPage