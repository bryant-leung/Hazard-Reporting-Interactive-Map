import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"


// resident dashboard page
// this is where residents will see the map and hazard list
function ResidentDashboard() {


  // useNavigate lets us move to another page
  const navigate = useNavigate()


  return (
    <div >
      <h1 style={{ marginTop: "0" }}>Resident Dashboard</h1>


      <p>hazard list will go here</p>


      {/* map added here so residents can view hazards on dashboard */}
      <div style={{marginBottom: "20px", colour: "#333" }}>
        <Map />
      </div>


      {/* button that takes the user to the hazard report page */}
      <button onClick={() => navigate("/report-hazard")}>
        Report Hazard
      </button>


    </div>
  )
}


export default ResidentDashboard
