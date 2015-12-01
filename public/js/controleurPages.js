app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    $scope.joueur = {};
    $scope.avancement = {};
    $scope.page = {};
    $scope.decisions = [];
    $scope.confirmation = null;
    //$scope.combat.rondes = [];
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
        var sectionSuivante = $scope.page.section + 1;
        var pageSuivante = page ? page : ("/pages/" + $scope.page.id + "/" +  sectionSuivante);
        $http.put(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id, JSON.stringify({joueur: $scope.joueur})).then( function () {
            $scope.chargerPage(pageSuivante);
        });
    }
    
    mettreAJourAvancement = function () {
        $http.put(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id, JSON.stringify({avancement: $scope.avancement}));
    }
    
    popUpGuerison = function () {
        if($scope.page.id != 1 
                && $scope.page.section == 1
                && $scope.joueur.disciplines.indexOf("Guérison") > -1 
                && $scope.joueur.endurancePlus < $scope.joueur.enduranceBase
                && localStorage.getItem("guerison") != $scope.page.id
            )
            {
                // Save data to the current local store
                localStorage.setItem("guerison", $scope.page.id);
                alert("Vous disposez de la discipline Guérison : vous gagnez un point d'endurance");
                $scope.joueur.endurancePlus++;
            }
    }
        
    $scope.chargerPage = function (page) {
        $scope.page = {};
        $scope.decisions = [];
        $scope.confirmation = null;
        $scope.combat = null;
        $scope.ajouterObjets = null;
        // Récupération de la page
        $http.get(LOCAL_URL + "/api" + page).then(function(response){
            $scope.page = response.data;
            
            // Pop Up de guérison
            popUpGuerison();
            
             // Mise à jour de l'avancement dans la BDD
            $scope.avancement.pageId = $scope.page.id;
            $scope.avancement.sectionId = $scope.page.section;
            if(!$scope.page.combat) {
                $scope.avancement.combat = [];
            }
            mettreAJourAvancement();

            // Si on a une décision
            if($scope.page.decision) {
                $http.get(LOCAL_URL + $scope.page.decision + "/" + $scope.page.id).then(function(response) {
                    console.log(response.data);
                    for(decision of response.data)
                    {
                        decision.lien = decision.page;
                        var splitLien = decision.page.split("/");
                        decision.page = splitLien[2];
                        decision.section = splitLien[3];
                        $scope.decisions.push(decision);
                    }
                    console.log($scope.decisions);
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
                $scope.combat.rondes = [];
                // Charger un combat depuis l'avancement
                if($scope.avancement.combat.length > 0) {
                    var cnt = 0;
                    for(ronde of $scope.avancement.combat) {
                        var habileteJoueur = ronde.puissancePsychique ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
                       
                        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + ronde.enduranceMonstre + "/" + $scope.combat.habilete + "/" + ronde.chiffreAleatoire ;
                        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde){
                            var enduranceMonstre = $scope.combat.rondes.length > 0 ? $scope.combat.rondes[$scope.combat.rondes.length - 1].enduranceEnnemi : $scope.combat.endurance;
                            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
                            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
                            enduranceMonstre -= ronde.data.degatEnnemi;
                            ronde.data.enduranceEnnemi = enduranceMonstre;
                            $scope.combat.rondes.push(ronde.data);
                            cnt++;
                            if(cnt == $scope.avancement.combat.length) {
                                $scope.combat.defaite = ($scope.combat.rondes[$scope.combat.rondes.length - 1].enduranceJoueur <= 0);
                                $scope.combat.victoire = ($scope.combat.rondes[$scope.combat.rondes.length - 1].enduranceEnnemi <= 0);
                            }
                        });
                    }
                    $scope.combat.fuite = $scope.avancement.combat[$scope.avancement.combat.length - 1].fuite;
                    
                }
                else {
                    $scope.combat.rondes = [];
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
    
    
    $scope.combattre = function (fuite, puissancePsy) {
        // L'endurance du monstre correspond à l'endurance de ce dernier dans la ronde qui précède, ou celle indiqué dans l'objet combat
        var enduranceMonstre = $scope.combat.rondes.length > 0 ? $scope.combat.rondes[$scope.combat.rondes.length - 1].enduranceEnnemi : $scope.combat.endurance;
        // Si le joueur utilise la puissance psy on lui rajoute 2 points d'habileté en plus
        var habileteJoueur = puissancePsy ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
        
        // Appel au WS combat
        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + enduranceMonstre + "/" + $scope.combat.habilete;
        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde) {
            // MAJ des données du joueur 
            // (on rajoute un champ qui correspond à son endurance après perte des points, plus pratique pour l'affichage)
            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
            
            // Si on est pas en situation de fuite, on MAJ les données du monstres
            if(!fuite) {
                enduranceMonstre -= ronde.data.degatEnnemi;
                ronde.data.enduranceEnnemi = enduranceMonstre;
                
                // On vérifie les conditions de victoire et défaite
                $scope.combat.defaite = (ronde.data.enduranceJoueur <= 0);
                $scope.combat.victoire = (ronde.data.enduranceEnnemi <= 0);
            }
            $scope.combat.fuite = fuite;
            
             // Mise à jour de l'avancement du combat dans la BDD
            var rondeCombat = {};
            // Initialization l'objet correspondant au modèle "rondeSchema"
            // (on a rajouté puissancePsy et fuite pour pouvoir restaurer totalement l'état du combat)
            rondeCombat.chiffreAleatoire = ronde.data.chiffreAleatoire;
            rondeCombat.enduranceMonstre = ronde.data.enduranceEnnemi;
            rondeCombat.puissancePsychique = puissancePsy;
            rondeCombat.fuite = fuite;
            // Rajout de la ronde à l'attribut combat de l'objet avancement présent en base
            $scope.avancement.combat.push(rondeCombat);
            // MAJ de l'avancement en base 
            mettreAJourAvancement();
            
            // Remplissage du tableau de rondes
            $scope.combat.rondes = [];
            $scope.combat.rondes.push(ronde.data);
        });
    }
}]);