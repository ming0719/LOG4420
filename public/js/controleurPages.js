//var Avancement = require('../../models/avancement');

app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    $scope.joueur = {};
    $scope.avancement = {};
    $scope.page = {};
    $scope.decision = {};
    $scope.confirmation = null;
    $scope.rondes = [];
    
    var LOCAL_URL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    
    $http.get(LOCAL_URL + "/api/joueurs/joueurCourant").then(function(response) {
        $scope.joueur = response.data;
        $http.get(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id).then(function (response) {
            $scope.avancement = response.data;
            $scope.chargerPage("/pages/" + $scope.avancement.pageId + "/" + $scope.avancement.sectionId);
        });
    });
    
    $scope.mettreAJourJoueur = function (joueur, page) {
        $http.put(LOCAL_URL + "/api/joueurs/" + joueur._id, JSON.stringify({joueur: joueur})).then( function () {
            $scope.chargerPage(page);
        });
    }
    
    $scope.mettreAJourJoueur = function ( ) {
        $http.put(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id, JSON.stringify({joueur: $scope.joueur,})).then( function () {
            var sectionSuivante = $scope.page.section + 1;
            $scope.chargerPage("/pages/" + $scope.page.id + "/" + sectionSuivante);
        });
    }
    
    mettreAJourAvancement = function () {
        $http.put(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id, JSON.stringify({avancement: $scope.avancement}));
    }
        
    $scope.chargerPage = function (page) {
        $scope.page = {};
        $scope.decision = {};
        $scope.confirmation = null;
        $scope.combat = null;
        // Récupération de la page
        $http.get(LOCAL_URL + "/api" + page).then(function(response){
            $scope.page = response.data;
            
             // Mise à jour de l'avancement dans la BDD
            $scope.avancement.pageId = $scope.page.id;
            $scope.avancement.sectionId = $scope.page.section;
            if(!$scope.page.combat) {
                $scope.avancement.combats = [];
            }
            mettreAJourAvancement();

            // Si on a une décision
            if($scope.page.decision) {
                $http.get(LOCAL_URL + $scope.page.decision + "/" + $scope.page.id).then(function(response) {
                    $scope.decision = response.data;
                });
            }
            // Si on a une confirmation
            if($scope.page.confirmation) {
                $http.get(LOCAL_URL + $scope.page.confirmation + "/" + $scope.page.id).then(function(response) {
                    $scope.confirmation = response.data;
                });
            }
            
            // Si on a un combat
            if($scope.page.combat) {
                $scope.combat = $scope.page.combat; 
                // Charger un combat depuis l'avancement
                if($scope.avancement.combats.length > 0) {
                    for(ronde in $scope.avancement.combats) {
                        var urlCombat = $scope.joueur.endurancePlus + "/" + $scope.joueur.habiletePlus + "/" + $scope.avancement.combats[ronde].enduranceMonstre + "/" + $scope.combat.habilete + "/" + $scope.avancement.combats[ronde].chiffreAleatoire ;
                            $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde){
                                var enduranceMonstre = $scope.rondes.length > 0 ? $scope.rondes[$scope.rondes.length - 1].enduranceEnnemi : $scope.combat.endurance;
                                $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
                                ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
                                enduranceMonstre -= ronde.data.degatEnnemi;
                                ronde.data.enduranceEnnemi = enduranceMonstre;
                                $scope.rondes.push(ronde.data);
                        });
                    }
                }
                else {
                    $scope.rondes = [];
                }
                console.log($scope.rondes);
            }
            
        });
    }
    
    
    $scope.combattre = function (fuite ) {
        var enduranceMonstre = $scope.rondes.length > 0 ? $scope.rondes[$scope.rondes.length - 1].enduranceEnnemi : $scope.combat.endurance;
        var urlCombat = $scope.joueur.endurancePlus + "/" + $scope.joueur.habiletePlus + "/" + enduranceMonstre + "/" + $scope.combat.habilete;
        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde){
            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
            if(!fuite) {
                enduranceMonstre -= ronde.data.degatEnnemi;
                ronde.data.enduranceEnnemi = enduranceMonstre;
                console.log(ronde.data);
            }
            
             // Mise à jour de l'avancement du combat dans la BDD
            var rondeCombat = {};
            rondeCombat.chiffreAleatoire = ronde.data.chiffreAleatoire;
            rondeCombat.enduranceMonstre = ronde.data.enduranceEnnemi;
            $scope.avancement.combats.push(rondeCombat);
            mettreAJourAvancement();
            
            $scope.rondes.push(ronde.data);
            $scope.combat.fuite = fuite;
            if(!fuite) {
                $scope.combat.defaite = (ronde.data.enduranceJoueur <= 0);
                $scope.combat.victoire = (ronde.data.enduranceEnnemi <= 0);
            }
        });
    }
}]);