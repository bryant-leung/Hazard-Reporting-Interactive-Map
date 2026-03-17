import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../../styles.css";

const MapComponent = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return; 

    const map = L.map("map").setView([52.4506,-1.9306], 13);
    let currentMarker;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    async function submitForm(event) {
        event.preventDefault(); 
        const form = event.target;
        const formData = new FormData(form);
        const token = localStorage.getItem("token");

        const hazardData = {
            user_id: user.id,
            hazard_category: formData.get("hazard_category"),
            description: formData.get("description"),
            latitude: parseFloat(formData.get("latitude")),
            longitude: parseFloat(formData.get("longitude")),
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
                map.closePopup();
            } else {
                const errorData = await response.json();
                alert("Failed to report hazard: " + (errorData.message || "Server Error"));
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Error connecting to backend.");
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
        
    navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    L.marker([lat, long]).addTo(map).bindPopup("You are here!").openPopup();
    });

    return () => {
            map.remove();
        };
    }, [user]);

    if (!user) {
        return <div>Please log in to view the map.</div>;
    }

    return (
        <div id="map" style={{ height: "500px", width: "100%" }}></div>
    );
};

export default MapComponent;