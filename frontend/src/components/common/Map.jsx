// Import userAuth for permissions etc, and useEffect to only build map after HTML is on page. 
import { useEffect } from 'react';
import { userAuth } from '../context/AuthContext.jsx';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../style.css";

const MapComponent = () => {
    const { user } = userAuth();

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

    function addMarker(e) {
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }
        currentMarker = L.marker(e.latlng).addTo(map);
        currentMarker.bindPopup(`
            <div>
            </div>
        `).openPopup();
    }

    map.on('click', addMarker);

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