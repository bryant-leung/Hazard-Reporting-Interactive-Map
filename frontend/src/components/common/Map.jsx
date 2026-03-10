import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../style.css";
//https://www.youtube.com/watch?v=LxenV0YaX8M
const map = L.map("map").setView([52.4506,-1.9306], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);