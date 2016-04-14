/**
 * Created by ricardo.oliveira on 14/04/2016.
 */

var allSites = [];
var alertas = [];


function findAllSites(){
    var url = '../js/CLARO_SITES_LAT_LOG.csv';
    $.ajax(url).success(function(data){
       if(data.length == 0){
           console.log('Nenhum Registro foi encontrado');
       }else{
           allSites = data.split('\n');
       }

    });

}


