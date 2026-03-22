import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Map from "../components/common/Map"
import { useAuth } from "../context/AuthContext"

function ResidentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hazards, setHazards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:3000/heatmap-data")
      .then(res => res.json())
      .then(data => {
        setHazards(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function statusBadgeClass(status) {
    if (status === 'In Progress') return 'badge badge-progress'
    if (status === 'Fixed') return 'badge badge-fixed'
    return 'badge badge-reported'
  }

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

      <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px' }}>
        Nearby Hazards {!loading && `(${hazards.length})`}
      </h2>

      {loading ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Loading hazards...</p>
        </div>
      ) : hazards.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No hazards reported yet.</p>
        </div>
      ) : (
        hazards.map((hazard, i) => (
          <div className="report-card" key={hazard.id || i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <strong style={{ fontSize: '15px' }}>{hazard.category || hazard.cat || 'Hazard'}</strong>
              <span className={statusBadgeClass(hazard.status)}>{hazard.status || 'Reported'}</span>
            </div>
            <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              {hazard.location_name || hazard.location || 'Unknown location'}
            </p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>
              Severity: {hazard.value || hazard.severity || '—'}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '14px' }}>{hazard.description || hazard.desc}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default ResidentDashboard
