/* Using GeoJSON with Leaflet Tutorial */

// L.map() creates a Leaflet map inside the HTML element with id "map"
// .setView() sets the starting center (latitude, longitude) and zoom level
var map = L.map('map').setView([39.75621,-104.99404], 5);


// L.tileLayer() adds a basemap layer using OpenStreetMap tiles
// attribution shows credit to the map data provider
// .addTo(map) adds the tile layer to the map
var tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);


// This is a GeoJSON Feature object
// "properties" stores attribute data (name, type, popup content)
// "geometry" stores the spatial location (Point with coordinates)
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};


// This is an array of GeoJSON LineString objects
// Each LineString represents a line with multiple coordinate points
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];


// L.geoJSON() creates a Leaflet layer from GeoJSON data
// .addTo(map) adds the GeoJSON layer to the map
L.geoJSON(geojsonFeature).addTo(map);


// This object defines style options for lines
// color is line color
// weight is line thickness
// opacity controls transparency
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};


// L.geoJSON() can use a style option to control appearance
// style: myStyle applies the style to all lines
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);


// This is an array of GeoJSON Polygon features
// Each feature has a property called "party"
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];


// style function changes the polygon style based on attribute value
// feature.properties.party checks the party value
// return sets the color depending on the party
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);


// This object defines style options for circle markers
// These control marker size, color, and transparency
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


// pointToLayer is a function used by L.geoJSON()
// It converts GeoJSON point features into Leaflet circle markers
// latlng is the point location
// L.circleMarker() creates a styled circle marker
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);


// onEachFeature runs once for each feature in the GeoJSON layer
// layer represents the Leaflet layer created from the feature
// bindPopup() attaches a popup to the feature if popupContent exists
function onEachFeature(feature, layer) {

    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}


// This adds GeoJSON to the map and uses onEachFeature
// Each feature will get a popup if popupContent exists
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);


// This is an array of GeoJSON point features
// Each feature has a property called show_on_map (true or false)
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

