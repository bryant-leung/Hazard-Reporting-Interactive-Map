import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"

function StaffDashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterSeverity, setFilterSeverity] = useState("All")
  const [sortSeverity, setSortSeverity] = useState("None")
  const [editingId, setEditingId] = useState(null)
  const [editedCategory, setEditedCategory] = useState("")
  const [editedSeverity, setEditedSeverity] = useState("")
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

  function handleEditClick(report) {
    setEditingId(report.id)
    setEditedCategory(report.category)
    setEditedSeverity(report.severity || report.value)
    setEditedDescription(report.description)
    setEditedStatus(report.status)
  }

  async function handleSave(id) {
    const note = window.prompt("Enter a staff note for this status change:")
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
          severity: editedSeverity,
          note: note || "Updated via Staff Dashboard"
        })
      })
      if (response.ok) {
        alert("Report updated!")
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

  function statusBadgeClass(status) {
    if (status === 'In Progress') return 'badge badge-progress'
    if (status === 'Fixed') return 'badge badge-fixed'
    return 'badge badge-reported'
  }

  const filteredReports = reports
    .filter((report) => {
      const matchesSearch =
        (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.location_name && report.location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (report.id && report.id.toString().includes(searchQuery))
      const matchesCategory = filterCategory === "All" || report.category === filterCategory
      const matchesSeverity = filterSeverity === "All" || String(report.severity || report.value) === filterSeverity
      return matchesSearch && matchesCategory && matchesSeverity
    })
    .sort((a, b) => {
      if (sortSeverity === "HighToLow") return Number(b.severity || b.value) - Number(a.severity || a.value)
      if (sortSeverity === "LowToHigh") return Number(a.severity || a.value) - Number(b.severity || b.value)
      return 0
    })

  if (loading) return <p style={{ padding: '20px' }}>Loading reports...</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Staff Dashboard</h1>
        <button className="btn btn-accent" style={{ width: 'auto' }} onClick={() => navigate("/report-hazard")}>
          + Report Hazard
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
        <Map />
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-input" type="text" placeholder="Search ID, location, or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Blocked Access">Blocked Access</option>
              <option value="Safety Hazard">Safety Hazard</option>
              <option value="Vandalism">Vandalism</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Severity</label>
            <select className="form-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="All">All Levels</option>
              <option value="1">1 - Mild</option>
              <option value="2">2 - Major</option>
              <option value="3">3 - Potentially Dangerous</option>
              <option value="4">4 - Dangerous</option>
              <option value="5">5 - Incredibly Dangerous</option>
            </select>
          </div>
          <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Sort Severity</label>
            <select className="form-select" value={sortSeverity} onChange={(e) => setSortSeverity(e.target.value)}>
              <option value="None">Default</option>
              <option value="HighToLow">Highest to Lowest</option>
              <option value="LowToHigh">Lowest to Highest</option>
            </select>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' }}>
        Manage Reports ({filteredReports.length})
      </h2>

      {filteredReports.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No reports match your criteria.</p>
        </div>
      ) : (
        filteredReports.map((report) => (
          <div className="report-card" key={report.id}>
            {editingId === report.id ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="form-select" value={editedSeverity} onChange={(e) => setEditedSeverity(e.target.value)}>
                    <option value="1">1 - Mild Inconvenience</option>
                    <option value="2">2 - Major Inconvenience</option>
                    <option value="3">3 - Potentially Dangerous</option>
                    <option value="4">4 - Dangerous</option>
                    <option value="5">5 - Incredibly Dangerous</option>
                  </select>
                </div>
                <div className="report-card-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSave(report.id)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '15px' }}>{report.category}</strong>
                    <span className={statusBadgeClass(report.status)}>{report.status}</span>
                  </div>
                  <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '13px' }}>#{report.id} · {report.location_name}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}>Severity: {report.severity || report.value} · Reporter: {report.reporter_email}</p>
                  <p style={{ margin: '6px 0 0', fontSize: '14px' }}>{report.description}</p>
                  <div className="report-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(report)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(report.id)}>Delete</button>
                  </div>
                </div>
                {report.image_url && (
                  <div style={{ marginLeft: '16px' }}>
                    <a href={`http://localhost:3000${report.image_url}`} target="_blank" rel="noreferrer">
                      <img src={`http://localhost:3000${report.image_url}`} alt="Hazard" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StaffDashboard
