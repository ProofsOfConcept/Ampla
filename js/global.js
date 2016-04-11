var map;
var markers = [];
var markersPositions = [];
var bounds = new google.maps.LatLngBounds();
var iconBase = "img/"; //'https://maps.google.com/mapfiles/kml/shapes/';
var markerColors = ['red', 'yellow', 'green'];
var loadTimeout = 0;
var currentLine = '';
var userLocation = false;
var modalOpen = false;
var browserSupportFlag = new Boolean();
var arrayCores = ["#FF0000", "#0000FF", "#00FF00", "#FF0000", "#00FF00", "#0000FF", "#FF0000", "#0000FF"];
var linhas = [];
var checkOpcoes;
var trafficLayer = new google.maps.TrafficLayer();
var bikeMarkers = [];
var bikeMarkersPositions = [];
var infowindow = null;
var pontosMarkers = [];
var pontosMarkersPositions = [];

function addBikeMarker(location, data) {
    bikeMarkersPositions.push(location);

    var iconUrl = iconBase + "bikeriopin.png";
    //"BAIRRO","ESTACAO","CODIGO","ENDERECO","NUMERO","LATITUDE","LONGITUDE"
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: data[3],
        icon: new google.maps.MarkerImage(iconUrl)
    });

    marker.info = new google.maps.InfoWindow({
        content: '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;">' +
        "Bairro: " + data[0] + "</br>" +
        "Estação: " + data[1] + "</br>" +
        "Endereço: " + data[3] + "</br>" +
        "</div>"
    });
    google.maps.event.addListener(marker, 'click', function () {
        marker.info.close();
        marker.info.open(map, marker);
    });

    bikeMarkers.push(marker);
}

function addMarker(location, data) {
    markersPositions.push(location);
    //var dataBR = data[0].substring(3,6) + data[0].substring(0,2) + data[0].substring(5);
    //var gpsTime = new Date(Date.parse(dataBR));
    var iconUrl;
    var result = data.split(';');
    if (result[7] === 'on') {
        iconUrl = "img/antena_on.png";
    } else {
        iconUrl = "img/antena_off.png";
    }

    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: result[1] + " (" + result[0] + ")",
        icon: new google.maps.MarkerImage(iconUrl)
    });


    var content = '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;">' +
        "Código: " + result[1] + "</br>" +
            //"Hora: " + gpsTime.toLocaleString('pt-BR') + "</br>" +
        "Velocidade: " + result[5] + " Km/h</br>" +
        "Direção: " + result[6] + "</br>" +
        "</div>";

    attachMessage(marker, content, map);

    markers.push(marker);
}

function attachMessage(marker, content, mapa) {
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(mapa, marker);
        infowindow.setContent(content);
    });
}

function setAllMap(map) {
    for (var i = 0; i < markers.length; i++)
        markers[i].setMap(map);
}

function clearMarkers() {
    setAllMap(null);
}

function clearMarkersPositions() {
    markersPositions = [];
}

function showMarkers() {
    setAllMap(map);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
    markersPositions = [];
}

google.maps.Map.prototype.clearMarkers = function () {
    for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
    }
    this.markers = [];
};

function createMarkers() {

    $.ajax('js/AMPLA_LAT_LOG.csv').success(function (data) {
        var lines = data.split('\n');
        mudaBotao(false);
        if (data.length === 0)
            console.log("nenhum dado");
        else {
            setAllMap(null);
            clearMarkersPositions();
            for (var i  in lines) {
                var result = lines[i].split(';');
                var latLng = new google.maps.LatLng(result[3], result[4]);
                addMarker(latLng, lines[i]);
            }
            /*
            for (var a = 0, LtLgLen = markersPositions.length; a < LtLgLen; a++) {
                bounds.extend(markersPositions[a]);
            }
            map.fitBounds(bounds);
            */
        }
    });
}


function mudaBotao(onOff) {
    if (onOff) {
        $(".icon").attr("src", "img/flipflop.gif");
    } else {
        $(".icon").attr("src", "img/searchw.png");
    }
}

function gerarCookie(strCookie, strValor, lngDias) {
    /*
     $.cookie(strCookie, strValor, {
     expires : lngDias
     });
     */
    localStorage.setItem(strCookie, strValor);
}

function mudaClass(span, valor) {
    if (valor == "ck ckoff") {
        $(span).removeClass("ckon");
        $(span).addClass("ckoff");
    } else {
        $(span).removeClass("ckoff");
        $(span).addClass("ckon");
    }
}

function lerCookie(nomeCookie) {
    //var piraque = $.cookie(nomeCookie);
    var piraque = localStorage[nomeCookie];
    if (piraque) {
        checkOpcoes = JSON.parse(piraque);
        //tg tj pt
        mudaClass($("#tg").children("span"), checkOpcoes.tg);
        mudaClass($("#tj").children("span"), checkOpcoes.tj);
        mudaClass($("#pt").children("span"), checkOpcoes.pt);
        mudaClass($("#br").children("span"), checkOpcoes.br);
    }
}
/*
 function apagarCookie(strCookie) {
 $.cookie(strCookie, null);
 }
 */

function gravarOpcoes() {
    var options = {};
    $(".lista li").each(function (index) {
        var id = $(this).attr("id");
        var span = $(this).children("span");
        var classe = span.attr('class');
        options[id] = classe;
    });
    var json = JSON.stderingify(options);
    checkOpcoes = options;
    gerarCookie("dadosRJ", json, 30);
}

$(document).ready(function () {

    lerCookie("dadosRJ");

    $("#searchBox").submit(function (event) {
        event.preventDefault();
        $("#busLine").blur();
        mudaBotao(true);
        createMarkers();
        desenhaShape();
        desenharPontos();
    });

    $("#searchBox input").hover(
        function () {
            $(this).css("background", "rgba(255,255,255,.25)");
        },
        function () {
            $(this).css("background", "rgba(255,255,255,.15)");
        }
    );

    $(".menu-box").click(function () {
        $("#menu").toggleClass("open");
        $("#menuBox").toggleClass("openmenu");
    });

    $("#btn-login").click(function () {
        $("#frm-login").submit();

    });

    $(".menu-box").hover(
        function () {
            $(this).css("opacity", "1.0");
        },
        function () {
            $(this).css("opacity", "0.6");
        }
    );

    $(".lista li").click(function () {
        var id = $(this).attr("id");
        var span = $(this).children("span");
        if ($(span).hasClass("ckon")) {
            $(span).removeClass("ckon");
            $(span).addClass("ckoff");
        } else {
            $(span).removeClass("ckoff");
            $(span).addClass("ckon");
        }
        gravarOpcoes();
        atualizaMapa();
    });

});

function atualizaMapa() {
    if (checkOpcoes) {
        if (checkOpcoes.tg == "ck ckon") {
            trafficLayer.setMap(map);
        } else {
            trafficLayer.setMap(null);
        }

        if (checkOpcoes.tj == "ck ckon") {
            if (currentLine) {
                desenhaShape();
            }
        } else {
            limparCoordenadas();
        }

        if (checkOpcoes.br == "ck ckon") {
            desenharBikeRio();
        } else {
            limparBikeRio();
        }

        if (checkOpcoes.pt == "ck ckon") {
            desenharPontos();
        } else {
            limparPontos();
        }

    }
}

function limparBikeRio() {
    for (var i = 0; i < bikeMarkers.length; i++) {
        bikeMarkers[i].setMap(null);
    }
    bikeMarkers = [];
    bikeMarkersPositions = [];
}

function limparPontos() {
    for (var i = 0; i < pontosMarkers.length; i++) {
        pontosMarkers[i].setMap(null);
    }
    pontosMarkers = [];
    pontosMarkersPositions = [];
}

function verificaSelecaoTrajeto() {
    if (checkOpcoes) {
        if (checkOpcoes.tj == "ck ckon") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function verificaSelecaoPontos() {
    if (checkOpcoes) {
        if (checkOpcoes.pt == "ck ckon") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function limparCoordenadas() {
    for (var i = 0; i < linhas.length; i++) {
        if (linhas) {
            linhas[i].setMap(null);
        }
    }
}

function desenhaShape() {

    if (verificaSelecaoTrajeto()) {

        currentLine = $("#busLine").val();
        $.ajax("http://dadosabertos.rio.rj.gov.br/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha" + currentLine + "-shapes.csv")
            .success(function (data, status, jqXHR) {
                //fazer o shape do caminho do onibus
                var obj = Papa.parse(data);

                var arrayDados = obj.data;
                //removo o cabeçalho
                arrayDados.shift();

                limparCoordenadas();

                var ordens = [[]];
                var indiceOrdens = 0;

                var coordenadas = [];

                for (var i = 0; i < arrayDados.length; i++) {
                    var ponto = arrayDados[i];
                    var lat = ponto[5];
                    var lng = ponto[6];
                    var ordem = ponto[3];

                    var coordenada = new google.maps.LatLng(lat, lng)

                    if (i > 0 && ordem == 0) {
                        indiceOrdens++;
                        ordens[indiceOrdens] = [];
                    }

                    ordens[indiceOrdens].push(coordenada);

                }

                for (var a = 0; a < ordens.length; a++) {
                    var array = ordens[a];
                    var cor = arrayCores[a];
                    var caminho = new google.maps.Polyline({
                        path: array,
                        geodesic: true,
                        strokeColor: cor,
                        strokeOpacity: 1.0,
                        strokeWeight: 3
                    });

                    caminho.setMap(map);
                    linhas.push(caminho);
                }
            });

    }
}