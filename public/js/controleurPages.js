function ServicePages($http, $q, myRoutes){
    this.$http = $http;
    this.$q = $q;
    this.myRoutes = myRoutes;
    
    var avancement = null;
    var page = [];
    
    var moi = this;
    
    this.recupererPageActuelle = function(joueur,powerPage, $scope /*to remove*/) {
        return $q(function(resolve, reject) {
            $http.get(myRoutes.avancement + joueur._id).then(function (response) {
                avancement = response.data;
                $scope.avancement = avancement;
                if(page.length == 0 && avancement.sectionId > 1) {
                    chargerPages(1, avancement.sectionId);
                }
                else {
                    powerPage("/pages/" + avancement.pageId + "/" + avancement.sectionId).then(function (result){ 
                        page.push(result.sectionPage);
                        console.log(page);
                    });
                }
                
                function chargerPages(i, maxI) {
                    powerPage("/pages/" + avancement.pageId + "/" + i, false, false).then(function(result){
                        page.push(result.sectionPage);
                        console.log(page);
                        if (i < maxI) {
                            chargerPages(i + 1, maxI);
                        }
                        else if(i == maxI) {
                            powerPage("/pages/" + avancement.pageId + "/" + i).then(function(){
                                moi.avancement = avancement;
                                moi.page = page;
                                resolve({
                                    avancement: avancement,
                                    page: page
                                });
                            });
                        }
                    });
                }
            });
        });
    }
}

app.service('ServicePages', ['$http', '$q', 'myRoutes', ServicePages]);

app.controller('controleurPages', ['$scope', '$q', '$location', '$http', 'myRoutes', 'ServiceJoueur', 'ServicePages',
                                    function($scope, $q, $location, $http, myRoutes, ServiceJoueur, ServicePages) {
    // Représente le joueur
    $scope.joueur = null;
    // Représente l'avancement associé au joueur
    $scope.avancement = null;
    // Représente la page au complet avec ses différentes sections
    $scope.page = [];
    // Représente une section de la page avec son contenu
    $scope.sectionPage = null;
    var LOCAL_URL = myRoutes.root;
    
    // Récupération du joueur et de son avancement en BDD
    ServiceJoueur.joueur().then(function(response) {
        if(response.status == 500) {
            window.location.pathname = "/creationJoueur";
        }
        $scope.joueur = response.data;
        ServicePages.recupererPageActuelle($scope.joueur, $scope.chargerPage, $scope).then(function(result) {
            $scope.avancement = result.avancement;
            $scope.page = result.page;
        });
    });
    
    // MAJ du joueur en BDD
    $scope.mettreAJourJoueur = function (joueur = null, page = null) {
        $scope.sectionPage.lienActif = false;
        $scope.joueur = joueur ? joueur : $scope.joueur;
        var sectionSuivante = $scope.sectionPage.section + 1;
        var pageSuivante = page ? page : ("/pages/" + $scope.sectionPage.id + "/" +  sectionSuivante);
        $http.put(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id, JSON.stringify({joueur: $scope.joueur})).then( function () {
            $scope.chargerPage(pageSuivante).then(function (){ 
                    $scope.page.push($scope.sectionPage);
                    console.log($scope.page);
                });
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
        
    $scope.chargerPage = function (page, reinitialiserAleatoire = false, estCourante = true) {
        return $q(function(resolve, reject) {
            $scope.sectionPage = null;
    
            // Récupération de la page
            $http.get(LOCAL_URL + "/api" + page).then(function(response){
                $scope.sectionPage = response.data
                
                // Mise à jour de l'avancement
                $scope.avancement.pageId = $scope.sectionPage.id;
                $scope.avancement.sectionId = $scope.sectionPage.section;
                if($scope.sectionPage.section == 1 && !$scope.sectionPage.combat) {
                    $scope.avancement.combat = null;
                }
                
                 // Si on est sur le début d'un nouvelle page
                if($scope.sectionPage.section == 1) {
                    // On vide l'objet page
                    $scope.page = [];
                }
                
                // Pop Up de guérison
                popUpGuerison();
                
                // Si on a un ajout objet
                if($scope.sectionPage.ajouterObjets) {
                    $scope.sectionPage.objetsAAjouter = {};
                }
                
                // Si on a un combat
                if($scope.sectionPage.combat) {
                    $scope.joueur.enduranceAvantCombat = $scope.joueur.endurancePlus;
                    $scope.sectionPage.combat.rondes = [];
                    // Charger un combat depuis l'avancement
                    if($scope.avancement.combat && $scope.avancement.combat.rondes.length > 0) {
                        $scope.sectionPage.combat = $scope.avancement.combat;
                        $scope.joueur.endurancePlus = $scope.sectionPage.combat.rondes[$scope.sectionPage.combat.rondes.length - 1].enduranceJoueur;
                    }
                }
 
                // Le lien est activé en fonction de l'état de la section (courante ou non)
                $scope.sectionPage.lienActif = estCourante;
     
                var confirmationFaite = false;
                var decisionsFaite = false;
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
                        $scope.sectionPage.decisions = [];
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
                        // On transforme en booleen (les decisions sont dans $scope.sectionPage.decisions)
                        $scope.sectionPage.decision = true ;
                        
                        $scope.avancement.valeurAleatoire = $scope.sectionPage.decisions[0].valeurAleatoire || null;
                        if(estCourante) {
                            // Mise à jour de l'avancement dans la BDD
                            mettreAJourAvancement();
                        }
                        if(!$scope.sectionPage.confirmation) {
                            resolve({sectionPage: $scope.sectionPage});
                        } else if(confirmationFaite) {
                            resolve({sectionPage: $scope.sectionPage});
                        }
                        decisionsFaite = true;
                    });
                } else if(estCourante) {
                    //$scope.avancement.valeurAleatoire = null;
                    mettreAJourAvancement();
                }
                
                // Si on a une confirmation
                if($scope.sectionPage.confirmation) {
                    $http.get(LOCAL_URL + $scope.sectionPage.confirmation + "/" + $scope.sectionPage.id).then(function(response) {
                        $scope.sectionPage.confirmation = response.data;
                        if(!$scope.sectionPage.decision) {
                            resolve({sectionPage: $scope.sectionPage});
                        } else if(decisionsFaite) {
                            resolve({sectionPage: $scope.sectionPage});
                        }
                        confirmationFaite = true;
                    });
                }
                
                // Si on a bien fini nos requêtes sur décision et confirmation
                if((!$scope.sectionPage.decision && 
                    !$scope.sectionPage.confirmation) ||
                    (confirmationFaite && decisionFaite)) {
                    resolve({sectionPage: $scope.sectionPage});
                }
            });
        });
    }
    
    $scope.mettreAJourObjets = function () {
        Object.keys($scope.sectionPage.objetsAAjouter).forEach(function(key) {
            if($scope.sectionPage.objetsAAjouter[key]) {
                if($scope.sectionPage.ajouterObjets.special) {
                    $scope.joueur.objetsSpeciaux.push(key);
                }
                else {
                    $scope.joueur.objets.push(key);
                }
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
            
            $scope.avancement.combat = $scope.sectionPage.combat;
            if(($scope.sectionPage.combat.victoire || $scope.sectionPage.combat.fuite) && !$scope.sectionPage.combat.defaite)
            {
                $scope.mettreAJourJoueur();
            }
            else {
               // Mise à jour de l'avancement du combat dans la BDD
                mettreAJourAvancement(); 
            }
        });
    }
    
    $scope.supprimerJoueur = function ()
    {
        $http.delete(LOCAL_URL + "/api/joueurs/" + $scope.joueur._id).then(function () {
            window.location.pathname = "/";
        });
    }
}]);