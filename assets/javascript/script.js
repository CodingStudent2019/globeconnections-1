// add map and infowindow information
let map, places, infoWindow;
let hostnameRegexp = new RegExp('^https?://.+?/');

function initAutocomplete() {
 map = new google.maps.Map(document.getElementById('map'), {
  center: {
   lat: 39.952583,
   lng: -75.165222
  },
  zoom: 10,
  mapTypeId: 'roadmap'
 });

 infoWindow = new google.maps.InfoWindow({
  content: document.getElementById('info-content')
 });

 places = new google.maps.places.PlacesService(map);

 // Create the search box and link it to the UI element.
 let input = document.getElementById('pac-input');
 let searchBox = new google.maps.places.SearchBox(input);

 // Bias the SearchBox results towards current map's viewport.
 map.addListener('bounds_changed', function() {
  searchBox.setBounds(map.getBounds());
 });

 let markers = [];
 // Listen for the event fired when the user selects a prediction and retrieve
 // more details for that place.
 searchBox.addListener('places_changed', function() {
  let places = searchBox.getPlaces();

  if (places.length == 0) {
   return;
  }

  // Clear out the old markers.
  markers.forEach(function(marker) {
   google.maps.event.clearListeners(marker, 'click');
   marker.setMap(null);
  });
  markers = [];


  /* my code for a new map window */
  function openNewwindow() {
  let infowindow = document.getElementById(`iw-url`);
}
  /* my code for a new map window */

  // For each place, get the icon, name and location.
  let bounds = new google.maps.LatLngBounds();
  let count = 0;
  places.forEach(function(place) {
   if (!place.geometry) {
    return;
   }
   let icon = {
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
   };

   // Create a marker for each place.
   markers.push(new google.maps.Marker({
    map: map,
    icon: icon,
    title: place.name,
    position: place.geometry.location
   }));

   markers[count].placeResult = place;

   google.maps.event.addListener(markers[count], 'click', showInfoWindow);

   if (place.geometry.viewport) {
    // Only geocodes have viewport.
    bounds.union(place.geometry.viewport);
   } else {
    bounds.extend(place.geometry.location);
   }

   count++;
  });
  map.fitBounds(bounds);
 });
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
 let marker = this;
 places.getDetails({
   placeId: marker.placeResult.place_id
  },
  function(place, status) {
   if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return;
   }
   infoWindow.open(map, marker);
   buildIWContent(place);
  });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
 document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
  'src="' + place.icon + '"/>';
 document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
  '">' + place.name + '</a></b>';
 document.getElementById('iw-address').textContent = place.vicinity;

 if (place.formatted_phone_number) {
  document.getElementById('iw-phone-row').style.display = '';
  document.getElementById('iw-phone').textContent =
   place.formatted_phone_number;
 } else {
  document.getElementById('iw-phone-row').style.display = 'none';
 }

 // Assign a five-star rating to the hotel, using a black star ('&#10029;')
 // to indicate the rating the hotel has earned, and a white star ('&#10025;')
 // for the rating points not achieved.
 if (place.rating) {
  let ratingHtml = '';
  for (let i = 0; i < 5; i++) {
   if (place.rating < (i + 0.5)) {
    ratingHtml += '&#10025;';
   } else {
    ratingHtml += '&#10029;';
   }
   document.getElementById('iw-rating-row').style.display = '';
   document.getElementById('iw-rating').innerHTML = ratingHtml;
  }
 } else {
  document.getElementById('iw-rating-row').style.display = 'none';
 }

 // The regexp isolates the first part of the URL (domain plus subdomain)
 // to give a short URL for displaying in the info window.
 if (place.website) {
  let fullUrl = place.website;
  let website = hostnameRegexp.exec(place.website);
  if (website === null) {
   website = 'http://' + place.website + '/';
   fullUrl = website;
  }
  document.getElementById('iw-website-row').style.display = '';
  document.getElementById('iw-website').textContent = website;
 } else {
  document.getElementById('iw-website-row').style.display = 'none';
 }
}