/**
 * File: map-script.js
 * Description: Initializes Leaflet map, loads imagery and overlays, and adds styled GeoJSON layers with popups.
 * Author: Bryant Baker/Los Padres ForestWatch
 * License: CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/)
 * Date: 2025-04-27
 * Version: 1.3.1
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

// Add zoom warning overlay
var zoomWarning = document.getElementById('zoom-warning');
var warningTimeout;

window.addEventListener('load', function () {
    zoomWarning.classList.add('ready');
});

// Disable scroll zoom initially
map.scrollWheelZoom.disable();

// Attach the listener to the Leaflet map container
const mapContainer = map.getContainer();

mapContainer.addEventListener('wheel', function (e) {
    
    // Always block browser page scroll
    e.preventDefault(); 

    // Allow scroll zooming only when shift key is pressed
    if (e.shiftKey) {
        
        // Clear zoom warning
        zoomWarning.style.opacity = 0;
        clearTimeout(warningTimeout);

        // Ensure scroll zoom works properly on all devices
        let delta = e.deltaY;
        if (delta === 0 && e.wheelDelta) {
            delta = -e.wheelDelta;
        }

        if (delta < 0) {
            map.zoomIn();
        } else if (delta > 0) {
            map.zoomOut();
        }
    
    // Show zoom warning if shift key is not pressed    
    } else {
        zoomWarning.style.opacity = 1;
        clearTimeout(warningTimeout);
        warningTimeout = setTimeout(function () {
            zoomWarning.style.opacity = 0;
        }, 2000);
    }
}, { passive: false });

// Allow click events to close the zoom warning
mapContainer.addEventListener('click', function () {
    if (zoomWarning.style.opacity > 0) {
        zoomWarning.style.opacity = 0;
        clearTimeout(warningTimeout);
    }
});

// Create custom panes to control z-index of layers
map.createPane('imageryPane');
map.getPane('imageryPane').style.zIndex = 200;

map.createPane('geojsonPane');
map.getPane('geojsonPane').style.zIndex = 400;

map.createPane('roadsPane');
map.getPane('roadsPane').style.zIndex = 600;

map.createPane('labelsPane');
map.getPane('labelsPane').style.zIndex = 800;

map.createPane('popupPane');
map.getPane('popupPane').style.zIndex = 1000;

// Function to add stylized geoJSON layers with popups
// When geoJSON polygon is clicked, enhanced popup opens and label is hidden
function addLayerWithPopup(geojsonUrl, style, cardTitle, cardText, cardLink, cardImage, cardColor, buttonColor, labelMarker) {
    fetch(geojsonUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            L.geoJSON(data, {
                pane: 'geojsonPane',
                style: style,
                onEachFeature: function (feature, layer) {
                    layer.on('click', function (e) {
                        layer.bindPopup(
                            `<div class="custom-popup">
                                <a href="${cardLink}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                                    <div class="childpage-image">
                                        <img src="${cardImage}" alt="${cardTitle}" width="300" height="169"
                                            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 0.75rem;" />
                                    </div>
                                    <div class="childpage-content" style="text-align: center;">
                                        <h3 style="margin: 0.5rem 0; color: ${cardColor}; font-size: 1.25rem;">${cardTitle}</h3>
                                        <p style="font-size: 0.95rem; color: #000; margin: 0.5rem 0;">${cardText}</p>
                                        <div style="margin-top: 0.75rem;">
                                            <span style="background: ${buttonColor}; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 1rem; font-weight: bold;">Learn more →</span>
                                        </div>
                                    </div>
                                </a>
                            </div>`,
                            { maxWidth: "auto", className: "custom-popup" }
                        ).openPopup(e.latlng);

                        if (labelMarker) {
                            map.removeLayer(labelMarker);
                        }
                    });

                    layer.on('popupclose', function () {
                        if (labelMarker) {
                            map.addLayer(labelMarker);
                        }
                    });
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error(`Failed to load ${cardTitle}:`, error);
        });
}

// Create labels for Los Padres National Forest and Carrizo Plain National Monument
const labelMarkers = {
    "Los Padres National Forest": L.marker([34.54, -119.5], { opacity: 0, pane: 'labelsPane' })
        .bindTooltip("Los Padres Nat'l Forest", {
            permanent: true,
            direction: 'center',
            className: 'custom-label'
        }),
    "Carrizo Plain National Monument": L.marker([35, -119.7], { opacity: 0, pane: 'labelsPane' })
        .bindTooltip("Carrizo Plain Nat'l Monument", {
            permanent: true,
            direction: 'center',
            className: 'custom-label'
        })
};

Object.values(labelMarkers).forEach(marker => marker.addTo(map));

// Hide labels when zoomed outside of a certain range
const labelHideMaxZoom = 9;
const labelHideMinZoom = 7;

map.on('zoomend', () => {
    const currentZoom = map.getZoom();

    Object.values(labelMarkers).forEach(marker => {
        if (currentZoom > labelHideMinZoom && currentZoom <= labelHideMaxZoom) {
            if (!map.hasLayer(marker)) marker.addTo(map);
        } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        }
    });
});

// Add base imagery layer
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
    pane: 'imageryPane',
}).addTo(map);

// Add transportation overlay
L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    pane: 'roadsPane',
}).addTo(map);

// Add labels overlay
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    pane: 'labelsPane',
}).addTo(map);

// Add all vector overlay layers
addLayerWithPopup('https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/lpnf_public-land.geojson',
    { color: '#66CDAA', weight: 1, opacity: 0.4, fillColor: '#66CDAA', fillOpacity: 0.4 },
    'Los Padres National Forest',
    'Rising from the Pacific Ocean to over 8,800 feet in elevation...',
    'https://forestwatch.org/learn-explore/los-padres-national-forest/',
    'https://forestwatch.org/wp-content/uploads/2025/04/Ojai-Backcountry_16x9_20180826_003_Bryant-Baker-300x169.jpg',
    '#000',
    '#66CDAA',
    labelMarkers["Los Padres National Forest"]
);

addLayerWithPopup('https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/cpnm_public-land.geojson',
    { color: '#ff7700', weight: 1, opacity: 0.4, fillColor: '#ff7700', fillOpacity: 0.4 },
    'Carrizo Plain National Monument',
    'A stunning 204,000-acre protected landscape in the San Joaquin Valley...',
    'https://forestwatch.org/learn-explore/carrizo-plain/',
    'https://forestwatch.org/wp-content/uploads/2025/04/Elkhorn-Hills_Carrizo-Plain_20230415_251_Bryant-Baker-300x169.jpg',
    '#000',
    '#ff7700',
    labelMarkers["Carrizo Plain National Monument"]
);

addLayerWithPopup('https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/bcnwr_public-land.geojson',
    { color: '#EFDF09', weight: 1, opacity: 0.4, fillColor: '#EFDF09', fillOpacity: 0.4 },
    'Bitter Creek National Wildlife Refuge',
    'This 14,097-acre landscape protects habitat within an important...',
    'https://forestwatch.org/learn-explore/national-wildlife-refuges/bitter-creek/',
    'https://forestwatch.org/wp-content/uploads/2024/10/Tule-Elk-Bill-Bouton-300x197.jpg',
    '#000',
    '#EFDF09',
    null
);

addLayerWithPopup('https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/hmnwr_public-land.geojson',
    { color: '#EFDF09', weight: 1, opacity: 0.4, fillColor: '#EFDF09', fillOpacity: 0.4 },
    'Hopper Mountain National Wildlife Refuge',
    'This 2,471-acre Refuge adjoins the southern boundary of the Sespe Condor Sanctuary...',
    'https://forestwatch.org/learn-explore/national-wildlife-refuges/hopper-mountain/',
    'https://forestwatch.org/wp-content/uploads/2024/10/condors-300x175.jpg',
    '#000',
    '#EFDF09',
    null
);