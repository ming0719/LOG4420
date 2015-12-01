app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    // Représente le joueur
    $scope.joueur = null;
    // Représente l'avancement associé au joueur
    $scope.avancement = null;
    // Représente la page avec son contenu
    $scope.page = null;
    // Représente les décisions associées à la page
    $scope.decisions = null;
    // Représente la confrmation associée à la page
    $scope.confirmation = null;
    // Représente l'ensemble des objets à ajouter au sac à dos du joueur
    $scope.objetsAAjouter = null;
    // Représente le combat associé à la page
    $scope.combat = null;
    
    var LOCAL_URL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    
    // Récupération du joueur et de son avancement en BDD
    $http.get(LOCAL_URL + "/api/joueurs/joueurCourant").then(function(response) {
        $scope.joueur = response.data;
        $http.get(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id).then(function (response) {
            $scope.avancement = response.data;
            $scope.chargerPage("/pages/" + $scope.avancement.pageId + "/" + $scope.avancement.sectionId);
        });
    });
    
    // MAJ du joueur en BDD
    $scope.mettreAJourJoueur = function (joueur = null, page = null) {
        $scope.joueur = joueur ? joueur : $scope.joueur;
        var sectionSuivante = $scope.page.section + 1;
        var pageSuivante = page ? page : ("/pages/" + $scope.page.id + "/" +  sectionSuivante);
        $http.put(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id, JSON.stringify({joueur: $scope.joueur})).then( function () {
            $scope.chargerPage(pageSuivante);
        });
    }
    
    // MAJ de l'avancement en BDD
    mettreAJourAvancement = function () {
        $http.put(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id, JSON.stringify({avancement: $scope.avancement}));
    }
    
    // Affichage de la pop up guérison
    popUpGuerison = function () {
        if($scope.page.id != 1 
                && $scope.page.section == 1
                && $scope.joueur.disciplines.indexOf("Guérison") > -1 
                && $scope.joueur.endurancePlus < $scope.joueur.enduranceBase
                && localStorage.getItem("guerison") != $scope.page.id
            )
            {
                // Enregistrement du fait qu'on a déjà appliqué la guérison à cette page
                localStorage.setItem("guerison", $scope.page.id);
                alert("Vous disposez de la discipline Guérison : vous gagnez un point d'endurance");
                $scope.joueur.endurancePlus++;
            }
    }
     
        
    $scope.chargerPage = function (page) {
        $scope.page = null;
        $scope.decisions = null;
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
                $scope.avancement.combat = null;
            }
            mettreAJourAvancement();

            // Si on a une décision
            if($scope.page.decision) {
                $scope.decisions = [];
                $http.get(LOCAL_URL + $scope.page.decision + "/" + $scope.page.id).then(function(response) {
                    // Pour chaque décision, on découpe le lien pour avoir en plus la page et la section à part
                    for(decision of response.data)
                    {
                        decision.lien = decision.page;
                        var splitLien = decision.page.split("/");
                        decision.page = splitLien[2];
                        decision.section = splitLien[3];
                        $scope.decisions.push(decision);
                    }
                });
            }
            
            // Si on a une confirmation
            if($scope.page.confirmation) {
                $http.get(LOCAL_URL + $scope.page.confirmation + "/" + $scope.page.id).then(function(response) {
                    $scope.confirmation = response.data
                });
            }
            
            // Si on a un ajout objet
            if($scope.page.ajouterObjets) {
                $scope.objetsAAjouter = {};
            }
            
            // Si on a un combat
            if($scope.page.combat) {
                $scope.combat = {}; 
                $scope.combat.rondes = [];
                // Charger un combat depuis l'avancement
                if($scope.avancement.combat.rondes.length > 0) {
                    $scope.combat = $scope.avancement.combat;
                    $scope.joueur.endurancePlus = $scope.combat.rondes[$scope.combat.rondes.length - 1].enduranceJoueur;
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
        var enduranceMonstre = $scope.combat.rondes.length > 0 ? $scope.combat.rondes[$scope.combat.rondes.length - 1].enduranceEnnemi : $scope.page.combat.endurance;
        // Si le joueur utilise la puissance psy on lui rajoute 2 points d'habileté en plus
        var habileteJoueur = puissancePsy ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
        
        // Appel au WS combat
        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + enduranceMonstre + "/" + $scope.page.combat.habilete;
        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde) {
            // MAJ des données du joueur 
            // (on rajoute un champ qui correspond à son endurance après perte des points, plus pratique pour l'affichage)
            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
            
            // Si on est pas en situation de fuite, on MAJ les données du monstres
            if(!fuite) {
                enduranceMonstre -= ronde.data.degatEnnemi;
                ronde.data.enduranceEnnemi = enduranceMonstre;
            }
            // On vérifie les conditions de victoire et défaite
            $scope.combat.defaite = (ronde.data.enduranceJoueur <= 0);
            $scope.combat.victoire = (ronde.data.enduranceEnnemi <= 0);
            $scope.combat.fuite = fuite;
            
            // Remplissage du tableau de rondes
            $scope.combat.rondes.push(ronde.data);
            
            // Mise à jour de l'avancement du combat dans la BDD
            $scope.avancement.combat = $scope.combat;
            mettreAJourAvancement();
        });
    }
}]);