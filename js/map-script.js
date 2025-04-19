var map = L.map('map').setView([35.3, -120.5], 8);

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

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
  maxZoom: 20
}).addTo(map);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 20
}).addTo(map);

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
    { color: '#ce50ff', weight: 1, opacity: 0.4, fillColor: '#ce50ff', fillOpacity: 0.4 },
    'Bitter Creek', 'National Wildlife Refuge'
);

addLayerWithPopup(
    'https://cdn.jsdelivr.net/gh/Los-Padres-ForestWatch/aow@main/layers/hmnwr_public-land.geojson',
    { color: '#ce50ff', weight: 1, opacity: 0.4, fillColor: '#ce50ff', fillOpacity: 0.4 },
    'Hopper Mountain', 'National Wildlife Refuge'
);