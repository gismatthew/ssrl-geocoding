var goole_map_api_key = 'AIzaSyDV5I4vdmmzzk6jW60x8SMYEoyGBToG_BU', // your google map api's key
    prog_n = 0,   // total no. of addresses to be geocoded
    prog_i = 0,   // current address's sequential id
    done = 0,     // whether job is finished
    na = 0,       // keep track of no of addresses failed to be geocoded
    map,          // map object
    markers = [], // markers
    infoWindow;   // InfoWindow for markers

// inject google map api to our page
var gmapLib = document.createElement('script');
gmapLib.src = 'https://maps.googleapis.com/maps/api/js?key=' + goole_map_api_key + '&callback=initMap';
gmapLib.async = true;
gmapLib.defer = true;

document.head.appendChild(gmapLib);

// get our control objects so we can manipulate them (on their properties/behaviours)
var progBar = document.getElementsByTagName('progress')[0]; // the progressbar
var progLbl = document.querySelector('progress + div'); // the progressbar's label

var btnRun = document.getElementById('btnRun');
var input = document.getElementById('input');
var output = document.getElementById('output');

btnRun.addEventListener('click', function(){
  
  // reset params to their initial states
  done = 0;
  removeMarkers();
  output.value = "address, latitude, longitude";
  
  var addresses = input.value.trim().split('\n');
  if(!addresses.length){
    return "Invalid data!";
  }else{
    prog_n = addresses.length;
  }

  // update UI
  progBar.style.display = 'block';
  progLbl.style.display = 'block';
  btnRun.disabled = true;
  
  // geocode each line (address)
  for (var i = 0; i < prog_n; i++) {
    (function(i){
      setTimeout(function(){
        prog_i = i + 1;
        progBar.value = (prog_i * 100 / prog_n).toFixed(0);
        progLbl.innerText = progBar.value + '%';
        if(prog_i === prog_n){
          done = 1;
        }
        geoCode(addresses[i].trim());
      }, 25 * i);
    })(i); // end of the closure to keep 'i' isolated in setTimeout
           // thus not affected by 'i' from the for loop
  } // end for
}); // end of btnRun.click

function geoCode(address){
  var req_url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + goole_map_api_key;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) { // specs available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Properties
      if(this.status == 200){
        var res = JSON.parse(this.responseText);
        var loc = res.results[0].geometry.location;
        var lat = loc.lat;
        var lng = loc.lng;
        addMarker(address, lat, lng);
        var lat = loc.lat.toFixed(6);
        var lng = loc.lng.toFixed(6);
        output.value += '\n' + address + ',' + lat + ',' + lng;
      }else{
        output.value += '\n' + address + ', -- , --';
        na ++;
      }
    
      if(done){
        
        // update UI
        progBar.style.display = 'none';
        progLbl.style.display = 'none';
        btnRun.disabled = false;
        
        var ok = prog_n - na;
        var ok_p = (ok * 100 / prog_n).toFixed(1);
        var na_p = 100 - ok_p;
        var msg = '------------Results------------\n' +
                  'Total:\t'   + prog_n  + '\n' +
                  'Success:\t' + ok + ' (' + ok_p + '%)\n' +
                  'Failure:\t' + na      + ' (' + na_p + '%)\n' +
                  '-------------------------------\n';
        
        alert(msg);
      }
   }
  };
  xhttp.open("GET", req_url, true);
  xhttp.send();
} // end of function geoCode

input.addEventListener('focus', function(){
  this.select();
});

output.addEventListener('focus', function(){
  this.select();
});

function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 54.958148, lng: -106.256079},
    scrollwheel: false,
    zoom: 5
  });
  
  infoWindow = new google.maps.InfoWindow();
  
} // end of function initMap

function removeMarkers(){
  while(markers.length){
    var m = markers[markers.length - 1];
    m.setMap(null);
    m = null;
    markers.pop();
  }
}

function addMarker(addr, lat, lng){
  var marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map,
    title: addr,
    icon: 'footprint.png'
  });
  marker.addListener('click', function(){
    var cont = '<div class="value"><div class="caption">Address:</div>' + addr + '</div>' +
               '<div class="value"><div class="caption">Latitude:</div>' + lat + '</div>' +
               '<div class="value"><div class="caption">Longitude:</div>' + lng + '</div>';
    infoWindow.setContent(cont);
    // var info = new google.maps.InfoWindow({
      // content: this.getTitle()
    // });
    infoWindow.open(map, this);
  });
  markers.push(marker);
}