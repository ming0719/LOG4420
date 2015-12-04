var app = angular.module('log4420', []);
var nbObjets = 2;
var nbDisciplines = 5;

app.factory('mesRoutes',['$location', function($location){
    var racine = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    return {
        api: racine + "/api",
        avancement: racine + "/api/joueurs/avancement/",
        racine: racine,
        joueur: racine + "/api/joueurs/",
        joueurCourant: racine + "/api/joueurs/joueurCourant",
        sacADos: racine + "/api/joueurs/sacADos/",
        combat: racine + "/api/combat/"
    }
}]);