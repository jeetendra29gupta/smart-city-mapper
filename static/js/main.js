const india = [22.9074, 79.0730];
const map = L.map('map').setView(india, 5);
map.zoomControl.setPosition('bottomright');

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const baseLayer = L.tileLayer(tileUrl, {
  attribution
});
baseLayer.addTo(map);

const geo_json_style = {
  "color": "red",
  "weight": 5,
  "opacity": 0.65
};
const geo_json_object = L.geoJSON(features, {
  style: geo_json_style
});
geo_json_object.addTo(map);

fetch('/get_features')
  .then(response => response.json())
  .then(data => {
    renderGeoJSON(data);
  });

const socket = io.connect('http://127.0.0.1:8181');
socket.on('map_updated', (updatedData) => {
  renderGeoJSON(updatedData);
});

const featuresLayer = L.layerGroup().addTo(map);

function renderGeoJSON(geojsonData) {
  featuresLayer.clearLayers();
  L.geoJSON(geojsonData, {
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`<b>${feature.properties.name}</b><br>${feature.properties.address}`);
    },
    style: feature => ({
      color: "blue", // Change color dynamically if needed
      weight: 2,
      opacity: 0.8
    })
  }).addTo(featuresLayer);
}