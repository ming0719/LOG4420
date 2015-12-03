app.controller('controleurPages', ['$scope', '$q', '$location', '$http', 'mesRoutes', 'ServiceJoueur', 'ServicePages',
                                    function($scope, $q, $location, $http, mesRoutes, ServiceJoueur, ServicePages) {
    // Représente le joueur
    $scope.joueur = null;
    // Représente l'avancement associé au joueur
    $scope.avancement = null;
    // Représente la page au complet avec ses différentes sections
    $scope.page = [];
    // Représente une section de la page avec son contenu
    $scope.sectionPage = null;
    
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
        ServiceJoueurs.mettreAJourJoueur(section.confirmation.lien, section.confirmation.joueur).then(function(result){
            $scope.joueur = result.joueur;
            ServicePages.mettreAJourAvancement($scope.joueur, result.avancement);
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
    

    $scope.combattre = function (fuite, puissancePsy) {
        // L'endurance du monstre correspond à l'endurance de ce dernier dans la ronde qui précède, ou celle indiqué dans l'objet combat
        var enduranceMonstre = $scope.sectionPage.combat.rondes.length > 0 ? $scope.sectionPage.combat.rondes[$scope.sectionPage.combat.rondes.length - 1].enduranceEnnemi : $scope.sectionPage.combat.endurance;
        // Si le joueur utilise la puissance psy on lui rajoute 2 points d'habileté en plus
        var habileteJoueur = puissancePsy ? $scope.joueur.habiletePlus + 2 : $scope.joueur.habiletePlus;
        
        // Appel au WS combat
        var urlCombat = $scope.joueur.endurancePlus + "/" + habileteJoueur + "/" + enduranceMonstre + "/" + $scope.sectionPage.combat.habilete;
        // Si on est dans le cas d'un combat spécial (p180) on passe le facteur "special" à la requête
        if($scope.sectionPage.combat.special)
        {
            urlCombat += "/" + $scope.sectionPage.combat.special;
        }
        $http.get(LOCAL_URL + "/api/combat/" + urlCombat).then(function(ronde) {
            // MAJ des données du joueur 
            // (on rajoute un champ qui correspond à son endurance après perte des points, plus pratique pour l'affichage)
            $scope.joueur.endurancePlus -= ronde.data.degatJoueur;
            ronde.data.enduranceJoueur = $scope.joueur.endurancePlus;
            
            // Si on est pas en situation de fuite, on MAJ les données du monstres
            if(!fuite) {
                enduranceMonstre -= ronde.data.degatEnnemi;
            }
            ronde.data.enduranceEnnemi = enduranceMonstre;
            // On vérifie les conditions de victoire et défaite
            $scope.sectionPage.combat.defaite = (ronde.data.enduranceJoueur <= 0);
            $scope.sectionPage.combat.victoire = (ronde.data.enduranceEnnemi <= 0);
            $scope.sectionPage.combat.fuite = fuite;
            
            // Remplissage du tableau de rondes
            $scope.sectionPage.combat.rondes.push(ronde.data);
            
            $scope.avancement.combat = $scope.sectionPage.combat;
            if(($scope.sectionPage.combat.victoire || $scope.sectionPage.combat.fuite) && !$scope.sectionPage.combat.defaite)
            {
                //TODO: $scope.sectionPage.lienActif = false;
                $scope.mettreAJourJoueur();
            }
            else {
               // Mise à jour de l'avancement du combat dans la BDD
/*FIXME*/                mettreAJourAvancement(); 
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