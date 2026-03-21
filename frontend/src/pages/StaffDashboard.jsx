import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../components/common/Map";
import IssueChatBox from "../components/IssueChatBox";

// staff dashboard page
// for now this is just frontend logic with sample data
// later we can connect it to the backend / database
function StaffDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId] = useState(1);

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("");

  const token = localStorage.getItem("token");

  // 1. Fetch real reports from the database on load
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/view-hazards", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setLoading(false);
    }
  };

  // save the edited report back into the reports array
  async function handleSave(id) {
    const note = window.prompt("Enter a staff note for this status change:");

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
          note: note || "Updated via Staff Dashboard"
        })
      });

      if (response.ok) {
        alert("Report updated and logged in database!");
        setEditingId(null);
        fetchReports();
      }
    } catch (err) {
      alert("Error updating report");
    }
  }

  // remove a report from the list
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await fetch(`http://localhost:3000/admin/delete-hazard/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setReports(reports.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // open the edit form for one report
  function handleEditClick(report) {
    setEditingId(report.id);
    setEditedCategory(report.category);
    setEditedDescription(report.description);
    setEditedStatus(report.status);
  }

  if (loading) return <p>Loading reports...</p>;

  return (
    <div style={{ padding: "20px", position: "relative" }}>
      <h1>Staff Dashboard</h1>

      {/* Container fix: relative positioning and z-index keeps the map from overlapping the latest reports */}
      <div
        style={{
          position: "relative",
          height: "600px",
          width: "100%",
          marginBottom: "60px",
          zIndex: 1,
          overflow: "hidden",
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}
      >
        <Map />
      </div>

      {/* TODO: Replace selectedReportId with map marker selection */}
      <div style={{ position: "absolute", top: "90px", right: "20px", zIndex: 1000 }}>
        <IssueChatBox reportId={selectedReportId} role="Admin" />
      </div>

      <h2 style={{ marginTop: "20px", clear: "both" }}>Manage Reports</h2>

      {reports.length === 0 ? (
        <p>No active reports at the moment.</p>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginTop: "15px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              position: "relative",
              zIndex: 2
            }}
          >
            {editingId === report.id ? (
              <div style={{ flex: 1 }}>
                <div>
                  <label>Status</label>
                  <br />
                  <select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>

                <br />

                <div>
                  <label>Description</label>
                  <br />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    style={{ width: "90%" }}
                  />
                </div>

                <br />

                <button onClick={() => handleSave(report.id)}>Save</button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Category:</strong> {report.category}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.location_name}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: report.status === "Fixed" ? "green" : "orange", fontWeight: "bold" }}>
                    {report.status}
                  </span>
                </p>
                <p><strong>Reporter:</strong> {report.reporter_email}</p>

                <button onClick={() => handleEditClick(report)}>Update Status</button>
                <button
                  onClick={() => handleDelete(report.id)}
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "#ff4d4d",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            )}

            {report.image_url && (
              <div style={{ marginLeft: "20px", textAlign: "center" }}>
                <a href={`http://localhost:3000${report.image_url}`} target="_blank" rel="noreferrer">
                  <img
                    src={`http://localhost:3000${report.image_url}`}
                    alt="Hazard"
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #eee"
                    }}
                  />
                </a>
                <p style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}>View Full Image</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default StaffDashboard;