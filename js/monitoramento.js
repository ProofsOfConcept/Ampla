/**
 * Created by ricardo.oliveira on 14/04/2016.
 */

var results = [];
var map;
var markers = [];
var markersPositions = [];
var bounds = new google.maps.LatLngBounds();
var userLocation = false;
var browserSupportFlag = new Boolean();
var infowindow = null;
var estados;
var sites =[];
var sitesFiltro = [];
var cidadeSelecionada;
var estadoSelecionado;
var ocorrencias;


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

function carregaOcorrencias(){

    $.ajax('../js/alarmeDiario.csv').success(function(data){
        ocorrencias = Papa.parse(data, {delimiter: ";"}).data;
    });
}

function successSites(response) {
    sites = Papa.parse(response, {delimiter: ";"}).data;
}

function verificarAlarmes() {
    $.ajax('../js/alarmeDiario.csv').then(successAlarmes, errorAlarmes);
    if(estadoSelecionado && cidadeSelecionada) {
        clearAlertList();
    }
}

function drawMarkers() {
    setAllMap(null);
    clearMarkersPositions();
    clearAlertList();
    deleteMarkers();
    for(var z in results) {
        var result = results[z];
        var latLng = new google.maps.LatLng(result[1], result[2]);
        addMarker(latLng, result);
        //addAlertsList(result, z);
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
        $("#cbestados").append("<option value=''>-- Estado --</option>");
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
    str = str.replace(/[ÁÀÃÂÄ]/,"A");
    str = str.replace(/[áàãâä]/,"a");
    str = str.replace(/[éèêë]/,"e");
    str = str.replace(/[ÉÈÊË]/,"E");
    str = str.replace(/[íìîï]/,"i");
    str = str.replace(/[ÍÌÎÏ]/,"I");
    str = str.replace(/[ÓÒÕÔÖ]/,"O");
    str = str.replace(/[óòõôö]/,"o");
    str = str.replace(/[ÚÙÛÜ]/,"U");
    str = str.replace(/[úùûü]/,"u");
    str = str.replace(/[Ç]/,"C");

    return str;
}

function markerClick(indice) {
    google.maps.event.trigger(markers[indice], 'click');
}

function addAlertsList (linha, indice) {
    var icon = linha[6] != "" ? "fa-check" : "fa-times";
    var classe  = linha[6] != "" ? "color:#00CB00" : "color:#E73131";
    $("#alerts-list").append("<a onclick='markerClick(" + indice + ")' class='list-group-item alerts-list-item'>"+
        "<i class='fa " + icon + " fa-fw' style='"+classe+"'></i> "+ linha[3] +
        "<span class='pull-right text-muted small'><em>" + linha[6]+" </em>"+
        "</span>"+
        "</a>");
}

$(document).ready(function () {

    $("#cbestados").change(function (event) {

        $("#cbestados option:selected" ).each(function () {
            $("#cbcidades").html("");
            var indice = $(this).val();
            if(indice === "") {
                $(".cb-cidades").fadeOut();
            } else {
                estadoSelecionado = estados[indice];
                var cidades = estados[indice].cidades;
                $("#cbcidades").append("<option value=''>-- Cidade --</option>");
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

    $("#cbcidades").change(function (event) {
        $("#cbcidades option:selected" ).each(function () {
            cidadeSelecionada = null;
            if($(this).val()){
                cidadeSelecionada = $(this).val();
                filterSitesByMunicipio($(this).val());
                verificarAlarmes();
            }
        });
    });

});

function filterSitesByMunicipio(codMunicipio){
    var resultado = sites.filter(function(data) {
        var x = data[0];
        return x === codMunicipio.toUpperCase();
    });
    sitesFiltro = resultado;
}

function successAlarmes(response) {

    if(sitesFiltro!= ""){
        teste(response);
    }else{

        var contador = 0;
        for (var i in sites) {
            var site = sites[i];
            var codSite = site[3];
            var resultado = ocorrencias.filter(function (data) {
                var x = data[3];
                return x === codSite;
            });


            if (resultado.length > 0) {
                results.push(resultado[resultado.length - 1]);
            }else{

                var semAlarme =[site[0],site[1],site[2],site[3],"",""];
                results.push(semAlarme);
            }

            if(results[0]) {
                drawMarkers();
                ajustarAosPontos();
            }
        }

    }
}


function teste(response){

    //var dados = Papa.parse(response, {delimiter: ";"}).data;
    results = [];
    for (var i in sitesFiltro) {
        var site = sitesFiltro[i];
        var codSite = site[3];
        var resultado = ocorrencias.filter(function (data) {
            var x = data[3];
            return x === codSite;
        });

        if (resultado.length > 0) {
            results.push(resultado[resultado.length - 1]);
        }
    }
    if(sitesFiltro[0] && results[0]) {
        drawMarkers();
        ajustarAosPontos();
    }
}




function ajustarAosPontos () {
    var hasMakers = false;
    bounds = new google.maps.LatLngBounds();
    for (var a = 0, LtLgLen = markersPositions.length; a < LtLgLen; a++) {
        bounds.extend(markersPositions[a]);
        hasMakers = true;
    }
    if(hasMakers) {
        map.fitBounds(bounds);
    }
}
