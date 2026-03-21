import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "../../styles.css";
import 'leaflet.heat'
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

    const [heatmap_toggle, view_heatmap] = useState(false); //state to track if heatmap is on or off
    const [time_range, set_time_range] = useState("all");//state to track the selected time range
    const heatmap_layer_ref = useRef(null); //ref to store current heatmap layer
    const map_ref = useRef(null); //ref to store the leaflet map
    const points_ref = useRef([]); //ref to store heatmap data points
    const markers_ref = useRef([]); //ref to store the pins when the heatmap is on

    const { user, highContrast } = useAuth();
    const [clickedCoords, setClickedCoords] = useState(null);
    const markers = [];
    const [selectedReport, setSelectedReport] = useState(null);
    const currentMarkerRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [chatSort, setChatSort] = useState("hot");
    const [newMessage, setNewMessage] = useState("");
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
        return L.heatLayer(points , {
            radius: 40,
            blur: 25,
            max: 5,
            minOpacity: 0.5,
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
         L.tileLayer(
                    highContrast
                        ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png'
                        : 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png',
                    {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }
                ).addTo(map);

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

                const userMarker = L.marker([lat, lng], { icon: userIcon })
                                    .addTo(map)
                                    .bindPopup("You are here!");
                                userMarker.on("click", (e) => {
                                    L.DomEvent.stopPropagation(e);
                                    if (currentMarkerRef.current) {
                                        map.removeLayer(currentMarkerRef.current);
                                        currentMarkerRef.current = null;
                                    }
                                    userMarker.openPopup();
                                });
            });
        }

        fetch("http://localhost:3000/heatmap-data")
            .then(response => response.json())
            .then(data => {
                data.forEach(report => {
                    const marker = L.marker([report.lat, report.lng]);
                    marker.on("click", (e) => {
                        L.DomEvent.stopPropagation(e);
                        if (currentMarkerRef.current) {
                            map.removeLayer(currentMarkerRef.current);
                            currentMarkerRef.current = null;
                        }
                        setSelectedReport(report);
                    });
                    markers.push(marker);
                    marker.addTo(map);
                    markers_ref.current.push(marker); // storing markers for switching
                });
                points_ref.current = data.map(p => [p.lat, p.lng, p.value]); //storing the values from the markers
            })
            .catch(error => console.error("Error loading existing reports:", error));

        async function submitForm(event, address) {
            event.preventDefault(); 
            const form = event.target;
            const formData = new FormData(form); 
            const token = localStorage.getItem("token");

            formData.append("reporter_user_id", user.id);
            formData.append("location_name", address || "Map Pin");

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
                    if (currentMarkerRef.current) {
                        map.removeLayer(currentMarkerRef.current);
                        currentMarkerRef.current = null;
                    }
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

        async function addMarker(e) {
            if (currentMarkerRef.current) {
                map.removeLayer(currentMarkerRef.current);
                currentMarkerRef.current = null;
            }

            let address = "Loading address...";
            currentMarkerRef.current = L.marker(e.latlng).addTo(map);
            
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
                const data = await response.json();
                address = data.display_name || "Unknown Location";
            } catch (err) {
                address = "Map Pin";
            }

                currentMarkerRef.current.bindPopup( 
                `
                <div>
                    <b>Selected Location</b><br>
                    <small>${address}</small><br><br>

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

                        <label for="severity">Category:</label><br>
                        <select name="severity" id="severity">
                            <option value= "1">1 - Mild Inconvenience</option>
                            <option value="2">2 - Major Inconvenience</option>
                            <option value="3">3 - Potentially Dangerous</option>
                            <option value="4">4 - Dangerous</option>
                            <option value="5">5 - Incredibly Dangerous</option>
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
            currentMarkerRef.current.on("popupopen", () => { 
                const reportForm = document.getElementById("report");
                reportForm.addEventListener("submit", (event) => submitForm(event, address));
            });
            currentMarkerRef.current.openPopup();
        }
        function handleMapClick(e) {
            setClickedCoords({
                lat: e.latlng.lat.toFixed(5),
                lng: e.latlng.lng.toFixed(5)
            });

            if (user.role === "guest") {
                if (currentMarkerRef.current) {
                    map.removeLayer(currentMarkerRef.current);
                    currentMarkerRef.current = null;
                }
                
                currentMarkerRef.current = L.marker(e.latlng).addTo(map);
                currentMarkerRef.current
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
    }, [user, highContrast]);

    useEffect(() => {
        if (!selectedReport) return;
        fetch(`http://localhost:3000/chat-messages?reportId=${selectedReport.id}&sort=${chatSort}`)
            .then(res => res.json())
            .then(data => {
                setMessages(data);
            })
            .catch(err => console.error("Error loading chat messages:", err));
        
        
    }, [selectedReport, chatSort]);

    if (!user) return <div>Please log in to view the map.</div>;
    const sendMessage = async () => {
            if (!newMessage.trim() || !selectedReport) return;
            console.log("Sending message:", newMessage);
            const token = localStorage.getItem("token");
            try {
                const res = await fetch("http://localhost:3000/send-messages", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"  
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        hazard_id: selectedReport.id,
                        message: newMessage
                    })
                });
                const text = await res.text();
let data;
try {
    data = JSON.parse(text);
} catch {
    data = text;
}
                console.log("Message send response:", data);
                if (res.ok) {
                    setMessages(prev => [data, ...prev]);
                    setNewMessage("");
                } else {
                    console.error(data);
                }
            } catch (err) {
                console.error("Error sending message:", err);
            }
        };
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
                                color: "black",
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
                            <h3 style={{ marginTop: "0" }}>{selectedReport.cat} hazard</h3>
                            <p ><b>Location:</b> <em>{selectedReport.location}</em></p>
                            <p><b>Description:</b>   {selectedReport.desc}</p>
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

                            <p>
                                <strong>Severity: </strong>
                                <span style={{
                                    display: "inline-block",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    backgroundColor:
                                        selectedReport.value === 1 ? "#a3a9fd" :
                                        selectedReport.value === 2 ? "#97f7e9" :
                                        selectedReport.value === 3 ? "#d3fcbd" :
                                        selectedReport.value === 4 ? "#fcffa9" :
                                        "#f8d7da",
                                        
                                    color:
                                        selectedReport.value === 1 ? "#000a97" :
                                        selectedReport.value === 2 ? "#009c85" :
                                        selectedReport.value === 3 ? "#3cab00" :
                                        selectedReport.value === 4 ? "#a8ad0a" :
                                        "#721c24",
                                }}>
                                    {{
                                        1: "1 - Mild Inconvenience",
                                        2: "2 - Major Inconvenience",
                                        3: "3 - Potentially Dangerous",
                                        4: "4 - Dangerous",
                                        5: "5 - Incredibly Dangerous",
                                    }[selectedReport.value] ?? "Unknown"}
                                </span>
                            </p>
                            {messages.length > 0 && (
                                <>
                                    <select 
                                        value={chatSort} 
                                        onChange={(e) => setChatSort(e.target.value)}
                                        style={{ marginBottom: "10px", marginLeft: "5px" }}
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="hot">Hot</option>
                                    </select>
                                </>
                            )}
                            <div style={{ maxHeight: "230px", overflowY: "auto" }}>
                                {messages.length === 0 ? (
                                    <p>No messages yet.</p> 
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i}>
                                            <hr></hr>
                                            <strong>{msg.email}</strong>
                                            <p>{msg.message}</p>
                                            <small>{new Date(msg.created_at).toLocaleString()}</small>
                                            <p>👍 {msg.vote}</p>
                                        </div>
                                    ))
                                )}<hr></hr>
                            </div>
                            <div style={{ position: "absolute", bottom: "10px", width: "93%" }}>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write a message..."
                                    rows="2"
                                    style={{
                                        width: "100%",
                                        padding: "8px 60px 8px 8px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        resize: "none",
                                        boxSizing: "border-box"
                                    }}
                                />

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        sendMessage();
                                    }}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        bottom: "10px",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                            <br /><br />
                            <button onClick={() => setSelectedReport(null)}>
                                <img src={close} alt="Close" style={{ width: "16px", height: "16px" }} />
                            </button>
                        </>
                    )}
                </div>

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