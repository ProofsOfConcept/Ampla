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
            navigator.geolocation.getCurrentPosition(function (position) {
                app.geolocationSuccess(position),
                    app.geolocationError
            });
        } else {
            app.createMap();
        }
    },
    geolocationSuccess: function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        userLocation = new google.maps.LatLng(lat, lon);
        app.createMap();
        app.showDevicePosition(userLocation);
        // espera a criação do mapa
        //setTimeout(createMarkers(), 100);
    },
    geolocationError: function (error) {

        toastr.error('[ERROR ' + error.code + '] ' + error.message);
        app.createMap();
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
            zoom: 8,
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
        //verificarAlarmes();
        setInterval(function () {
            verificarAlarmes()
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