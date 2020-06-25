/* eslint-disable */
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGV2LWFobWVka2hhbGlsIiwiYSI6ImNrYTZmZWJiMjA2ZTQycXA5cDVxcHFsM3IifQ.uwMFnTcynnISs3QJ6vTf5A';
  const map = new mapboxgl.Map({
    // It will add the map on an elemint with id called map
    container: 'map',
    style: 'mapbox://styles/dev-ahmedkhalil/cka6gbpoa084d1ip839xi9hyh',
    scrollZoom: 10
  });

  // The area that will be specified on the map
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend the map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100
    }
  });
};
