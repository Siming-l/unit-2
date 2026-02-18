/* Adapted Tutorial - Map of GeoJSON data from MegaCities.geojson */


// global variable so map can be accessed in other functions
var map;


// function to create the Leaflet map
function createMap(){

    // L.map() creates the map inside the div with id="map"
    // center sets the starting location
    // zoom sets the starting zoom level
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });


    // L.tileLayer() adds the OpenStreetMap basemap
    // attribution shows credit to the map data source
    // .addTo(map) displays the basemap
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);


    // call function to load GeoJSON data
    getData();
}


// function to load GeoJSON file and add it to the map
function getData(){

    // fetch() loads external file asynchronously
    fetch("data/MegaCities.geojson")

        .then(function(response){

            // convert response to JSON format
            return response.json();

        })

        .then(function(json){

            // L.geoJson() creates a Leaflet layer from GeoJSON data
            // .addTo(map) adds the features to the map
            L.geoJson(json).addTo(map);

        });

}


// run createMap function after the page loads
document.addEventListener('DOMContentLoaded', createMap);
