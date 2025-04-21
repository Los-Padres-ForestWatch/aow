/**
 * File: map-script.js
 * Description: Initializes Leaflet map, loads imagery and overlays, and adds styled GeoJSON layers with popups.
 * Author: Bryant Baker/Los Padres ForestWatch
 * License: CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)
 * Date: 2024-04-19
 * Version: 1.2.0
 * Dependencies:
 *   - Leaflet (https://leafletjs.com)
 *   - Esri Tiled Map Services
 *   - GeoJSON data files (public land overlays)
 * Attribution:
 *   - Map tiles © Esri — Source: Esri, Maxar, Earthstar Geographics
 *   - GeoJSON boundaries derived from PADUS04 and CPAD 2024 datasets
 */


// Initialize map
var map = L.map('map').setView([35.3, -120.5], 8);

// Create custom panes to control z-index of layers
map.createPane('imageryPane');
map.getPane('imageryPane').style.zIndex = 200;

map.createPane('geojsonPane');
map.getPane('geojsonPane').style.zIndex = 400;

map.createPane('roadsPane');
map.getPane('roadsPane').style.zIndex = 600;

map.createPane('labelsPane');
map.getPane('labelsPane').style.zIndex = 800;

// Function to add stylized GeoJSON layers with popups
function addLayerWithPopup(geojsonUrl, style, titleText, subtitleText, popupClass) {
    console.log(`Fetching ${titleText} from ${geojsonUrl}`);
    fetch(geojsonUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(`${titleText} data:`, data);
        const layer = L.geoJSON(data, {
          pane: 'geojsonPane',
          style: style,
          onEachFeature: function (feature, layer) {
            layer.on('click', function () {
              layer.bindPopup(`
                <div class="popup-card ${popupClass}">
                  <div class="popup-title">${titleText}</div>
                  <div class="popup-subtitle">${subtitleText}</div>
                </div>
              `).openPopup();
            });
          }
        }).addTo(map);
      })
      .catch(error => {
        console.error(`Failed to load ${titleText}:`, error);
      });
  }  

// Add base imagery layer
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
  maxZoom: 18,
  pane: 'imageryPane'
}).addTo(map);

// Add transportation overlay
L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  pane: 'roadsPane'
}).addTo(map);

// Add labels overlay
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  pane: 'labelsPane'
}).addTo(map);

// Add public land vector layers with popups
addLayerWithPopup(
  'https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/lpnf_public-land.geojson',
  { color: '#66CDAA', weight: 1, opacity: 0.4, fillColor: '#66CDAA', fillOpacity: 0.4 },
  'Los Padres', 'National Forest'
);

addLayerWithPopup(
  'https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/cpnm_public-land.geojson',
  { color: '#ff7700', weight: 1, opacity: 0.4, fillColor: '#ff7700', fillOpacity: 0.4 },
  'Carrizo Plain', 'National Monument'
);

addLayerWithPopup(
    'https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/bcnwr_public-land.geojson',
    { color: '#EFDF09', weight: 1, opacity: 0.4, fillColor: '#EFDF09', fillOpacity: 0.4 },
    'Bitter Creek', 'National Wildlife Refuge'
);

addLayerWithPopup(
    'https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/hmnwr_public-land.geojson',
    { color: '#EFDF09', weight: 1, opacity: 0.4, fillColor: '#EFDF09', fillOpacity: 0.4 },
    'Hopper Mountain', 'National Wildlife Refuge'
);