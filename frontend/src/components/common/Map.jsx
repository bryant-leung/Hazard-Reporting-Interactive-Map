// Import userAuth for permissions etc, and useEffect to only build map after HTML is on page. 
import { useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
// import "../../style.css";

const MapComponent = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return; // authenticate user before building map
//https://www.youtube.com/watch?v=LxenV0YaX8M
//https://gis.stackexchange.com/questions/180080/putting-marker-and-save-location-in-db-for-leaflet-draw
    const map = L.map("map").setView([52.4506,-1.9306], 13);
    let currentMarker;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function submitForm(event) {
        event.preventDefault();

        const form = event.target;
        const reportData = new FormData(form);

        fetch("http://localhost:5000/report", {
            method: "POST",
            body: reportData
        })
        .then(response => response.json())
        .then(data => {
            alert("Report submitted successfully!");
        })
        .catch(error => {
            console.error("Error submitting report:", error);
        });
    }

    function addMarker(e) {
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        currentMarker = L.marker(e.latlng).addTo(map);
        currentMarker.bindPopup(`
            <form id="report">
                <label for="category">Category:</label><br>
                <select name="category" id="category">
                    <option value="road">Road</option>
                    <option value="pole">Pole</option>
                </select><br>
                <label for="description">Description:</label><br>
                <input type="text" id="description" name="description" /><br>
                <label for="uploadImage">Upload Image:</label><br>
                <input type="file" id="uploadImage" name="uploadImage" accept="image/*" /><br><br>
                <input type="hidden" name="lat" value="${e.latlng.lat}" />
                <input type="hidden" name="lng" value="${e.latlng.lng}" />
                <button type="submit">Submit report</button>
            </form>
        `).openPopup();

    }

    map.on('click', addMarker);
    map.on("popupopen", function () {
            const reportForm = document.getElementById("report");

            if (reportForm) {
                reportForm.addEventListener("submit", submitForm);
            }
        });
    
    
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