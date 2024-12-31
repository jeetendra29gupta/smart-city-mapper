fetch('/get_features')
  .then(response => response.json())
  .then(data => {
    renderGeoJSON(data);
  });


const socket = io.connect('http://127.0.0.1:8181');
socket.on('map_updated', (data) => {
  renderGeoJSON(data);
});

function renderGeoJSON(data) {
  const featuresTable = document.getElementById('features-table').querySelector('tbody');
  featuresTable.innerHTML = '';
  data['features'].forEach(feature => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${feature.id}</td>
        <td>${feature.properties.name}</td>
        <td>${feature.properties.address}</td>
        <td>${feature.geometry.coordinates.join(', ')}</td>
        <td><button onclick="deleteFeature(${feature.id})" class="w3-button w3-red w3-round w3-border">
        Delete</button></td>
    `;
    featuresTable.appendChild(row);
  });
}

document.getElementById('add_feature_form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;

  const feature = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    },
    "properties": {
      "name": name,
      "address": address
    }
  };
  socket.emit('add_feature', feature);
  document.getElementById('add_feature_form').reset();
  document.getElementById('add-feature-form').style.display = 'none';
});

function deleteFeature(feature_id) {
  socket.emit('delete_feature', {
    id: feature_id
  });
}