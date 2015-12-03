var app = angular.module('log4420', []);
var nbObjets = 2;
var nbDisciplines = 5;

app.factory('myRoutes',['$location', function($location){
    var root = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    return {
        root: root,
        joueurCourant: root + "/api/joueurs/joueurCourant",
        avancement: root + "/api/joueurs/avancement/",
    }
}]);

function ServiceJoueur($location, $http, $q, $log, myRoutes) {
    this.$location = $location;
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
    this.myRoutes = myRoutes;
    this.joueur = function() {
        return this.$http.get(this.myRoutes.joueurCourant);
    }
}

app.service('ServiceJoueur', ['$location','$http', '$q', '$log','myRoutes', ServiceJoueur]);

app.controller('personnagesExistants', ['$scope', '$location', '$http', 
                                       function($scope, $location, $http) {
    var LOCAL_URL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    $scope.joueurs = null;
    chargerJoueurs();
    
    function chargerJoueurs() {
        $http.get(LOCAL_URL + "/api/joueurs").then(function(response) {
           $scope.joueurs = response.data || [];
        }); 
    };

    $scope.supprimerJoueur = function (id) {
        if(confirm("Vous voulez supprimer ce joueur?"))
            $http.delete(LOCAL_URL + "/api/joueurs/" + id).then(function() {
                chargerJoueurs();
            });
    }
    
    $scope.utiliserJoueur = function (id) {
        $http.get(LOCAL_URL + "/api/joueurs/charger/" + id).then(function() {
            $http.get(LOCAL_URL + "/api/joueurs/avancement/" + id).then(function (response) {
                window.location.pathname = "/jeu/";
            })
        });
    }
}]);

app.controller('nouveauPerso', function($scope) {
    $scope.formData = {
        nomJoueur : "",
        armes: {},
        objetsSpeciaux: {},
        objets: {},
        disciplines: {},
    };
    
    nbArmesChoisies = function() {
        var nbArmesChoisies = 0;
        Object.keys($scope.formData.armes).forEach(function(key) {
            if($scope.formData.armes[key]) {
                nbArmesChoisies++;
            }
        });
        return nbArmesChoisies;
    }
    
    nbObjetsChoisis = function() {
        var nbObjetsChoisis = 0;
        
        Object.keys($scope.formData.objets).forEach(function(key) {
            if($scope.formData.objets[key]) {
                nbObjetsChoisis++;
            }
        });
        
        Object.keys($scope.formData.objetsSpeciaux).forEach(function(key) {
            if($scope.formData.objetsSpeciaux[key]) {
                nbObjetsChoisis++;
            }
        });
        
        nbObjetsChoisis += nbArmesChoisies();
        return nbObjetsChoisis;
    }
    
    nbDisciplinesChoisies = function() {
        var nbDisciplinesChoisies = 0;
        Object.keys($scope.formData.disciplines).forEach(function(key) {
            if($scope.formData.disciplines[key]) {
                nbDisciplinesChoisies++;
            }
        });
        return nbDisciplinesChoisies;
    }
    
    $scope.bloquerFormulaire = function() {
        return $scope.afficherErreurNom() ||
               $scope.afficherErreurMaitriseArme() ||
               $scope.afficherErreurEquipement() ||
               $scope.afficherErreurDisciplines();
    }
    
    $scope.afficherErreurDisciplines = function() {
        return !(nbDisciplinesChoisies() == nbDisciplines);
    }
    
    $scope.afficherErreurEquipement = function() {
        return !(nbObjetsChoisis() == nbObjets);
    }
    
    $scope.afficherErreurNom = function() {
        return ($scope.formData.nomJoueur == "");
    }
    
    $scope.afficherErreurMaitriseArme = function() {
        return ($scope.formData.disciplines['MAITRISE_ARMES'] && nbArmesChoisies() == 0) || 
            (!$scope.formData.disciplines['MAITRISE_ARMES'] && nbArmesChoisies() > 0);
    }
});