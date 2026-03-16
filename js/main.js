/* Final Leaflet Lab 
   Fixes requested:
   1) Circle size updates with year (big circle changes)
   2) Add subtle location dot for each city (small + semi-transparent)
   3) Legend includes location dot label
   4) Legend circles + stats update by YEAR (max/mean/min for current year)
   5) Sidebar: Year Summary (longest/shortest for current year)
*/

// =======================
// Global variables
// =======================
var map;
var attributes = [];        // year strings: "1990","1995"... etc
var currentAttribute;       // current selected year
var geojsonLayer;           // L.GeoJSON containing featureGroups
var currentProps = null;    // last clicked city properties

// For Flannery scaling
var dataStats = {};         // {min} across all years (for scaling baseline)


// =======================
// 1) Create Leaflet map
// =======================
function createMap() {

  map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 5,
  maxBounds: [[-60, -180], [85, 180]],
  maxBoundsViscosity: 1.0,
  worldCopyJump: false
});

  // Basemap layers
  var light = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OpenStreetMap contributors &copy; CARTO" }
  );

  var dark = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OpenStreetMap contributors &copy; CARTO" }
  );

  light.addTo(map);

  // overlay switch (operator)
  L.control.layers({
    "Light Map": light,
    "Dark Map": dark
  }).addTo(map);

  getData();
}


// =======================
// 2) Load GeoJSON data
// =======================
function getData() {

  fetch("data/metro_expansion.geojson")
    .then(function (response) { return response.json(); })
    .then(function (json) {

      // build attribute array (years)
      attributes = processData(json);

      // calc baseline min (ignore 0) for scaling
      calcMinForScaling(json, attributes);

      // set initial year
      currentAttribute = attributes[0];

      // create symbols
      geojsonLayer = createPropSymbols(json, currentAttribute);

      // Week 6 controls
      createSequenceControls(attributes);
      createLegend(attributes);

      // initial update to sync UI + legend + summary
      updatePropSymbols(currentAttribute);

    })
    .catch(function (error) {
      console.log("Error loading GeoJSON:", error);
    });
}


// =======================
// 3) Build year attributes
// =======================
function processData(data) {

  var attrs = [];
  var properties = data.features[0].properties;

  for (var key in properties) {
    // keep keys like "1990", "1995", ...
    if (key.length === 4 && !isNaN(Number(key))) {
      attrs.push(key);
    }
  }

  attrs.sort(function (a, b) { return Number(a) - Number(b); });
  return attrs;
}


// =======================
// 4) Min value baseline for Flannery scaling
// =======================
function calcMinForScaling(data, attrs) {

  var allValues = [];

  data.features.forEach(function (feature) {
    attrs.forEach(function (year) {
      var value = Number(feature.properties[year]);
      if (!isNaN(value) && value > 0) allValues.push(value);
    });
  });

  var min = allValues.length ? Math.min(...allValues) : 1;
  dataStats.min = min;
}


// =======================
// 5) Flannery scaling function
// =======================
function calcPropRadius(attValue) {

  var minRadius = 4;

  // show 0 as a small dot
  if (!attValue || attValue <= 0) return 2;

  var radius =
    1.0083 *
    Math.pow(attValue / dataStats.min, 0.5715) *
    minRadius;

  // clamp max
  return Math.min(radius, 45);
}


// =======================
// 6) Popup content (refactor)
// =======================
function createPopupContent(properties, attribute) {

  var valueNum = Number(properties[attribute]);
  var valueText = (valueNum === 0) ? "0 km" : (valueNum + " km");

  var popupContent =
    "<p><b>🚇 " + properties.City + "</b></p>" +
    "<p><b>Country:</b> " + properties.Country + "</p>" +
    "<p>Metro length in " + attribute + ": <b>" + valueText + "</b></p>";

  return popupContent;
}


// =======================
// 7) Create proportional symbols
// =======================
function pointToLayer(feature, latlng, attribute) {

  var value = Number(feature.properties[attribute]);
  var radius = calcPropRadius(value);

  // Big circle
  var circle = L.circleMarker(latlng, {
    fillColor: "#d94801",
    color: "#7f2704",
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.55,
    radius: radius
  });

  // Center location marker (dual-tone, works in light & dark mode)
  var dot = L.circleMarker(latlng, {
  radius: 2.4,
  color: "#3a3a3a",
  weight: 1.4,
  opacity: 1,
  fillColor: "#ffffff",
  fillOpacity: 1,
  interactive: false
  });

  // Use featureGroup for better popup/event behavior
  var group = L.featureGroup([circle, dot]);

  // Store references for updates
  group._circle = circle;
  group._dot = dot;
  group._props = feature.properties;

  // Bind popup to the big circle (most reliable)
  circle.bindPopup(createPopupContent(feature.properties, attribute), {
    offset: new L.Point(0, -radius),
    className: "metro-popup"
  });

  // Click group -> update sidebar + force open popup
  group.on("click", function () {
    circle.openPopup();
  });

  return group;
}

function createPropSymbols(data, attribute) {

  return L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return pointToLayer(feature, latlng, attribute);
    }
  }).addTo(map);
}


// =======================
// 8) Sequence Control as Leaflet control
// =======================
function createSequenceControls(attrs) {

  var SequenceControl = L.Control.extend({
    options: { position: "bottomleft" },

    onAdd: function () {
      var container = L.DomUtil.create("div", "sequence-control-container");

      container.insertAdjacentHTML(
        "beforeend",
        '<input class="range-slider" type="range">'
      );

      container.insertAdjacentHTML(
        "beforeend",
        '<button class="step" id="reverse" title="Reverse">⟵</button>'
      );

      container.insertAdjacentHTML(
        "beforeend",
        '<button class="step" id="forward" title="Forward">⟶</button>'
      );

      L.DomEvent.disableClickPropagation(container);
      return container;
    }
  });

  map.addControl(new SequenceControl());

  // listeners AFTER adding control
  var slider = document.querySelector(".range-slider");
  slider.min = 0;
  slider.max = attrs.length - 1;
  slider.step = 1;
  slider.value = 0;

  slider.addEventListener("input", function () {
    var index = Number(this.value);
    updatePropSymbols(attrs[index]);
  });

  document.getElementById("forward").addEventListener("click", function () {
    var index = Number(slider.value);
    index = (index + 1) % attrs.length;
    slider.value = index;
    updatePropSymbols(attrs[index]);
  });

  document.getElementById("reverse").addEventListener("click", function () {
    var index = Number(slider.value);
    index = (index - 1 + attrs.length) % attrs.length;
    slider.value = index;
    updatePropSymbols(attrs[index]);
  });
}


// =======================
// 9) Legend control (temporal + SVG)
// =======================
function createLegend(attrs) {

  var LegendControl = L.Control.extend({
    options: { position: "bottomright" },

    onAdd: function () {
      var container = L.DomUtil.create("div", "legend-control-container");

      container.innerHTML =
        "<p class='temporalLegend'>Year: <span class='year'>" + attrs[0] + "</span></p>";

      // SVG shell (update the circles in updatePropSymbols)
      var svgW = 300, svgH = 105;
      var svg = '<svg id="attribute-legend" width="' + svgW + 'px" height="' + svgH + 'px">';

      var circles = ["max", "mean", "min"];
      for (var i = 0; i < circles.length; i++) {
        svg += '<circle class="legend-circle" id="' + circles[i] + '" ' +
               'fill="#d94801" fill-opacity="0.55" stroke="#7f2704" stroke-width="2" />';
        svg += '<text id="' + circles[i] + '-text" x="135" y="' + (i * 24 + 28) + '"></text>';
      }

      // Dot + label
      svg += '<circle id="city-dot" r="2.2" cx="135" cy="96" ' + 'fill="#ffffff" stroke="#3a3a3a" stroke-width="1.3"/>';
      svg += '<text x="150" y="100">City location (center point)</text>';

      svg += "</svg>";
      container.insertAdjacentHTML("beforeend", svg);

      L.DomEvent.disableClickPropagation(container);
      return container;
    }
  });

  map.addControl(new LegendControl());
}


// =======================
// 10) Sidebar updates
// =======================
function updateYearSummary(attribute) {
  var el = document.getElementById("year-summary");
  if (!el || !geojsonLayer) return;

  var maxCity = null, maxVal = -Infinity;
  var minCity = null, minVal = Infinity;

  geojsonLayer.eachLayer(function (group) {
    var props = group._props;
    var v = Number(props[attribute]);
    if (!isNaN(v)) {
      if (v > maxVal) { maxVal = v; maxCity = props.City; }
      if (v < minVal) { minVal = v; minCity = props.City; }
    }
  });

  el.innerHTML =
    "<p><b>Year:</b> " + attribute + "</p>" +
    "<p><b>Longest:</b> " + maxCity + " — " + maxVal + " km</p>" +
    "<p><b>Shortest:</b> " + minCity + " — " + minVal + " km</p>";
}


// =======================
// 11) Update symbols + popup + legend + summary when year changes
// =======================
function updatePropSymbols(attribute) {

  currentAttribute = attribute;

  // update temporal legend
  var yearSpan = document.querySelector("span.year");
  if (yearSpan) yearSpan.innerHTML = attribute;

  // Update map circles + popups
  geojsonLayer.eachLayer(function (group) {
    var props = group._props;

    var v = Number(props[attribute]);
    var r = calcPropRadius(v);

    // update ONLY big circle radius
    group._circle.setRadius(r);

    // update popup content on big circle
    group._circle.setPopupContent(createPopupContent(props, attribute));

    // update popup offset to match new radius
    if (group._circle.getPopup()) {
      group._circle.getPopup().options.offset = new L.Point(0, -r);
    }
  });

  // year summary
  updateYearSummary(attribute);

  // ----- Update legend circles + text by CURRENT YEAR -----
  var values = [];
  geojsonLayer.eachLayer(function (group) {
    var v = Number(group._props[attribute]);
    if (!isNaN(v)) values.push(v);
  });

  var yearMax = Math.max(...values);
  var yearMin = Math.min(...values);
  var yearMean = values.reduce(function (a, b) { return a + b; }, 0) / values.length;

  var stats = { max: yearMax, mean: yearMean, min: yearMin };

  // layout constants for svg
  var svgH = 105;
  var cx = 52;
  var baseY = svgH - 10;

  ["max", "mean", "min"].forEach(function (k) {
    var r = calcPropRadius(stats[k]);
    var cy = baseY - r;

    var c = document.getElementById(k);
    if (c) {
      c.setAttribute("r", r);
      c.setAttribute("cx", cx);
      c.setAttribute("cy", cy);
    }

    var t = document.getElementById(k + "-text");
    if (t) {
      var labelVal = (k === "mean") ? (Math.round(stats[k] * 100) / 100) : Math.round(stats[k]);
      t.textContent = k + ": " + labelVal + " km";
    }
  });
}


// Run after page loads
document.addEventListener("DOMContentLoaded", createMap);