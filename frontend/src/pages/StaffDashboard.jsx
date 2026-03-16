import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"

function StaffDashboard() {
  const navigate = useNavigate()

  const [reports, setReports] = useState([
    { id: 1, category: "Road", description: "Large pothole near the traffic lights", location: "Birmingham City Centre", status: "Reported" },
    { id: 2, category: "Pole", description: "Street light pole is bent", location: "Edgbaston", status: "Reported" }
  ])

  const [editingId, setEditingId] = useState(null)
  const [editedCategory, setEditedCategory] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedLocation, setEditedLocation] = useState("")
  const [editedStatus, setEditedStatus] = useState("")

  function handleEditClick(report) {
    setEditingId(report.id)
    setEditedCategory(report.category)
    setEditedDescription(report.description)
    setEditedLocation(report.location)
    setEditedStatus(report.status)
  }

  function handleSave(id) {
    setReports(reports.map((r) =>
      r.id === id
        ? { ...r, category: editedCategory, description: editedDescription, location: editedLocation, status: editedStatus }
        : r
    ))
    setEditingId(null)
  }

  function handleDelete(id) {
    setReports(reports.filter((r) => r.id !== id))
  }

  function statusBadgeClass(status) {
    if (status === 'In Progress') return 'badge badge-progress'
    if (status === 'Fixed') return 'badge badge-fixed'
    return 'badge badge-reported'
  }

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

      <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' }}>
        Manage Reports
      </h2>

      {reports.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No active reports at the moment.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div className="report-card" key={report.id}>
            {editingId === report.id ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" type="text" value={editedCategory} onChange={(e) => setEditedCategory(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" type="text" value={editedLocation} onChange={(e) => setEditedLocation(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
                <div className="report-card-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSave(report.id)}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '15px' }}>{report.category}</strong>
                  <span className={statusBadgeClass(report.status)}>{report.status}</span>
                </div>
                <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '13px' }}>{report.location}</p>
                <p style={{ margin: '6px 0 0', fontSize: '14px' }}>{report.description}</p>
                <div className="report-card-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(report)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(report.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StaffDashboard
