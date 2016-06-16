var app = {
    openModal: false,
    initialize: function () {

        toastr.options = {
            "closeButton": true,
            "debug": false,
            "progressBar": true,
            "positionClass": "toast-bottom-center",
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };

        if (navigator.geolocation) {
            //app.createMap();
            browserSupportFlag = true;

            var latLong;
            $.getJSON("http://ipinfo.io", function(ipinfo){
                latLong = ipinfo.loc.split(",");
                app.geolocationSuccess(latLong);
            });
        } else {
            app.createMap();
        }
    },
    geolocationSuccess: function (position) {

        var lat = position[0];
        var lon = position[1];
        userLocation = new google.maps.LatLng(lat, lon);
        app.createMap();
        app.showDevicePosition(userLocation);
        // espera a criação do mapa
        //setTimeout(createMarkers(), 100);
    },
    createMap: function () {
        var mapDiv = document.getElementById("map_canvas");

        var noPoi = [
            {
                featureType: "poi",
                stylers: [
                    {visibility: "off"}
                ]
            }
        ];

        var location = new google.maps.LatLng(-22.818943, -43.045118);
        map = new google.maps.Map(mapDiv, {
            center: location,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            disableDefaultUI: true,
            styles: noPoi
        });

        infowindow = new google.maps.InfoWindow();

        createComboEstados();
        carregarSites();
        carregaOcorrencias();
        setInterval(function () {
            //timeout util.
            verificarAlarmes(true);
        }, 10000);
        setTimeout(function () {
            //.5seg para rodar, esperar a pagina carregar
            verificarAlarmes(false);
        }, 10000);

    },
    showDevicePosition: function (location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: '../img/pegman.png',
        });

    }

};

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear();
    var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
    var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
    return "".concat(yyyy).concat(mm).concat(dd);
};

var d = new Date();
var url_aquivo_alarmes  = '../js/alarmeDiario_' + d.yyyymmdd()+ '.csv';

