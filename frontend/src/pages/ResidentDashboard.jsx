import { useNavigate } from "react-router-dom"

// resident dashboard page
// this is where residents will see the map and hazard list
function ResidentDashboard() {

  // useNavigate lets us move to another page
  const navigate = useNavigate()

  return (
    <div>

      <h1>Resident Dashboard</h1>

      <p>Heatmap and hazard list will go here</p>

      {/* button that takes the user to the hazard report page */}
      <button onClick={() => navigate("/report-hazard")}>
        Report Hazard
      </button>

    </div>
  )
}

export default ResidentDashboard
