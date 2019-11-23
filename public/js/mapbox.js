/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZDIzMjEyMSIsImEiOiJjazI3c2kwYXcwY3A4M2xvYnhkaG1hcjdlIn0.kXcvmwaNQiXzAdmaIMK7Ow';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/d232121/ck27t3bko1a861cmkvs1xsqlv',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Add marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 50,
      left: 100,
      right: 100
    }
  });
};
