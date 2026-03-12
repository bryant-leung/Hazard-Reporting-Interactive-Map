import { useState } from "react"
import { useNavigate } from "react-router-dom"

// staff dashboard page
// for now this is just frontend logic with sample data
// later we can connect it to the backend / database
function StaffDashboard() {
  const navigate = useNavigate()

  // sample reports for now so we can test the UI
  const [reports, setReports] = useState([
    {
      id: 1,
      category: "Road",
      description: "Large pothole near the traffic lights",
      location: "Birmingham City Centre",
      status: "Reported"
    },
    {
      id: 2,
      category: "Pole",
      description: "Street light pole is bent",
      location: "Edgbaston",
      status: "Reported"
    }
  ])

  // this stores which report is being edited
  const [editingId, setEditingId] = useState(null)

  // these store the edited values while staff is changing a report
  const [editedCategory, setEditedCategory] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedLocation, setEditedLocation] = useState("")
  const [editedStatus, setEditedStatus] = useState("")

  // open the edit form for one report
  function handleEditClick(report) {
    setEditingId(report.id)
    setEditedCategory(report.category)
    setEditedDescription(report.description)
    setEditedLocation(report.location)
    setEditedStatus(report.status)
  }

  // save the edited report back into the reports array
  function handleSave(id) {
    const updatedReports = reports.map((report) => {
      if (report.id === id) {
        return {
          ...report,
          category: editedCategory,
          description: editedDescription,
          location: editedLocation,
          status: editedStatus
        }
      }
      return report
    })

    setReports(updatedReports)
    setEditingId(null)
  }

  // remove a report from the list
  function handleDelete(id) {
    const updatedReports = reports.filter((report) => report.id !== id)
    setReports(updatedReports)
  }

  return (
    <div>
      <h1>Staff Dashboard</h1>

      {/* other teammate features can still go here later */}
      <p>Heatmap and hazard list will go here</p>

      {/* staff can also report a hazard like residents */}
      <button onClick={() => navigate("/report-hazard")}>
        Report Hazard
      </button>

      <h2 style={{ marginTop: "20px" }}>Manage Reports</h2>

      {reports.length === 0 ? (
        <p>No active reports at the moment.</p>
      ) : (
        reports.map((report) => (
          <div
            key={report.id}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              marginTop: "12px",
              borderRadius: "6px"
            }}
          >
            {editingId === report.id ? (
              <div>
                {/* edit form for one report */}
                <div>
                  <label>Category</label>
                  <br />
                  <input
                    type="text"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                  />
                </div>

                <br />

                <div>
                  <label>Description</label>
                  <br />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                </div>

                <br />

                <div>
                  <label>Location</label>
                  <br />
                  <input
                    type="text"
                    value={editedLocation}
                    onChange={(e) => setEditedLocation(e.target.value)}
                  />
                </div>

                <br />

                <div>
                  <label>Status</label>
                  <br />
                  <input
                    type="text"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
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
              <div>
                {/* normal report display */}
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Category:</strong> {report.category}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.location}</p>
                <p><strong>Status:</strong> {report.status}</p>

                <button onClick={() => handleEditClick(report)}>Edit</button>
                <button
                  onClick={() => handleDelete(report.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default StaffDashboard
