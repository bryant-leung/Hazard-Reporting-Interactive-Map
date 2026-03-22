import { useState } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from "react-router-dom" // useLocation added to grab coordinates from dashboard

// simple page where residents can submit a hazard report
function ReportHazardPage() {

  const { user } = useAuth() // Activate the import and get the current user from AuthContext
  const navigate = useNavigate()
  const locationState = useLocation() // Capture state passed from map click
  
  // storing the form data in state
  const [title, setTitle] = useState("") 
  const [description, setDescription] = useState("1")
  const [severity, set_severity] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("Infrastructure"); 
  const [latitude, setLatitude] = useState(locationState.state?.lat || "") // Pre-fill with map lat if available
  const [longitude, setLongitude] = useState(locationState.state?.lng || "") 
  const [hazardImage, setHazardImage] = useState(null)

  // this runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Get jwt token before allowing report submission
    const token = localStorage.getItem("token");

    const formData = new FormData()

formData.append("reporter_user_id", user.id)
formData.append("hazard_category", category)
formData.append("description", description)
formData.append("severity", severity)
formData.append("location_name", location)
formData.append("latitude", latitude ? parseFloat(latitude) : "")
formData.append("longitude", longitude ? parseFloat(longitude) : "")

if (hazardImage) {
  formData.append("hazard_image", hazardImage)
}

    try {
      
      const response = await fetch(`http://localhost:3000/report-hazard`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
})

      if (response.ok) {
        alert("Hazard reported successfully!")
        navigate("/resident") // Redirect back to resident dashboard after submission
      } else {
        const errorData = await response.json();
        alert("Failed to report hazard: " + (errorData.message || "Server Error"));
      }
    } catch (error) {
      console.error("Error reporting hazard:", error)
      alert("Error connecting to Node.js backend (Port 3000).")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* ADDED: Back button to return to the map view */}
      <button 
        onClick={() => navigate("/resident")} 
        style={{ 
          marginBottom: "20px", 
          padding: "8px 12px", 
          cursor: "pointer",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      >
        ← Back to Map
      </button>

      <h2>Report a Hazard</h2>

      {/* hazard report form */}
      <form onSubmit={handleSubmit}>

        <div>
          <label>Hazard Category</label>
          <br />
          {/* Choice selection box matching SQL ENUMs */}
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "5px", width: "100%" }}
          >
            <option value="Infrastructure">Infrastructure</option>
            <option value="Blocked Access">Blocked Access</option>
            <option value="Safety Hazard">Safety Hazard</option>
            <option value="Vandalism">Vandalism</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <br />

        <div>
          <label>Hazard Severity</label>
          <br />
          {/* Choice selection box matching 1 - 5 Scale */}
          <select 
            value={severity} 
            onChange={(e) => set_severity(e.target.value)}
            style={{ padding: "5px", width: "100%" }}
          >
            <option value= "1">1 - Mild Inconvenience</option>
            <option value="2">2 - Major Inconvenience</option>
            <option value="3">3 - Potentially Dangerous</option>
            <option value="4">4 - Dangerous</option>
            <option value="5">5 - Incredibly Dangerous</option>
          </select>
        </div>

        <br />

        <div>
          <label>Hazard Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <br />

        <div style={{ display: 'flex', gap: '10px' }}>
          <div>
            <label>Latitude</label><br />
            <input 
              type="text" 
              step="any" 
              value={latitude} 
              onChange={(e) => setLatitude(e.target.value)} 
              placeholder="e.g. 52.4862"
              required 
            />
          </div>
          <div>
            <label>Longitude</label><br />
            <input 
              type="text" 
              step="any" 
              value={longitude} 
              onChange={(e) => setLongitude(e.target.value)} 
              placeholder="e.g. -1.8904"
              required 
            />
          </div>
        </div>
        
        <br />

        <div>
          <label>Description</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Location</label>
          <br />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
  <label>Upload Photo (Optional)</label>
  <br />
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setHazardImage(e.target.files[0])}
  />
</div>

<br />

        {/* Loading state added to button for better UX */}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>

      </form>
    </div>
  )
}

export default ReportHazardPage