import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../../styles.css";

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

const MapComponent = () => {
    const { user } = useAuth();

    const [clickedCoords, setClickedCoords] = useState(null);

    useEffect(() => {
        if (!user) return; 

        // Initialize map
        const map = L.map("map").setView([52.4506,-1.9306], 13);
        let currentMarker;
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // display retained markers
        fetch("http://localhost:3000/heatmap-data")
            .then(response => response.json())
            .then(data => {
                data.forEach(report => {

                    L.marker([report.lat, report.lng])
                        .addTo(map)
                        .bindPopup(`<b>Reported Hazard</b>`);
                });
            })
            .catch(error => console.error("Error loading existing reports:", error));

        async function submitForm(event) {
            event.preventDefault(); 

            

            const form = event.target;
            const formData = new FormData(form);
            const token = localStorage.getItem("token");

            const lat = parseFloat(formData.get("latitude"));
            const lng = parseFloat(formData.get("longitude"));
            const category = formData.get("hazard_category");

            const hazardData = {
                reporter_user_id: user.id,
                hazard_category: category,
                description: formData.get("description"),
                latitude: lat,
                longitude: lng,
                location_name: "Map Pin"
            };

            try {
                const response = await fetch("http://localhost:3000/report-hazard", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(hazardData)
                });

                if (response.ok) {
                    alert("Report submitted successfully!");
                    if (currentMarker) map.removeLayer(currentMarker);
                    
                    // Add permanent marker immediately
                    L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(`<b>${category}</b><br>Submitted!`)
                        .openPopup();
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
                    
                    <input type="hidden" name="latitude" value="${e.latlng.lat}" />
                    <input type="hidden" name="longitude" value="${e.latlng.lng}" />
                    <button type="submit">Submit report</button>
                </form>
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
                    Please log in or register.
                </div>
            `)
            .openPopup();

    } else {
        addMarker(e); // normal behaviour for residents
    }
}

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

        <div style={{ position: "relative", height: "500px", width: "100%" }}>
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
        </div>
    </>
);
};

export default MapComponent;