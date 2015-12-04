app.controller('controleurPages', ['$scope', '$q', '$location', '$http', 'mesRoutes', 'ServiceJoueur', 'ServicePages',
                                    function($scope, $q, $location, $http, mesRoutes, ServiceJoueur, ServicePages) {
    // Représente le joueur
    $scope.joueur = null;
    // Représente l'avancement associé au joueur
    $scope.avancement = null;
    // Représente la page au complet avec ses différentes sections
    $scope.page = [];
    
    // Récupération du joueur et de son avancement en BDD
    ServiceJoueur.joueur().then(function(response) {
        $scope.joueur = response.joueur;
        ServicePages.recupererPageActuelle($scope.joueur, $scope).then(function(result) {
            $scope.avancement = result.avancement;
            $scope.page = result.page;
        });
    }, function(response){
        window.location.pathname = "/creationJoueur";
    });
    
    // Changement de page a partir d'une décision
    $scope.accederPageDecision = function (page, reinitialiserAleatoire = false, estCourante = true) {
        ServicePages.chargerPage(page, $scope.joueur, reinitialiserAleatoire, estCourante).then(function(result) {
            var avancement = result.avancement;
            $scope.page = [result.sectionPage];
            ServicePages.mettreAJourAvancement($scope.joueur, avancement);
        });
    }
    
    // Confirmer 
    $scope.confirmer = function(section) {
        section.lienActif = false;
        ServiceJoueur.mettreAJourJoueur(section.confirmation.lien, section.confirmation.joueur).then(function(result){
            $scope.joueur = result.joueur;
            ServicePages.mettreAJourAvancement($scope.joueur, result.avancement);
            if($scope.joueur.endurancePlus <= 0) {
                result.sectionPage.finPartie = true;
            }
            $scope.page.push(result.sectionPage);
        });
    }
    
    // Mise a jour des objets
    $scope.mettreAJourObjets = function (section) {
        section.lienActif = false;
        var objetsAAjouter = section.objetsAAjouter;
        var objets = Object.keys(objetsAAjouter).filter(function(element){
            return objetsAAjouter[element];
        });
        ServiceJoueur.majSacADos(section.id, section.section, objets).then(function(response){
            $scope.joueur = response.data;
            ServicePages.chargerPage(section.ajouterObjets.lien, $scope.joueur).then(function(result) {
                var avancement = result.avancement;
                $scope.page.push(result.sectionPage);
                ServicePages.mettreAJourAvancement($scope.joueur, avancement);
            });
        });
    }
    

    $scope.combattre = function (section, fuite, puissancePsy) {
        // L'endurance du monstre correspond à l'endurance de ce dernier dans la ronde qui précède, ou celle indiqué dans l'objet combat
        var enduranceMonstre = section.combat.rondes.length > 0 ? section.combat.rondes[section.combat.rondes.length - 1].enduranceEnnemi : section.combat.endurance;
        // Si le joueur utilise la puissance psy on lui rajoute 2 points d'habileté en plus
        var habileteJoueur = puissancePsy ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + enduranceMonstre + "/" + section.combat.habilete;
        // Si on est dans le cas d'un combat spécial (p180) on passe le facteur "special" à la requête
        if(section.combat.special) {
            urlCombat += "/" + section.combat.special;
        }
        // Appel au WS combat
        ServicePages.combattre(urlCombat, $scope.joueur, enduranceMonstre, fuite).then(function (result) {
            // On vérifie les conditions de victoire et défaite
            section.combat.defaite = (result.ronde.enduranceJoueur == 0);
            section.combat.victoire = (result.ronde.enduranceEnnemi == 0);
            section.combat.fuite = fuite;
            
            // Remplissage du tableau de rondes
            section.combat.rondes.push(result.ronde);
            $scope.page[$scope.page.length - 1] = section;
            
            $scope.avancement.combat = section.combat;
            // Si combat ou fuite MAJ du joueur et de l'avancement
            if((section.combat.victoire || section.combat.fuite) && !section.combat.defaite) {
                ServiceJoueur.mettreAJourJoueur(section.combat.lien, $scope.joueur).then(function(result) {
                    $scope.page.push(result.sectionPage);
                    $scope.avancement = result.avancement;
                    ServicePages.mettreAJourAvancement($scope.joueur, $scope.avancement); 
                });
            }
            else {
                ServicePages.mettreAJourAvancement($scope.joueur, $scope.avancement);
            }
        });
    }
    
    $scope.supprimerJoueur = function ()
    {
        $http.delete(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id).then(function () {
            window.location.pathname = "/";
        });
    }
    
    /*TODO: detecter mort joueur dans les confirmations*/
}]);