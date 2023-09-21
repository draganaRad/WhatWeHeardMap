// colors and styles -------------------
var portMoodyColor = "#2D699B" // 'darkblue'
var coquitlamColor = "#563B68" // 'darkpurple'
var portCoqColor = "#878E39" // 'darkgreen'
var belAnColor = "#516B7A" // 'cadetblue'

var portMoodyLegendColor = "#9ECBFA" // centre of icon
var coquitlamLegendColor = "#B5A0C9" // centre of icon
var portCoqLegendColor = "#AFB676"   // middle of cluster
var belAnLegendColor = "#B5CFDE"

// icon colors
var portMoodyIconColor = "darkblue"
var coquitlamIconColor = "darkpurple"
var portCoqIconColor = "darkgreen"
var belAnIconColor = "cadetblue"

// icon light colors (add 100 to regular colors in rgb "Pages" color format dialog)
var portMoodyIconLight = "#91CDFF" // lighter blue
var coquitlamIconLight = "#BA9FCC" // lighter purple
var portCoqIconLight = "#EBF29D" // lighter green
var belAnIconLight = "#B5CFDE" // lighter blue grey

lineWeight = 5
if (L.Browser.mobile) {
  lineWeight = 6
}
var styleOpacity = 0.6
var portMoodyStyle = {
  "color": portMoodyColor,
  "weight": lineWeight,
  "opacity": styleOpacity
};
var coquitlamStyle = {
  "color": coquitlamColor,
  "weight": lineWeight,
  "opacity": styleOpacity
};
var portCoqStyle = {
  "color": portCoqColor,
  "weight": lineWeight,
  "opacity": styleOpacity
};
var belAnStyle = {
    "color": belAnColor,
    "weight": lineWeight,
    "opacity": styleOpacity
};

const layerSettings = [
  {
    color: portMoodyLegendColor, key: 'PM', title: 'Port Moody', checked: true, clusterStyle: 'pmcluster',
    data: "", dataUrl: 'data/PM_weHeard.geojson', style: portMoodyStyle, iconColor: portMoodyIconColor, iconLight: portMoodyIconLight
  },
  {
    color: coquitlamLegendColor, key: 'C', title: 'Coquitlam', checked: true, clusterStyle: 'coqcluster',
    data: "", dataUrl: 'data/C_weHeard.geojson', style: coquitlamStyle, iconColor: coquitlamIconColor, iconLight: coquitlamIconLight
  },
  {
    color: portCoqLegendColor, key: 'PC', title: 'Port Coquitlam', checked: true, clusterStyle: 'pccluster',
    data: "", dataUrl: 'data/PC_weHeard.geojson', style: portCoqStyle, iconColor: portCoqIconColor, iconLight: portCoqIconLight
  },
  {
    color: belAnLegendColor, key: 'BA', title: 'Belcarra/Anmore', checked: true, clusterStyle: 'bacluster',
    data: "", dataUrl: 'data/BA_weHeard.geojson', style: belAnStyle, iconColor: belAnIconColor, iconLight: belAnIconLight
  }]

var layerGroup = new L.LayerGroup();
var legendChecks = {}; //dictionary of legend checkbox ids(keys) and their states
var layers = {};  //dictionary of layers with keys from settings

// Create variable to hold map element, give initial settings to map
var centerCoord = [49.27857, -122.79942]
if (L.Browser.mobile) {
  // increase tolerance for tapping (it was hard to tap on line exactly), zoom out a bit, and remove zoom control
  var myRenderer = L.canvas({ padding: 0.1, tolerance: 5 });
  var map = L.map("map", { center: centerCoord, zoom: 11, renderer: myRenderer, zoomControl: false });
} else {
  var map = L.map("map", { center: centerCoord, zoom: 12 });
}
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}
).addTo(map);
// Add Tri-Cities HUB Committee attribution
map.attributionControl.addAttribution('<a href="https://bikehub.ca/tri-cities">*Tri-Cities HUB Committee</a>');

// add geolocation on mobile
if (L.Browser.mobile) {
  L.control.locate({
    position: "bottomright",
    icon: "fa fa-location-arrow",
    showPopup: false
  }).addTo(map);
}

addLegend()
// show/hide legend
document.getElementById('legendbtn').onclick = function () { toggleDisplay(['legendbtn', 'legend']) };
document.getElementById('closebtn').onclick = function () { toggleDisplay(['legendbtn', 'legend']) };

addLayers()

///// Functions ////

// ------ Legend
function addLegend() {
  const legend = L.control({ position: 'topright' })
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div')

    // hide legend on mobile, show on desktop
    closeButtonDisplay = "block"
    legendDisplay = "none"
    if (L.Browser.mobile) {
      closeButtonDisplay = "none"
      legendDisplay = "block"
    }

    let legendHtml = '<div id="legendbtn" class="fill-darken2 pad1 icon menu button fr" style="display: ' + legendDisplay + '"></div>' +
      '<div id="legend" class="fill-darken1 round" style="display: ' + closeButtonDisplay + '">' +
      '<div id="closebtn" class="fill-darken2 pad1 icon close button fr"></div>' +
      '<div class="clearfix"></div>' +
      '<form><fieldset class="checkbox-pill clearfix">'

    legendHtml += '<div class="button quiet col12">Tri-Cities What We* Heard Map</div>'
    for (let setting of layerSettings) {
      legendHtml += addLegendLine(setting)
    }
    var mapAction = "Click on"
    if (L.Browser.mobile) {
      mapAction = "Tap"
    }
    legendHtml += '<div class="button quiet col12">' + mapAction + ' map item for more info</div>'

    legendHtml += '</fieldset></form></div>'
    div.innerHTML = legendHtml

    // disable map zoom when double clicking anywhere on legend (checkboxes included)
    div.addEventListener('mouseover', function () { map.doubleClickZoom.disable(); });
    div.addEventListener('mouseout', function () { map.doubleClickZoom.enable(); });
    return div
  }
  legend.addTo(map)
}

function addLegendLine(setting) {
  var spanHtml
  if (setting.color) {
    // add span element
    spanHtml = '<span class="circle" style="background-color:' + setting.color + '"></span>&nbsp;' + setting.title
  } else {
    // just title
    spanHtml = setting.title
  }

  checkedHtml = ""
  if (setting.checked) {
    checkedHtml = 'checked'
  }
  // add item to dictionary of legend checkbox ids(keys) and their states
  legendChecks[setting.key] = setting.checked

  var lineHtml = '<input type="checkbox" id="' + setting.key + '" onclick="toggleLayer(this)" ' + checkedHtml + ' >' +
    '<label for="' + setting.key + '" id="' + setting.key + '-label" class="button icon check quiet col12">' +
    '&nbsp;' + spanHtml + ' </label>'

  return lineHtml
}

function toggleDisplay(elementIds) {
  elementIds.forEach(function (elementId) {
    var x = document.getElementById(elementId);
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  });
}

function toggleLayer(checkbox) {
  layerKey = checkbox.id
  if (checkbox.checked) {
    legendChecks[layerKey] = true
    if (!layerGroup.hasLayer(layers[layerKey])) {
      layerGroup.addLayer(layers[layerKey])
    }
  } else {
    legendChecks[layerKey] = false
    if (layerGroup.hasLayer(layers[layerKey])) {
      layerGroup.removeLayer(layers[layerKey])
    }
  }
}

// ------ Layers
function addLayers() {

  //createLayer('https://draganarad.github.io/TriCityData/weHeard/C_weHeard.geojson', coquitlamStyle, coquitlamIconColor, coquitlamIconLight)
  // var coquitlamCluster = createClusterGroup('coqcluster')
  // coquitlamLayer.on('data:loaded', function() { 
  //   coquitlamCluster.addLayer(coquitlamLayer);
  //   layers['C'] = coquitlamCluster
  //   layerGroup.addLayer(coquitlamCluster)
  // })

  for (let setting of layerSettings) {
    createLayer(setting.dataUrl, setting.style, setting.iconColor, setting.iconLight, setting.clusterStyle, setting.key)
  }

  layerGroup.addTo(map);
}

function createClusterGroup(clusterStyle) {
  var newClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 60,
    disableClusteringAtZoom: 17,
    iconCreateFunction: function (cluster) {
      var childCount = cluster.getChildCount();
      var styleClassName = 'marker-cluster marker-' + clusterStyle
      return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: styleClassName, iconSize: new L.Point(40, 40) });
    },
    //Disable all of the defaults:
    spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
  });
  return newClusterGroup
}

function createIconMarker(iconName, iconColor, markerColor) {
  var newIconMarker = L.AwesomeMarkers.icon({
    icon: iconName,
    markerColor: iconColor,
    prefix: 'fa',
    iconColor: markerColor
  });
  return newIconMarker
}

function createLayer(dataUrl, style, iconColor, markerColor, clusterStyle, layerKey) {
  // create layer
  //var cityLayer = new L.GeoJSON.AJAX(dataUrl, { //leaving here in case I want to try moving data to common repository again (see "TriCityData")
  var cityLayer = new L.geoJSON.ajax(dataUrl, {
    style: style,
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var iconName = 'circle';
      // change icon if fixed
      switch (feature.properties.type) {
          case 'Suggestion': 
          iconName = 'comment-dots';
          break;
          case 'Problem': 
          iconName = 'exclamation';
          break;
          case 'Like': 
          iconName = 'thumbs-up';
          break;
      }
      //console.log('Dragana:: '+feature.properties.type+ ' icon name:'+ iconName);
      return L.marker(latlng, {
        icon: createIconMarker(iconName, iconColor, markerColor)
      });
    }
    });
    
    // create cluster and add to global layerGroup
    var cityCluster = createClusterGroup(clusterStyle)
    cityLayer.on('data:loaded', function() { 
      cityCluster.addLayer(cityLayer);
      layers[layerKey] = cityCluster
      layerGroup.addLayer(cityCluster)
    })
}

// =========================================
// add popup
function onEachFeature(feature, layer) {
  var popupContent = ""
  if (feature.properties) {
      // add type
      if (feature.properties.type) {
          popupContent += "<b>Type: </b>";
          popupContent += feature.properties.type;
      }

      // add location
      if (feature.properties.location) {
          popupContent += "<br><b>Location: </b>";
          popupContent += feature.properties.location;
      }
      // add description
      if (feature.properties.description) {
          popupContent += "<br><b>Description: </b>";
          popupContent += feature.properties.description;
      }
      // add date
      if (feature.properties.date) {
        popupContent += "<br><b>Date: </b>";
        dateProperty = feature.properties.date;
        var parts = dateProperty.split('-');
        // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
        // January - 0, February - 1, etc.
        var dateStr = new Date(parts[0], parts[1] - 1, parts[2]); 
        //console.log(dateStr.toDateString());
        popupContent += dateStr.toDateString();
      }
      // add photo(s)
      // remove white spaces in city if exist. no white spaces in photo names
      if (feature.properties.photo) {
          //console.log(city)
          popupContent += "<br><br>";
          imageSrc = "img/" + feature.properties.key + "/" + feature.properties.photo;
          popupContent += "<a href='" + imageSrc + "' target='_blank'><img src='" + imageSrc + "' width='148' height='100'></img></a>";
      }

      // add if there's update
      if (feature.properties.descriptionUpdate) {
        popupContent += "<br>";
        popupContent += "<br><b>Update: </b>";
        popupContent += feature.properties.descriptionUpdate;
      }
      if (feature.properties.photoUpdate) {
        popupContent += "<br>";
        imageSrc = "img/" + feature.properties.key + "/" + feature.properties.photoUpdate;
        popupContent += "<a href='" + imageSrc + "' target='_blank'><img src='" + imageSrc + "' width='148' height='100'></img></a>";
      }

    // for debug
    // if (feature.properties.id == 'way/35198494'){
    //   console.log('Dragana:: tag ' + JSON.stringify(feature.properties))
    // }

    // FOR TEST
    // popupContent += "<br>=================";
    //   for (let property in feature.properties) {
    //       //console.log('Dragana:: tag ' + JSON.stringify(tag) +', value: '+ way.tags[tag])
    //         popupContent += "<br><b>" + property + ": </b>";
    //       popupContent += feature.properties[property];
    //  }
  }
  layer.bindPopup(popupContent);
}
