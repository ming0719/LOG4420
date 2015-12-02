app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    // Représente le joueur
    $scope.joueur = null;
    // Représente l'avancement associé au joueur
    $scope.avancement = null;
    // Représente la page au complet avec ses différentes sections
    $scope.page = [];
    // Représente une section de la page avec son contenu
    $scope.sectionPage = null;
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
        $scope.sectionPage.lienActif = false;
        $scope.joueur = joueur ? joueur : $scope.joueur;
        var sectionSuivante = $scope.sectionPage.section + 1;
        var pageSuivante = page ? page : ("/pages/" + $scope.sectionPage.id + "/" +  sectionSuivante);
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
        if($scope.sectionPage.id != 1 
                && $scope.sectionPage.section == 1
                && $scope.joueur.disciplines.indexOf("Guérison") > -1 
                && $scope.joueur.endurancePlus < $scope.joueur.enduranceBase
                && localStorage.getItem("guerison") != $scope.sectionPage.id
            )
            {
                // Enregistrement du fait qu'on a déjà appliqué la guérison à cette page
                localStorage.setItem("guerison", $scope.sectionPage.id);
                alert("Vous disposez de la discipline Guérison : vous gagnez un point d'endurance");
                $scope.joueur.endurancePlus++;
            }
    }
     
        
    $scope.chargerPage = function (page, reinitialiserAleatoire) {
        $scope.sectionPage = null;
        $scope.decisions = null;
        $scope.confirmation = null;
        $scope.combat = null;
        $scope.ajouterObjets = null;
        // Récupération de la page
        $http.get(LOCAL_URL + "/api" + page).then(function(response){
            $scope.sectionPage = response.data
            
            // Mise à jour de l'avancement dans la BDD
            $scope.avancement.pageId = $scope.sectionPage.id;
            $scope.avancement.sectionId = $scope.sectionPage.section;
            if(!$scope.sectionPage.combat) {
                $scope.avancement.combat = null;
            }
            
             // Si on est sur le début d'un nouvelle page
            if($scope.sectionPage.section == 1) {
                // On vide l'objet page
                $scope.page = [];
            }
            
            // Pop Up de guérison
            popUpGuerison();

            // Si on a une décision
            if($scope.sectionPage.decision) {
                $scope.sectionPage.decisions = [];
                var urlDecision = LOCAL_URL + $scope.sectionPage.decision + "/" + $scope.sectionPage.id;
                if(reinitialiserAleatoire) {
                    $scope.avancement.valeurAleatoire = null;
                }
                if($scope.avancement.valeurAleatoire) {
                    urlDecision += "/" + $scope.avancement.valeurAleatoire;
                }
                $http.get(urlDecision).then(function(response) {
                    // Pour chaque décision, on découpe le lien pour avoir en plus la page et la section à part
                    for(decision of response.data)
                    {
                        decision.lien = decision.page;
                        var splitLien = decision.page.split("/");
                        decision.page = splitLien[2];
                        decision.section = splitLien[3];
                        if($scope.avancement.valeurAleatoire) {
                            decision.valeurAleatoire = $scope.avancement.valeurAleatoire;
                        }
                        $scope.sectionPage.decisions.push(decision);
                    }
                    // On supprime car ce n'est pas sous la forme que l'on veut utiliser
                    delete $scope.sectionPage.decision ;
                    
                    $scope.avancement.valeurAleatoire = $scope.sectionPage.decisions[0].valeurAleatoire || null;
                    mettreAJourAvancement();
                });
            } else {
                $scope.avancement.valeurAleatoire = null;
                mettreAJourAvancement();
            }
            
            // Si on a une confirmation
            if($scope.sectionPage.confirmation) {
                $http.get(LOCAL_URL + $scope.sectionPage.confirmation + "/" + $scope.sectionPage.id).then(function(response) {
                    $scope.sectionPage.confirmation = response.data
                });
            }
            
            // Si on a un ajout objet
            if($scope.sectionPage.ajouterObjets) {
                $scope.sectionPage.objetsAAjouter = {};
            }
            
            // Si on a un combat
            if($scope.sectionPage.combat) {
                $scope.sectionPage.combat.rondes = [];
                // Charger un combat depuis l'avancement
                if($scope.avancement.combat && $scope.avancement.combat.rondes.length > 0) {
                    $scope.sectionPage.combat = $scope.avancement.combat;
                    $scope.joueur.endurancePlus = $scope.sectionPage.combat.rondes[$scope.sectionPage.combat.rondes.length - 1].enduranceJoueur;
                }
            }
            
            $scope.sectionPage.lienActif = true;
            $scope.page.push($scope.sectionPage);
            console.log($scope.sectionPage.decisions)
                       
             
           
            
        });
        console.log($scope.page);
        
    }
    
    $scope.mettreAJourObjets = function () {
        Object.keys($scope.sectionPage.objetsAAjouter).forEach(function(key) {
            if($scope.sectionPage.objetsAAjouter[key]) {
                $scope.joueur.objets.push(key);
            }
        });
        $scope.mettreAJourJoueur();
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

            // Mise à jour de l'avancement du combat dans la BDD
            $scope.avancement.combat = $scope.sectionPage.combat;
            mettreAJourAvancement();
        });
    }
    
    $scope.supprimerJoueur = function ()
    {
        $http.delete(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id).then(function () {
            window.location.pathname = "/";
        });
    }
}]);