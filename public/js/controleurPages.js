app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    $scope.joueur = {};
    $scope.avancement = {};
    $scope.page = {};
    $scope.decision = {};
    $scope.confirmation = null;
    $scope.rondes = [];
    $scope.objetsAAjouter = {};
    $scope.sacADos;
    
    var LOCAL_URL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    
    $http.get(LOCAL_URL + "/api/joueurs/joueurCourant").then(function(response) {
        $scope.joueur = response.data;
        $http.get(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id).then(function (response) {
            $scope.avancement = response.data;
            $scope.chargerPage("/pages/" + $scope.avancement.pageId + "/" + $scope.avancement.sectionId);
        });
    });
    
    
    $scope.mettreAJourJoueur = function (joueur = null, page = null) {
        $scope.joueur = joueur ? joueur : $scope.joueur;
        var pageSuivante = page ? page : ("/pages/" + $scope.page.id + "/" +  $scope.page.section + 1);
        $http.put(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id, JSON.stringify({joueur: $scope.joueur})).then( function () {
            $scope.chargerPage(pageSuivante);
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
        $scope.ajouterObjets = null;
        // Récupération de la page
        $http.get(LOCAL_URL + "/api" + page).then(function(response){
            $scope.page = response.data;
            
            if($scope.page.id != 1 
                && $scope.page.section == 1
                && $scope.joueur.disciplines.indexOf("Guérison") > -1 
                && $scope.joueur.endurancePlus < $scope.joueur.enduranceBase)
            {
                alert("Vous disposez de la discipline Guérison : vous gagnez un point d'endurance");
                $scope.joueur.endurancePlus++;
            }
            
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
                    $scope.confirmation = response.data
                    //console.log("BBBB");
                    //console.log($scope.confirmation.joueur);
                });
            }
            
            // Si on a un ajout objet
            if($scope.page.ajouterObjets) {
                $scope.objetsAAjouter = {};
            }
            
            // Si on a un combat
            if($scope.page.combat) {
                $scope.combat = $scope.page.combat; 
                // Charger un combat depuis l'avancement
                if($scope.avancement.combats.length > 0) {
                    var cnt = 0;
                    for(ronde of $scope.avancement.combats) {
                        var habileteJoueur = ronde.puissancePsychique ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
                       
                        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + ronde.enduranceMonstre + "/" + $scope.combat.habilete + "/" + ronde.chiffreAleatoire ;
                        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde){
                            var enduranceMonstre = $scope.rondes.length > 0 ? $scope.rondes[$scope.rondes.length - 1].enduranceEnnemi : $scope.combat.endurance;
                            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
                            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
                            enduranceMonstre -= ronde.data.degatEnnemi;
                            ronde.data.enduranceEnnemi = enduranceMonstre;
                            $scope.rondes.push(ronde.data);
                            cnt++;
                            if(cnt == $scope.avancement.combats.length) {
                                $scope.combat.defaite = ($scope.rondes[$scope.rondes.length - 1].enduranceJoueur <= 0);
                                $scope.combat.victoire = ($scope.rondes[$scope.rondes.length - 1].enduranceEnnemi <= 0);
                            }
                        });
                    }
                }
                else {
                    $scope.rondes = [];
                }
            }
            
        });
    }
    
    $scope.mettreAJourObjets = function () {
        Object.keys($scope.objetsAAjouter).forEach(function(key) {
            if($scope.objetsAAjouter[key]) {
                $scope.joueur.objets.push(key);
            }
        });
        $scope.mettreAJourJoueur();
    }
    
    
    $scope.combattre = function (fuite, puissancePsy ) {
        var enduranceMonstre = $scope.rondes.length > 0 ? $scope.rondes[$scope.rondes.length - 1].enduranceEnnemi : $scope.combat.endurance;
        var habileteJoueur = puissancePsy ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + enduranceMonstre + "/" + $scope.combat.habilete;
        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde){
            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
            if(!fuite) {
                enduranceMonstre -= ronde.data.degatEnnemi;
                ronde.data.enduranceEnnemi = enduranceMonstre;
            }
            
             // Mise à jour de l'avancement du combat dans la BDD
            var rondeCombat = {};
            rondeCombat.chiffreAleatoire = ronde.data.chiffreAleatoire;
            rondeCombat.enduranceMonstre = ronde.data.enduranceEnnemi;
            rondeCombat.puissancePsychique = puissancePsy;
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