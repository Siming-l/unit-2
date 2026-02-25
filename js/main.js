/* Activity 6 - main.js (Metro Expansion)
   Goals:
   - proportional symbols (circle size changes by year)
   - styled retrieve popups (city + current year value)
   - sequence operator (slider + forward/reverse buttons)
   - temporal legend
*/

// global variables
var map;
var minValue;


// Step 1. Create the Leaflet map
function createMap() {

  map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    worldCopyJump: true
  });

  // Clean basemap
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
    }
  ).addTo(map);

  getData();
}


// Step 2. Import GeoJSON data
function getData() {

  fetch("data/metro_expansion.geojson")
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {

      // build year attribute array
      var attributes = processData(json);

      // calculate minimum value
      minValue = calcMinValue(json, attributes);

      // create symbols
      createPropSymbols(json, attributes);

      // create sequence controls
      createSequenceControls(attributes);

    })
    .catch(function (error) {
      console.log("Error loading GeoJSON:", error);
    });
}


// Step 3. Build attribute array (years)
function processData(data) {

  var yearSet = new Set();

  data.features.forEach(function (feature) {

    var props = feature.properties;

    for (var key in props) {

      if (/^\d{4}$/.test(key)) {
        yearSet.add(key);
      }

    }

  });

  var attributes = Array.from(yearSet);

  // sort numerically
  attributes.sort(function (a, b) {
    return Number(a) - Number(b);
  });

  console.log("Attributes:", attributes);

  return attributes;
}


// Step 4. Calculate minimum value across dataset
// Ignore 0 so scaling works correctly
function calcMinValue(data, attributes) {

  var allValues = [];

  data.features.forEach(function (feature) {

    attributes.forEach(function (year) {

      var value = Number(feature.properties[year]);

      if (!isNaN(value) && value > 0) {
        allValues.push(value);
      }

    });

  });

  var min = Math.min(...allValues);

  if (!isFinite(min)) min = 1;

  return min;
}


// Step 5. Calculate proportional radius using Flannery scaling
function calcPropRadius(attValue) {

  var minRadius = 4;

  // show 0 as small visible dot
  if (!attValue || attValue <= 0) return 2;

  var radius =
    1.0083 *
    Math.pow(attValue / minValue, 0.5715) *
    minRadius;

  // clamp max size
  radius = Math.min(radius, 45);

  return radius;
}


// Step 6. Convert GeoJSON point to circle marker with styled popup
function pointToLayer(feature, latlng, attribute) {

  var attValue = Number(feature.properties[attribute]);

  var options = {

    fillColor: "#d94801",
    color: "#7f2704",
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.30,
    radius: calcPropRadius(attValue)

  };

  var layer = L.circleMarker(latlng, options);


  // Improved popup content (handles 0 clearly)
  var valueNum = Number(feature.properties[attribute]);

  var valueText;

  if (!isNaN(valueNum) && valueNum === 0) {
    valueText = "0 km (no or limited metro yet)";
  } else {
    valueText = valueNum + " km";
  }

  var popupContent =
    "<p><b>🚇 " + feature.properties.City + "</b></p>" +
    "<p>Metro length in " + attribute +
    ": <b>" + valueText + "</b></p>";


  layer.bindPopup(popupContent, {

    offset: new L.Point(0, -options.radius),
    className: "metro-popup"

  });

  return layer;
}


// Step 7. Add proportional symbols to map
function createPropSymbols(data, attributes) {

  var attribute = attributes[0];

  L.geoJson(data, {

    pointToLayer: function (feature, latlng) {

      return pointToLayer(feature, latlng, attribute);

    }

  }).addTo(map);
}


// Step 8. Create slider and step buttons (Sequence operator)
function createSequenceControls(attributes) {

  // temporal legend
  document.querySelector("#panel").insertAdjacentHTML(
    "beforeend",
    "<div id='temporal-legend'>Year: <b>" +
    attributes[0] +
    "</b></div>"
  );

  // slider
  document.querySelector("#panel").insertAdjacentHTML(
    "beforeend",
    "<input class='range-slider' type='range'>"
  );

  var rangeSlider = document.querySelector(".range-slider");

  rangeSlider.min = 0;
  rangeSlider.max = attributes.length - 1;
  rangeSlider.value = 0;
  rangeSlider.step = 1;


  // buttons
  document.querySelector("#panel").insertAdjacentHTML(
    "beforeend",
    "<button class='step' id='reverse'>Reverse</button>"
  );

  document.querySelector("#panel").insertAdjacentHTML(
    "beforeend",
    "<button class='step' id='forward'>Forward</button>"
  );


  // button click events
  document.querySelectorAll(".step").forEach(function (button) {

    button.addEventListener("click", function () {

      var index =
        Number(document.querySelector(".range-slider").value);

      if (button.id === "forward") {

        index++;

        if (index > attributes.length - 1)
          index = 0;

      }

      else if (button.id === "reverse") {

        index--;

        if (index < 0)
          index = attributes.length - 1;

      }

      document.querySelector(".range-slider").value = index;

      updatePropSymbols(attributes[index]);

    });

  });


  // slider input event
  rangeSlider.addEventListener("input", function () {

    var index = Number(this.value);

    updatePropSymbols(attributes[index]);

  });

}


// Step 9. Update symbol size and popup content when year changes
function updatePropSymbols(attribute) {

  map.eachLayer(function (layer) {

    if (
      layer.feature &&
      layer.feature.properties[attribute] !== undefined
    ) {

      var props = layer.feature.properties;

      var radius =
        calcPropRadius(Number(props[attribute]));

      layer.setRadius(radius);


      // improved popup
      var valueNum = Number(props[attribute]);

      var valueText;

      if (!isNaN(valueNum) && valueNum === 0) {
        valueText = "0 km (no or limited metro yet)";
      } else {
        valueText = valueNum + " km";
      }

      var popupContent =
        "<p><b>🚇 " + props.City + "</b></p>" +
        "<p>Metro length in " + attribute +
        ": <b>" + valueText + "</b></p>";


      layer.bindPopup(popupContent, {

        offset: new L.Point(0, -radius),
        className: "metro-popup"

      });

    }

  });


  // update temporal legend
  document.querySelector("#temporal-legend").innerHTML =
    "Year: <b>" + attribute + "</b>";

}


// Run after page loads
document.addEventListener(
  "DOMContentLoaded",
  createMap
);