/* Leaflet Quick Start Guide Tutorial */


// L.map() creates a Leaflet map inside the HTML element with id "map"
// .setView() sets the starting center coordinates and zoom level
var map = L.map('map').setView([51.505, -0.09], 13);


// L.tileLayer() adds a basemap layer using OpenStreetMap tiles
// maxZoom sets the maximum zoom level allowed
// attribution shows credit to OpenStreetMap data source
// .addTo(map) adds the tile layer to the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 19,
   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// L.marker() creates a point marker at given coordinates
// .addTo(map) displays the marker on the map
var marker = L.marker([51.5, -0.09]).addTo(map);


// L.circle() creates a circle shape at given coordinates
// color is outline color, fillColor is inside color
// fillOpacity controls transparency, radius is size in meters
// .addTo(map) adds the circle to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);


// L.polygon() creates a polygon using multiple coordinate points
// .addTo(map) adds the polygon to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);


// .bindPopup() attaches a popup window to the layer
// .openPopup() opens the popup automatically when map loads
marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();


// bindPopup attaches popup to circle
circle.bindPopup("I am a circle.");


// bindPopup attaches popup to polygon
polygon.bindPopup("I am a polygon.");


// L.popup() creates a standalone popup object
// .setLatLng() sets popup location
// .setContent() sets popup text
// .openOn(map) opens popup on the map
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);


// Create an empty popup object for later use
var popup = L.popup();


// Function runs when user clicks the map
// e.latlng gives the click coordinates
// popup moves to click location and shows coordinates
function onMapClick(e) {

    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);

}


// map.on() listens for map events
// 'click' is the event type
// onMapClick is the function that runs when map is clicked
map.on('click', onMapClick);
