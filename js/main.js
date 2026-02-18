/* Activity 5 - main.js
   This script:
   1) creates a Leaflet map
   2) adds an OpenStreetMap basemap
   3) loads metro_expansion.geojson using fetch()
   4) draws circle markers and popups
*/

// global variable so multiple functions can use the same map
var map;


// create the map and basemap
function createMap(){

  // L.map() creates a map inside the div with id="map"
  // center = starting location, zoom = starting zoom level
  map = L.map("map", {
    center: [20, 0],
    zoom: 2
  });

  // L.tileLayer() adds the background basemap tiles
  // {z}, {x}, {y} are tile variables (zoom, column, row)
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // after map is ready, load the data
  getData();
}


// create popups for each feature
function onEachFeature(feature, layer){

  var popupContent = "";

  // if properties exist, loop through them
  if(feature.properties){

    for(var property in feature.properties){
      popupContent += "<p><strong>" + property + "</strong>: " + feature.properties[property] + "</p>";
    }

    // bindPopup attaches popup to the marker
    layer.bindPopup(popupContent);
  }
}


// load GeoJSON and add it to the map
function getData(){

  // fetch() loads the external GeoJSON file (asynchronous)
  fetch("data/metro_expansion.geojson")

    .then(function(response){
      // convert the response to JSON
      return response.json();
    })

    .then(function(json){

      // marker style options
      var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

      // L.geoJson() creates a Leaflet layer from GeoJSON data
      L.geoJson(json, {

        // pointToLayer converts GeoJSON points into Leaflet circle markers
        pointToLayer: function(feature, latlng){
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },

        // onEachFeature runs once per feature (good for popups)
        onEachFeature: onEachFeature

      }).addTo(map);

    })

}


// run createMap after the HTML page loads
document.addEventListener("DOMContentLoaded", createMap);
