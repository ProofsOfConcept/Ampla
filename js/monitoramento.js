/**
 * Created by ricardo.oliveira on 14/04/2016.
 */

var results = [];
var map;
var markers = [];
var markersPositions = [];
var bounds = new google.maps.LatLngBounds();
var markerColors = ['red', 'yellow', 'green'];
var loadTimeout = 0;
var currentLine = '';
var userLocation = false;
var modalOpen = false;
var browserSupportFlag = new Boolean();
var linhas = [];
var checkOpcoes;
var trafficLayer = new google.maps.TrafficLayer();
var bikeMarkers = [];
var bikeMarkersPositions = [];
var infowindow = null;
var pontosMarkers = [];
var pontosMarkersPositions = [];
var estados;
var sites =[];
var sitesFiltro = [];


function addMarker(latLng, result){
    markersPositions.push(latLng);
    var iconUrl;
    if (result[6] === undefined || result[6] !="") {
        iconUrl = "../img/antena_on.png";
    }else{
        iconUrl= "../img/antena_off.png";
    }

    var marker = new google.maps.Marker({
        position: latLng,
        position: latLng,
        map: map,
        title:  " (" + result[3] + ")",
        icon: new google.maps.MarkerImage(iconUrl)
    });


        content = '<div style="line-height:1.35;overflow:hidden;white-space:nowrap;">' +
            "Código: " + result[3] + "</br>" +
            "Endereço: " + result[4] + "</br>" +
                //"Hora: " + gpsTime.toLocaleString('pt-BR') + "</br>" +
            "Data: " + result[5] + "</br>" +
            "Data Solução: " + result[6] + "</br>" +
            "</div>";
    attachMessage(marker, content, map);
    markers.push(marker);
}

function carregarSites(){
    $.ajax('../js/CLARO_SITES_LAT_LOG.csv').then(successSites,errorSites);
}

function successSites(response) {
   sites = Papa.parse(response, {delimiter: ";"}).data;
}

function verificarAlarmes() {
    clearAlertList();
    $.ajax('../js/AlarmesHistoricos_2016.csv').then(successAlarmes, errorAlarmes);
}

function drawMarkers() {
    setAllMap(null);
    clearMarkersPositions();
    clearAlertList();
    for(var z in results) {
        var result = results[z];
        var latLng = new google.maps.LatLng(result[1], result[2]);
        addMarker(latLng, result);
        addAlertsList(result, z);
    }
}

function clearAlertList(){
    $("#alerts-list").empty();
}

function errorAlarmes(response) {
}

function errorSites(response) {
    console.log('Ocorreu um erro ao tentar buscar sites');
}

function createComboEstados() {
    $("#cbestados").html("");
    $.ajax('../js/estados-cidades.json').success(function (data) {
        estados = data.estados;
        $("#cbestados").append("<option value=''> -- Estado -- </option>");
        for(var i in estados) {
            $("#cbestados").append("<option value='" + i + "'>" + estados[i].nome + "</option>");
        }
    });
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


function replaceSpecialChars(str)
{
    str = str.replace(/[ÀÁÂÃÄÅ]/,"A");
    str = str.replace(/[àáâãäå]/,"a");
    str = str.replace(/[ÈÉÊË]/,"E");
    str = str.replace(/[Ç]/,"C");
    str = str.replace(/[ç]/,"c");
    str = str.replace(/[Íí]/,"i");
    str = str.replace(/[Úú]/,"u");
    str = str.replace(/[Óó]/,"o");

    return str;
}


function markerClick(indice) {
   google.maps.event.trigger(markers[indice], 'click');
}

function addAlertsList (linha, indice) {
    var icon = linha[6] != "" ? "fa-check" : "fa-times";
    $("#alerts-list").append("<a onclick='markerClick(" + indice + ")' class='list-group-item alerts-list-item'>"+
        "<i class='fa " + icon + " fa-fw'></i> "+ linha[3] +
        "<span class='pull-right text-muted small'><em>" + linha[6]+" </em>"+
        "</span>"+
        "</a>");
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

    $("#cbestados").change(function (event) {

        $("#cbestados option:selected" ).each(function () {
            $("#cbcidades").html("");
            var indice = $(this).val();
            if(indice === "") {
                $(".cb-cidades").fadeOut();
            } else {
                var cidades = estados[indice].cidades;
                $("#cbcidades").append("<option value=''> -- Cidade -- </option>");
                for(var j = 0;j < cidades.length; j++) {
                    $("#cbcidades").append("<option value='" + replaceSpecialChars(cidades[j]) + "'>" + cidades[j] + "</option>");
                }
                $(".cb-cidades").fadeIn();
            }
        });
    });

    $("#btn-login").click(function(){
        if(($("#email").val() === 'ampla@ampla.com.br') && ($("#password").val()==='ampla')){
            $("#frm-login").submit();
        }
    });

});


$(document).ready(function () {

    $("#cbcidades").change(function (event) {
        $("#cbcidades option:selected" ).each(function () {
            if($(this).val()){
                filterSitesByMunicipio($(this).val());
                verificarAlarmes();
                setInterval(function () {
                    verificarAlarmes()
                }, 15000);
            }
        });
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

function limparCoordenadas() {
    for (var i = 0; i < linhas.length; i++) {
        if (linhas) {
            linhas[i].setMap(null);
        }
    }
}

function filterSitesByMunicipio(codMunicipio){
   var resultado = sites.filter(function(data) {
        var x = data[0];
        return x === codMunicipio.toUpperCase();
    });
    sitesFiltro = resultado;
}


function successAlarmes(response) {
    var dados = Papa.parse(response, {delimiter: ";"}).data;
    results = [];
    for (var i in sitesFiltro) {
        var site = sitesFiltro[i];
        var codSite = site[3];
        var resultado = dados.filter(function (data) {
            var x = data[3];
            return x === codSite;
        });

        if (resultado.length > 0) {
            results.push(resultado[resultado.length - 1]);
        }
    }
    drawMarkers();
    ajustarAosPontos();
}

function ajustarAosPontos () {
    for (var a = 0, LtLgLen = markersPositions.length; a < LtLgLen; a++) {
        bounds.extend(markersPositions[a]);
    }
    map.fitBounds(bounds);
}







