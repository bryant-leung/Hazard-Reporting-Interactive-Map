import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"

function StaffDashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit States
  const [editingId, setEditingId] = useState(null)
  const [editedCategory, setEditedCategory] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedStatus, setEditedStatus] = useState("")

  const token = localStorage.getItem("token")

  // 1. Fetch real reports from the database on load
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/view-hazards", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await response.json()
      setReports(data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch reports:", err)
      setLoading(false)
    }
  }

  // 2. Save changes to the database (PUT)
  async function handleSave(id) {
    try {
      const response = await fetch(`http://localhost:3000/admin/update-hazard/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          hazard_category: editedCategory,
          description: editedDescription,
          status: editedStatus
        })
      })

      if (response.ok) {
        alert("Report updated in database!")
        setEditingId(null)
        fetchReports() // Refresh the list
      }
    } catch (err) {
      alert("Error updating report")
    }
  }

  // 3. Remove from database (DELETE)
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this report?")) return

    try {
      const response = await fetch(`http://localhost:3000/admin/delete-hazard/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        setReports(reports.filter((r) => r.id !== id))
      }
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  function handleEditClick(report) {
    setEditingId(report.id)
    setEditedCategory(report.category || report.hazard_category)
    setEditedDescription(report.description)
    setEditedStatus(report.status)
  }

  if (loading) return <p>Loading reports...</p>

  return (
    <div style={{ padding: "20px" }}>
      <h1>Staff Dashboard</h1>
      <div style={{ height: "400px", marginBottom: "40px" }}>
        <Map />
      </div>

      <h2>Manage Active Hazards</h2>
      {reports.length === 0 ? (
        <p>No active reports found in database.</p>
      ) : (
        reports.map((report) => (
          <div key={report.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
            {editingId === report.id ? (
              <div>
                <label>Status:</label>
                <select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <br /><br />
                <label>Description:</label><br />
                <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} style={{ width: "100%" }} />
                <br /><br />
                <button onClick={() => handleSave(report.id)}>Save to Database</button>
                <button onClick={() => setEditingId(null)} style={{ marginLeft: "10px" }}>Cancel</button>
              </div>
            ) : (
              <div>
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Category:</strong> {report.category || report.hazard_category}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Status:</strong> <span style={{ color: report.status === "Resolved" ? "green" : "orange" }}>{report.status}</span></p>
                <p><strong>Reporter:</strong> {report.reporter_email}</p>
                
                <button onClick={() => handleEditClick(report)}>Update Status</button>
                <button onClick={() => handleDelete(report.id)} style={{ marginLeft: "10px", backgroundColor: "#ff4d4d", color: "white" }}>Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StaffDashboard