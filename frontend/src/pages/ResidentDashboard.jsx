import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Map from "../components/common/Map";
import IssueChatBox from "../components/IssueChatBox";

// resident dashboard page
// this is where residents will see the map and hazard list
function ResidentDashboard() {
  const navigate = useNavigate();
  const [selectedReportId] = useState(1);

  return (
    <div style={{ position: "relative" }}>
      <h1>Resident Dashboard</h1>

      <p>hazard list will go here</p>

      {/* map added here so residents can view hazards on dashboard */}
      <div style={{ marginTop: "20px", marginBottom: "20px", colour: "#333" }}>
        <Map />
      </div>

      {/* button that takes the user to the hazard report page */}
      <button onClick={() => navigate("/report-hazard")}>
        Report Hazard
      </button>

      {/* TODO: Replace selectedReportId with map marker selection */}
      <div style={{ position: "absolute", bottom: "20px", right: "20px", zIndex: 1000 }}>
        <IssueChatBox reportId={selectedReportId} role="Resident" />
      </div>
    </div>
  );
}

export default ResidentDashboard;