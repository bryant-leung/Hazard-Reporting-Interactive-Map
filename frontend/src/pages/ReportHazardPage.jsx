import { useState } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from "react-router-dom"

function ReportHazardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const locationState = useLocation()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("1")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("Infrastructure")
  const [latitude, setLatitude] = useState(locationState.state?.lat || "")
  const [longitude, setLongitude] = useState(locationState.state?.lng || "")
  const [hazardImage, setHazardImage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("token")
    const formData = new FormData()
    formData.append("reporter_user_id", user.id)
    formData.append("hazard_category", category)
    formData.append("description", description)
    formData.append("severity", severity)
    formData.append("location_name", location)
    formData.append("latitude", latitude ? parseFloat(latitude) : "")
    formData.append("longitude", longitude ? parseFloat(longitude) : "")
    if (hazardImage) formData.append("hazard_image", hazardImage)

    try {
      const response = await fetch("http://localhost:3000/report-hazard", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })
      if (response.ok) {
        alert("Hazard reported successfully!")
        navigate("/resident")
      } else {
        const errorData = await response.json()
        alert("Failed to report hazard: " + (errorData.message || "Server Error"))
      }
    } catch (error) {
      alert("Error connecting to backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '640px' }}>
      <div className="page-header">
        <h1 className="page-title">Report a Hazard</h1>
        <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Hazard Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Blocked Access">Blocked Access</option>
              <option value="Safety Hazard">Safety Hazard</option>
              <option value="Vandalism">Vandalism</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Severity</label>
            <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="1">1 - Mild Inconvenience</option>
              <option value="2">2 - Major Inconvenience</option>
              <option value="3">3 - Potentially Dangerous</option>
              <option value="4">4 - Dangerous</option>
              <option value="5">5 - Incredibly Dangerous</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hazard Title</label>
            <input className="form-input" type="text" placeholder="e.g. Large pothole on main road" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Latitude</label>
              <input className="form-input" type="number" step="any" min="-90" max="90" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 52.4862" required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Longitude</label>
              <input className="form-input" type="number" step="any" min="-180" max="180" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. -1.8904" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Describe the hazard in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input className="form-input" type="text" placeholder="e.g. Corner of High St and Park Rd" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Photo (Optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setHazardImage(e.target.files[0])} />
          </div>

          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportHazardPage
