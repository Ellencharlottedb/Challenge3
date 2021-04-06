// Api mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxsZW5jaGFybG90dGVkYiIsImEiOiJja21ramtoaHMweGJsMm9ta3o0ODd2dmxwIn0.CUzbU0eU7C6FuZWahtnycw';

hotelsAdviser = '65a60e4f39msh73836606ee1cd85p148527jsn948fd7880e42';

// api  openWeatherMap
var openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather';
var openWeatherMapUrlApiKey = '24aef0c308c22b445e332d934b35e1c0';

// Dit zijn steden van het weer
var cities = [
  {
    name: 'Amsterdam',
    coordinates: [4.895168, 52.370216]
  },
  {
    name: 'Den Haag',
    coordinates: [4.310130, 52.080189]
  },
  {
    name: 'Nijmegen',
    coordinates: [5.85278, 51.8425]
  },
  {
    name: 'Maastricht',
    coordinates: [5.68889, 50.84833]
  },
  {
    name: 'Groningen',
    coordinates: [6.56667, 53.21917]
  },
  {
    name: 'Enschede',
    coordinates: [6.89583, 52.21833]
  },
];

// Initiate map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ellencharlottedb/ckn4xpoqn014717s2oieh4ae6',
  center: [5.508852, 52.142480],
  zoom: 7
});

// Dit is de zoekbalk
map.addControl(
new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl
}),
);

// Dit is de tomtom
map.addControl(
new MapboxDirections({
accessToken: mapboxgl.accessToken
}),
'top-left'
);

// Hiermee kan je in en uit zoomen.
map.addControl(new mapboxgl.NavigationControl());

var marker1 = new mapboxgl.Marker({ color: 'purple' })
.setLngLat([4.332503, 52.073443])
.addTo(map);
 
// var marker2 = new mapboxgl.Marker({ color: 'purple' })
// .setLngLat([4.796050, 53.053921])
// .addTo(map);

// var marker3 = new mapboxgl.Marker({ color: 'purple' })
// .setLngLat([6.094081, 52.509096])
// .addTo(map);

 

// get weather data and plot on map
map.on('load', function () {
  cities.forEach(function(city) {
    // Usually you do not want to call an api multiple times, but in this case we have to
    // because the openWeatherMap API does not allow multiple lat lon coords in one request.
    var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapUrlApiKey + '&lon=' + city.coordinates[0] + '&lat=' + city.coordinates[1];

    // Get current weather based on cities' coordinates
    fetch(request)
      .then(function(response) {
        if(!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(function(response) {
        // Then plot the weather response + icon on MapBox
        plotImageOnMap(response.weather[0].icon, city)
      })
      .catch(function (error) {
        console.log('ERROR:', error);
      });
  });
});

function plotImageOnMap(icon, city) {
  map.loadImage(
    'http://openweathermap.org/img/w/' + icon + '.png',
    function (error, image) {
      if (error) throw error;
      map.addImage("weatherIcon_" + city.name, image);
      map.addSource("point_" + city.name, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: city.coordinates
            }
          }]
        }
      });
      map.addLayer({
        id: "points_" + city.name,
        type: "symbol",
        source: "point_" + city.name,
        layout: {
          "icon-image": "weatherIcon_" + city.name,
          "icon-size": 1.3
        }
      });
    }
  );
}
map.on('load', function () {
  map.addSource('places', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': myLocationsList
    }
  });

  // Add a layer showing the places.
  map.addLayer({
    'id': 'places',
    'type': 'symbol',
    'source': 'places',
    'layout': {
      'icon-image': '{icon}-15',
      'icon-allow-overlap': true
    }
  });


  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'places', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Populate the popup and set its coordinates based on the feature found.
    popup.setLngLat(coordinates)
         .setHTML(description)
         .addTo(map);
  });

  map.on('mouseleave', 'places', function () {
    popup.remove();
  });
});
