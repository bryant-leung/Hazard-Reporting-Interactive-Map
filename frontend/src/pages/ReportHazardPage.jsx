import { useState } from "react"

// simple page where residents can submit a hazard report
function ReportHazardPage() {

  // storing the form data in state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  // this runs when the form is submitted
  const handleSubmit = (e) => {
    e.preventDefault()

    // for now we are just printing the data
    // later this will be sent to the backend
    console.log("Hazard Report Submitted:")
    console.log("Title:", title)
    console.log("Description:", description)
    console.log("Location:", location)

    alert("Hazard report submitted (demo)")
  }

  return (
    <div>
      <h2>Report a Hazard</h2>

      {/* hazard report form */}
      <form onSubmit={handleSubmit}>

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

        <button type="submit">Submit Report</button>

      </form>
    </div>
  )
}

export default ReportHazardPage