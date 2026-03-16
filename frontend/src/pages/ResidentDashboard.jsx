import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"
import { useAuth } from "../context/AuthContext"

function ResidentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Hazard Map</h1>
        {user?.role !== 'guest' && (
          <button className="btn btn-accent" style={{ width: 'auto' }} onClick={() => navigate("/report-hazard")}>
            + Report Hazard
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Map />
      </div>

      <div className="card">
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
          Hazard list coming soon.
        </p>
      </div>
    </div>
  )
}

export default ResidentDashboard
