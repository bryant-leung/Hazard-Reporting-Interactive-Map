import { useState } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate } from "react-router-dom"

// simple page where residents can submit a hazard report
function ReportHazardPage() {

  const { user } = useAuth() // Activate the import and get the current user from AuthContext
  const navigate = useNavigate()
  
  // storing the form data in state
  const [title, setTitle] = useState("") // Keeping title as per your request, though category is used for the database
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("Infrastructure"); // Initialise state with first enum option

  // this runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Data construction matching format in sql table
    const hazardData = {
      reporter_user_id: user.id,
      category: category, // Using the enum state
      description: `Location: ${location}. Details: ${description}` // Collating location into description
    }

    try {
      const response = await fetch("http://localhost:3000/report-hazard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(hazardData)
      })

      if (response.ok) {
        alert("Hazard reported successfully!")
        navigate("/resident") // Redirect back to resident dashboard after submission
      } else {
        const errorMsg = await response.text();
        alert("Failed to report hazard. Please try again.")
      }
    } catch (error) {
      console.error("Error reporting hazard:", error)
      alert("Error connecting to backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
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

        {/* Loading state added to button for better UX */}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>

      </form>
    </div>
  )
}

export default ReportHazardPage