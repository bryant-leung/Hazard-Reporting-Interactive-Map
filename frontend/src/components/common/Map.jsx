import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../../styles.css";
import 'leaflet.heat'

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

    const [heatmap_toggle, view_heatmap] = useState(false); //state to track if heatmap is on or off
    const [time_range, set_time_range] = useState("all");//state to track the selected time range
    const heatmap_layer_ref = useRef(null); //ref to store current heatmap layer
    const map_ref = useRef(null); //ref to store the leaflet map
    const points_ref = useRef([]); //ref to store heatmap data points
    const markers_ref = useRef([]); //ref to store the pins when the heatmap is on

    const { user } = useAuth();

    const [clickedCoords, setClickedCoords] = useState(null);

    function get_dates(range) { //calculate the start and end dates we should pull from the database based on the given range, using the current date
        const start = new Date();
        const end = new Date();

        if (range == "today") start.setHours(0,0,0,0);
        else if (range == "week") start.setDate(start.getDate() -7);
        else if (range == "month") start.setMonth(start.getMonth() -1);
        else if (range == "year") start.setFullYear(start.getFullYear() -1);
        else return null; // null if all time is selected, as we need to call the heatmap-data with no arguments
        return { start : start.toISOString(), end: end.toISOString()}
    }

    function build_heatmap_layer(points) { //build the heatmap with dynamic max val TODO UPDATE THE SEVERITY SCORE SO WE HAVE SOMETHING TO BASE THIS OFF also check if colours and max amount are good, currently TBD
        const max_val = points.reduce((acc, p) => Math.max(acc, p[2]), 1);
        return L.heatLayer(points , {
            radius: 40,
            blur: 25,
            max: max_val*0.6,
            minOpacity: 0.7,
            gradient: {
                0.0: 'blue',
                0.4: 'cyan',
                0.6: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        })
    }
    useEffect(() => {
    if (!map_ref.current) return; //safeguard for unitialised map

    const range = get_dates(time_range);
    const url = range
        ? `http://localhost:3000/heatmap-data?start_time=${range.start}&end_time=${range.end}` //if range is not null get data between date range, else just all of the data
        : "http://localhost:3000/heatmap-data";
    
    fetch(url)
        .then(res => res.json()) //convert response to json
        .then(data => {
            points_ref.current = data.map(p => [p.lat, p.lng, p.value]); //convert data to correct format

        if (heatmap_toggle && heatmap_layer_ref.current){ //if heatmap is enabled, refresh for changing date selection
            map_ref.current.removeLayer(heatmap_layer_ref.current); //remove old heatmap layer
            heatmap_layer_ref.current = build_heatmap_layer(points_ref.current).addTo(map_ref.current); //create and update new layer
        } 
    })
    } , [time_range] //runs when time range changes
    );

    useEffect(() => { 
    if (!map_ref.current) return;

    if (heatmap_toggle) {
        markers_ref.current.forEach(m => m.remove());
        heatmap_layer_ref.current = build_heatmap_layer(points_ref.current).addTo(map_ref.current);

    } else {
        if (heatmap_layer_ref.current) {
            map_ref.current.removeLayer(heatmap_layer_ref.current);
            heatmap_layer_ref.current = null;
        }
        markers_ref.current.forEach(m => m.addTo(map_ref.current)); //re-add the markers to the map
    }
} , [heatmap_toggle] //runs when view is changed from map to heatmap
);

    useEffect(() => {
        if (!user) return; 

        // Initialize map
        const map = L.map("map").setView([52.4506,-1.9306], 13);
        map_ref.current = map; //saving the current state of the map
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

                    const marker = L.marker([report.lat, report.lng])
                        .addTo(map)
                        .bindPopup(`<b>Reported Hazard</b>`);
                    markers_ref.current.push(marker); // storing markers for switching
                });
                points_ref.current = data.map(p => [p.lat, p.lng, p.value]); //storing the values from the markers
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

            <input type="hidden" name="latitude" value="${e.latlng.lat}" />
            <input type="hidden" name="longitude" value="${e.latlng.lng}" />

            <button type="submit">Submit report</button>
        </form>
    </div>
`
);
            currentMarker.on("popupopen", () => { 
                const reportForm = document.getElementById("report");
                reportForm.addEventListener("submit", submitForm, {once: true}); //added a safeguard here for if the user opens then closes the popup, to avoid duplicate reports
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
        <button onClick={() => view_heatmap(prev => !prev)}>
            {heatmap_toggle ? "Display Markers" : "Display Heatmap"}
        </button>

        {heatmap_toggle && (
            <select value={time_range} onChange={e => set_time_range(e.target.value)}>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
                <option value="all">All Time</option>
            </select>
        )}
    </>
);
};




export default MapComponent;