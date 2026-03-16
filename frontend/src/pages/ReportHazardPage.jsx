import { useState } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate } from "react-router-dom"

function ReportHazardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("Infrastructure")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem("token")
    const hazardData = {
      reporter_user_id: user.id,
      category,
      description: `Location: ${location}. Details: ${description}`
    }

    try {
      const response = await fetch("http://localhost:3000/report-hazard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(hazardData)
      })

      if (response.ok) {
        alert("Hazard reported successfully!")
        navigate("/resident")
      } else {
        alert("Failed to report hazard. Please try again.")
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
            <label className="form-label">Hazard Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Large pothole on main road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the hazard in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Corner of High St and Park Rd"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
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
