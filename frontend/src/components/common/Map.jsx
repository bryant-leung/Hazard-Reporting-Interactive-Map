import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../../styles.css";
import userImg from '../../assets/user.png';
import close from '../../assets/close.png';

let userPosition = null;
navigator.geolocation.getCurrentPosition(
    (position) => {
        userPosition = position;
    },
    (error) => {
        console.error("Geolocation preload failed:", error);
    },
    {
        enableHighAccuracy: false,
        maximumAge: 60000
    }
);
// Marker pin imported online
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],           
    iconAnchor: [12, 41],         
    popupAnchor: [1, -34],        
    shadowSize: [41, 41]
});
const userIcon = L.icon({
    iconUrl: userImg,
    iconSize: [41, 41],
    iconAnchor: [20, 41],
    popupAnchor: [0, -41],
    shadowSize: [41, 41]
});
const img = new Image();
img.src = userImg;
const MapComponent = () => {
    const { user } = useAuth();
    const [clickedCoords, setClickedCoords] = useState(null);
    const markers = [];
    const [selectedReport, setSelectedReport] = useState(null);
    useEffect(() => {
        if (!user) return; 

        // Initialize map
        const map = L.map("map").setView([52.4506,-1.9306], 13);
        let currentMarker;
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        if (userPosition) {
            const lat = userPosition.coords.latitude;
            const lng = userPosition.coords.longitude;

            map.setView([lat, lng], 14);

            L.marker([lat, lng], { icon: userIcon })
                .addTo(map)
                .bindPopup("You are here!")
                .openPopup();
        } else {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                map.setView([lat, lng], 14);

                L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup("You are here!")
                    .openPopup();
            });
        }

        fetch("http://localhost:3000/heatmap-data")
            .then(response => response.json())
            .then(data => {
                data.forEach(report => {
                    const marker = L.marker([report.lat, report.lng]);
                    marker.on("click", (e) => {
                        L.DomEvent.stopPropagation(e);
                        setSelectedReport(report);
                    });
                    markers.push(marker);
                    marker.addTo(map);
                });
            })
            .catch(error => console.error("Error loading existing reports:", error));

        async function submitForm(event) {
            event.preventDefault(); 
            const form = event.target;
            const formData = new FormData(form); 
            const token = localStorage.getItem("token");

            formData.append("reporter_user_id", user.id);
            formData.append("location_name", "Map Pin");

            try {
                const response = await fetch("http://localhost:3000/report-hazard", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData 
                });

                if (response.ok) {
                    alert("Report submitted successfully!");
                    if (currentMarker) map.removeLayer(currentMarker);
                    
                    const lat = parseFloat(formData.get("latitude"));
                    const lng = parseFloat(formData.get("longitude"));
                    const category = formData.get("hazard_category");

                    L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(`<b>${category}</b><br>Submitted!`)
                        .openPopup();
                } else {
                    const errorData = await response.json();
                    console.error("Server Error:", errorData);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        function addMarker(e) {
            if (currentMarker) {
                map.removeLayer(currentMarker);
            }
            currentMarker = L.marker(e.latlng).addTo(map);
            currentMarker.bindPopup( 
                `
                <div>
                    <b>Selected Location</b><br><br>

                    <a 
                        href="https://www.google.com/maps?q=${e.latlng.lat},${e.latlng.lng}" 
                        target="_blank"
                        style="display:inline-block;margin-bottom:10px;color:blue;"
                    >
                        📍 Open in Google Maps
                    </a>

                    <form id="report">
                        <label for="hazard_category">Category:</label><br>
                        <select name="hazard_category" id="hazard_category">
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Blocked Access">Blocked Access</option>
                            <option value="Safety Hazard">Safety Hazard</option>
                            <option value="Vandalism">Vandalism</option>
                            <option value="Other">Other</option>
                        </select><br>

                        <label for="description">Description:</label><br>
                        <input type="text" id="description" name="description" required /><br><br>

                        <label for="hazard_image">Upload Photo (Optional):</label><br>
                        <input type="file" id="hazard_image" name="hazard_image" accept="image/*" /><br><br>

                        <input type="hidden" name="latitude" value="${e.latlng.lat}" />
                        <input type="hidden" name="longitude" value="${e.latlng.lng}" />

                        <button type="submit">Submit report</button>
                    </form>
                </div>
            `
            );
            currentMarker.on("popupopen", () => { 
                const reportForm = document.getElementById("report");
                reportForm.addEventListener("submit", submitForm);
            });
            currentMarker.openPopup();
        }
        function handleMapClick(e) {
            setClickedCoords({
                lat: e.latlng.lat.toFixed(5),
                lng: e.latlng.lng.toFixed(5)
            });

            if (user.role === "guest") {
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }

                currentMarker = L.marker(e.latlng).addTo(map);
                currentMarker
            .bindPopup(`
                <div>
                    <b>Guest Access</b><br>
                    You cannot report hazards while in guest mode.<br>
                    Please log in or register.<br><br>

                    <a 
                        href="https://www.google.com/maps?q=${e.latlng.lat},${e.latlng.lng}" 
                        target="_blank"
                        rel="noopener noreferrer"
                        style="display:inline-block;color:blue;"
                    >
                        📍 Open in Google Maps
                    </a>
                </div>
            `)
                    .openPopup();

            } else {
                addMarker(e); // normal behaviour for residents
            }
        }
        function zoomMarkers() {
            const zoom = map.getZoom();
            const shouldShow = zoom >= 14;

            markers.forEach(marker => {
                if (shouldShow) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0);
                }
            });
        }
        map.on("zoomend", zoomMarkers);
        map.on("click", handleMapClick);

        map.on("mousemove", (e) => {
            setClickedCoords({
                lat: e.latlng.lat.toFixed(5),
                lng: e.latlng.lng.toFixed(5)
            });
        });
        
        return () => {
            map.remove();
        };
    }, [user]);

    if (!user) return <div>Please log in to view the map.</div>;

    return (
        <>
            {user.role === "guest" && (
                <div
                    style={{
                        backgroundColor: '#fff3cd',
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '6px',
                        color: '#856404'
                    }}
                >
                    You are viewing as a guest. Hazard reporting is disabled. Please log in to submit a report.
                </div>
            )}

            <div style={{ position: "relative", height: "600px", width: "100%" }}>
            <div id="map" style={{ height: "100%", width: "100%" }}></div>
                {clickedCoords && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                                left: "10px",
                                backgroundColor: "white",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                boxShadow: "0 1px 5px rgba(0,0,0,0.3)",
                                fontSize: "14px",
                                zIndex: 1000
                            }}
                        >
                            Latitude: {clickedCoords.lat} <br />
                            Longitude: {clickedCoords.lng}
                        </div>
                    )}
                <div className={`report-panel ${selectedReport ? "show" : ""}`}>
                    {selectedReport && (
                        <>
                            <h3>{selectedReport.cat}</h3>
                            <p>{selectedReport.desc}</p>
                            <p>
                                <strong>Status: </strong>
                                <span style={{
                                    display: "inline-block",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    backgroundColor:
                                        selectedReport.status === "resolved" ? "#d4edda" :
                                        selectedReport.status === "in_progress" ? "#fff3cd" :
                                        "#f8d7da",
                                    color:
                                        selectedReport.status === "resolved" ? "#155724" :
                                        selectedReport.status === "in_progress" ? "#856404" :
                                        "#721c24"
                                }}>
                                    {selectedReport.status ?? "pending"}
                                </span>
                            </p>

                            <br /><br />
                            <button onClick={() => setSelectedReport(null)}>
                                <img src={close} alt="Close" style={{ width: "16px", height: "16px" }} />
                            </button>
                        </>
                    )}
                </div>

            </div>
        </>
    );
};

export default MapComponent;