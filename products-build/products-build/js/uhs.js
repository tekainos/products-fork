var map;
var geocoder;
var marker;
var initmarkers = [];
var markers = [];
var openInfo;

$(function () {
    $("input[id^='datemap']").datepicker({
        onSelect: function (selectedDate) {
            var dateMin = $('#datemap0').datepicker("getDate");
            var dateMax = $('#datemap1').datepicker("getDate");
            var rMin = new Date(dateMin.getFullYear(), dateMin.getMonth(), dateMin.getDate());
            var rMax = new Date(dateMax.getFullYear(), dateMax.getMonth(), dateMax.getDate());
            updateDateMap();
        },
        dateFormat: 'yy-mm-dd'
    });
});

function initialize() {
    var mapOptions = {
        zoom: 6,
        center: new google.maps.LatLng(39.9612, -82.9988),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#8ec3b9"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1a3646"
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#4b6878"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#64779e"
                    }
                ]
            },
            {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#4b6878"
                    }
                ]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#334e87"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#023e58"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#283d6a"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#6f9ba5"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "featureType": "poi.business",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#023e58"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#3C7680"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#304a7d"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#98a5be"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#2c6675"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#255763"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#b0d5ce"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#023e58"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#98a5be"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1d2c4d"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#283d6a"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#3a4762"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#0e1626"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#4e6d70"
                    }
                ]
            }
        ]
    };
    var dirServ = new google.maps.DirectionsService;
    var dirDisp = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    dirDisp.setMap(map);
    geocoder = new google.maps.Geocoder();
    openInfo = new google.maps.InfoWindow();
    var waypts = [];
    $('#houseselect option').each(function (elem) {
        var addr = $(this).text();
        var lat = $(this).attr('lat');
        var longit = $(this).attr('longitude');
        var myLatlng = new google.maps.LatLng(lat, longit);
        if (lat > 0) {
            var mark = new google.maps.Marker({
                map: map,
                icon: 'img/measle.png',
                position: myLatlng
            });
            initmarkers[addr] = mark;
            var infowindow = new google.maps.InfoWindow({
                content: '<div style="color: black;"><strong>' + addr + '</strong></div>'
            });
            mark.addListener('click', function () {
                if (openInfo) {
                    openInfo.close();
                }
                openInfo = infowindow;
                infowindow.open(map, mark);
            });
            markers.push(mark);
        }
    });
}

$(document).ready(function () {
    $('#datemap0').datepicker("setDate", "-1");
    $('#datemap1').datepicker('setDate', new Date());
    var dateMin = $('#datemap0').datepicker("getDate");
    var dateMax = $('#datemap1').datepicker("getDate");
    var rMin = new Date(dateMin.getFullYear(), dateMin.getMonth(), dateMin.getDate());
    var rMax = new Date(dateMax.getFullYear(), dateMax.getMonth(), dateMax.getDate());
    //$('#datemap0').datepicker("option", "maxDate", rMax);
    //$('#datemap1').datepicker("option", "minDate", rMin);

    console.log("Map Update");
    resetList();
    var stdmap = $('#datemap0').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    var endmap = $('#datemap1').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    $.ajax({
        url: "http://austinteets.com/owneruhs.php",
        data: { 'start': stdmap, 'end': endmap, 'type_sel': $('#jobtype_select').val(), 'reg_sel': $('#jobreg_select').val() },
        dataType: 'json',
        success: function (res) {
            mapUpdate(res);
            //map.setCenter(new google.maps.LatLng(39.9612, -82.9988));
        }
    });

    $('#houseselect').prop('selectedIndex', -1);
    $("#action_button").click(function () {
        if ($('#houseselect').val()) {
            $("#housesubmit").submit();
        }
    });
    $('#out').on("click", function (e) { e.preventDefault(); $('#logout').submit() });
    $('#houseselect').change(function () {
        var address = $(this).find("option:selected").text();
        var index = $(this).prop('selectedIndex');
        if (initmarkers[address]) {
            google.maps.event.trigger(initmarkers[address], 'click');
        }
    });

    $('#jobtype_select').change(function () {
        console.log("Map Update");
        var stdate = $('#datemap0').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
        var enddate = $('#datemap1').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
        resetList();
        $.ajax({
            url: "http://austinteets.com/owneruhs.php",
            data: { 'start': stdate, 'end': enddate, 'type_sel': $('#jobtype_select').val(), 'reg_sel': $('#jobreg_select').val() },
            dataType: 'json',
            success: function (res) {
                mapUpdate(res);
            }
        });
    });

    $('#jobreg_select').change(function () {
        console.log("Map Update");
        var stdate = $('#datemap0').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
        var enddate = $('#datemap1').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
        resetList();
        $.ajax({
            url: "http://austinteets.com/owneruhs.php",
            data: { 'start': stdate, 'end': enddate, 'type_sel': $('#jobtype_select').val(), 'reg_sel': $('#jobreg_select').val() },
            dataType: 'json',
            success: function (res) {
                mapUpdate(res);
            }
        });
    });

});

function updateDateMap() {
    console.log("Map Update");
    resetList();
    var stdate = $('#datemap0').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    var enddate = $('#datemap1').datepicker({ dateFormat: 'yyyy-mm-dd' }).val();
    $.ajax({
        url: "http://austinteets.com/owneruhs.php",
        data: { 'start': stdate, 'end': enddate, 'type_sel': $('#jobtype_select').val(), 'reg_sel': $('#jobreg_select').val() },
        dataType: 'json',
        success: function (res) {
            mapUpdate(res);
        }
    });
}

function mapUpdate(res) {
    try {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }

        initmarkers = [];
        markers = [];

        var htmlstring = '';
        for (var i = 0; i < res.length; i++) {
            var opto = res[i];
            $('#houseselect').append($("<option></option>").attr("lat", opto[2]).attr("longitude", opto[3]).attr("value", opto[1]).text(opto[1] + ":  " + opto[0]));
        }
        console.log($('#houseselect option').length);
        $('#rescount').text($('#houseselect option').length + " Jobs Found");
        $('#houseselect option').each(function (elem) {
            var addr = $(this).text();
            var lat = $(this).attr('lat');
            var longit = $(this).attr('longitude');
            var myLatlng = new google.maps.LatLng(lat, longit);
            if (lat > 0) {
                var mark = new google.maps.Marker({
                    map: map,
                    icon: 'img/measle.png',
                    position: myLatlng
                });
                bounds.extend(mark.position);
                initmarkers[addr] = mark;
                var infowindow = new google.maps.InfoWindow({
                    content: '<div style="color: black;"><strong>' + addr + '</strong></div>'
                });
                mark.addListener('click', function () {
                    if (openInfo) {
                        openInfo.close();
                    }
                    openInfo = infowindow;
                    infowindow.open(map, mark);
                });
                markers.push(mark);
            }

        });
        var center = bounds.getCenter();
        map.setCenter(center);
        map.fitBounds(bounds);
    } catch (err) {
        console.log(err);
    }
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();

    for (var component in componentForm) {
        if (component !== 'route') {
            document.getElementById(component).value = '';
        }
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            if (addressType == 'route') {
                document.getElementById('street_number').value += ' ' + val;
            } else {
                document.getElementById(addressType).value = val;
            }
        }
    }
}
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}

function resetList() {
    console.log("Cleared List");
    $('#houseselect').empty();
}