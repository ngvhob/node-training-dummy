const loc = JSON.parse(document.getElementById('map').dataset.locations);
mapboxgl.accessToken =
  'pk.eyJ1Ijoibmd2aG9iIiwiYSI6ImNsbjMyamcyNDBmZzQyam53NnptdzZtemIifQ.GoRAWrvoL2mih4U_7jz_IA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ngvhob/cln32rbcm035z01r4bith2l8t',
  scrollZoom :false,
  // center: [77.37861, 	28.62279],
  // zoom: 10,
  // interactive: true
});

// const el = document.createElement('div');
// location.className = 'marker';
// new mapboxgl.Marker({
//       element: el,
//       anchor: 'bottom'
//   }) 
//   .setLngLat([77.37861, 	28.62279])
//   .addTo(map);

const bounds = new mapboxgl.LngLatBounds();
loc.forEach(location => {
  const el = document.createElement('div');
  location.className = 'marker';
  // ADD MAR
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(location.coordinates)
    .addTo(map);
  // ADD POP UP
  new mapboxgl.Popup({
    offset : 30
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day} : ${location.description}</p>`)
    .addTo(map);
  bounds.extend(location.coordinates);
});
map.fitBounds(bounds, { padding: 200 });
