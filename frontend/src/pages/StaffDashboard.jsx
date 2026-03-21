import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"

function StaffDashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")

  const [editingId, setEditingId] = useState(null)
  const [editedCategory, setEditedCategory] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedStatus, setEditedStatus] = useState("")

  const token = localStorage.getItem("token")

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

  async function handleSave(id) {
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
        fetchReports()
      }
    } catch (err) {
      alert("Error updating report")
    }
  }

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
    setEditedCategory(report.category)
    setEditedDescription(report.description)
    setEditedStatus(report.status)
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (report.location_name && report.location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (report.id && report.id.toString().includes(searchQuery));

    const matchesCategory = filterCategory === "All" || report.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <p>Loading reports...</p>

  return (
    <div style={{ padding: "20px" }}>
      <h1>Staff Dashboard</h1>
     
      <div style={{
        position: "relative",
        height: "600px",
        width: "100%",
        marginBottom: "60px",
        zIndex: 1,
        overflow: "hidden",
        borderRadius: "8px",
        border: "1px solid #ddd"
      }}>
        <Map />
      </div>

      <div style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "20px", 
        alignItems: "center",
        flexWrap: "wrap" 
      }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Search Reports</label>
          <input 
            type="text"
            placeholder="Search ID, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "6px", 
              border: "1px solid #ccc" 
            }}
          />
        </div>

        <div style={{ minWidth: "200px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Filter Category</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px", 
              borderRadius: "6px", 
              border: "1px solid #ccc" 
            }}
          >
            <option value="All">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Blocked Access">Blocked Access</option>
            <option value="Safety Hazard">Safety Hazard</option>
            <option value="Vandalism">Vandalism</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <h2 style={{ marginTop: "20px", clear: "both" }}>Manage Reports ({filteredReports.length})</h2>

      {filteredReports.length === 0 ? (
        <p>No reports match your search criteria.</p>
      ) : (
        filteredReports.map((report) => (
          <div
            key={report.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginTop: "15px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              position: "relative",
              zIndex: 2
            }}
          >
            {editingId === report.id ? (
              <div style={{ flex: 1 }}>
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
                    style={{ width: "90%" }}
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
              <div style={{ flex: 1 }}>
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Category:</strong> {report.category}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.location_name}</p>
                <p><strong>Status:</strong> <span style={{ color: report.status === "Fixed" ? "green" : "orange", fontWeight: "bold" }}>{report.status}</span></p>
                <p><strong>Reporter:</strong> {report.reporter_email}</p>

                <button onClick={() => handleEditClick(report)}>Update Status</button>
                <button
                  onClick={() => handleDelete(report.id)}
                  style={{ marginLeft: "10px", backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            )}

            {report.image_url && (
              <div style={{ marginLeft: "20px", textAlign: "center" }}>
                <a href={`http://localhost:3000${report.image_url}`} target="_blank" rel="noreferrer">
                  <img
                    src={`http://localhost:3000${report.image_url}`}
                    alt="Hazard"
                    style={{ width: "140px", height: "140px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }}
                  />
                </a>
                <p style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}>View Full Image</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StaffDashboard