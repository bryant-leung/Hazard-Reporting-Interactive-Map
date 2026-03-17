import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"

// staff dashboard page
// for now this is just frontend logic with sample data
// later we can connect it to the backend / database
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

  // Fetch real reports from the database on load
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

  // save the edited report back into the reports array
  async function handleSave(id) {
    // added a note prompt to fill the status_updates table when admin makes changes
    const note = window.prompt("Enter a staff note for this status change:");
    
    try {
      const response = await fetch(`http://localhost:3000/admin/update-hazard/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editedStatus,
          description: editedDescription,
          note: note || "Updated via Staff Dashboard"
        })
      })

      if (response.ok) {
        alert("Report updated and logged in database!")
        setEditingId(null)
        fetchReports() // Refresh the list
      }
    } catch (err) {
      alert("Error updating report")
    }
  }

  // remove a report from the list
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

  // open the edit form for one report
  function handleEditClick(report) {
    setEditingId(report.id)
    setEditedCategory(report.category)
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

      <h2 style={{ marginTop: "20px" }}>Manage Reports</h2>

      {reports.length === 0 ? (
        <p>No active reports at the moment.</p>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              marginTop: "12px",
              borderRadius: "6px"
            }}
          >
            {editingId === report.id ? (
              <div>
                {/* edit form for one report */}
                <div>
                  <label>Status</label>
                  <br />
                  <select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>

                <br />

                <div>
                  <label>Description</label>
                  <br />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                <br />

                <button onClick={() => handleSave(report.id)}>Save</button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                {/* normal report display */}
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Category:</strong> {report.category}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.location_name}</p>
                <p><strong>Status:</strong> <span style={{ color: report.status === "Fixed" ? "green" : "orange" }}>{report.status}</span></p>
                <p><strong>Reporter:</strong> {report.reporter_email}</p>

                <button onClick={() => handleEditClick(report)}>Update Status</button>
                <button
                  onClick={() => handleDelete(report.id)}
                  style={{ marginLeft: "10px", backgroundColor: "#ff4d4d", color: "white" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StaffDashboard