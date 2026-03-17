import { useEffect } from 'react';
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
                user_id: user.id,
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

        if (user.role!=="guest") {
            map.on("click", addMarker);
        }
        
        return () => {
            map.remove();
        };
    }, [user]);

    if (!user) return <div>Please log in to view the map.</div>;

    return (
        <div id="map" style={{ height: "500px", width: "100%" }}></div>
    );
};

export default MapComponent;