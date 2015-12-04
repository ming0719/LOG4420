function ServicePages($http, $q, mesRoutes){
    var avancement = null;
    
    var moi = this;
    
    this.recupererAvancement = function(joueur) {
        return $q(function(resolve, reject) {
            if(avancement) {
                resolve({avancement: avancement});
            } else {
                $http.get(mesRoutes.avancement + joueur._id).then(function(response) {
                   avancement = response.data;
                   resolve({avancement: avancement});
                });
            }
        });
    }
    
    // MAJ de l'avancement en BDD
    this.mettreAJourAvancement = function (joueur, avancement) {
        $http.put(mesRoutes.avancement + joueur._id, JSON.stringify({avancement: avancement})).then(function(response){
            avancement = response.data;
        });
    }
    
    this.recupererPageActuelle = function(joueur) {
        return $q(function(resolve, reject) {
            moi.recupererAvancement(joueur).then(function (result) {
                var page = [];
                var avancement = result.avancement;
                if(avancement.sectionId > 1) {
                    iterationChargerPages(1, avancement.sectionId);
                }
                else {
                    moi.chargerPage("/pages/" + avancement.pageId + "/" + avancement.sectionId, joueur).then(function (result){ 
                        page.push(result.sectionPage);
                        resolve({
                            avancement: avancement,
                            page: page
                        });
                    });
                }
                
                function iterationChargerPages(i, maxI) {
                    moi.chargerPage("/pages/" + avancement.pageId + "/" + i, joueur, false, false).then(function(result){
                        page.push(result.sectionPage);
                        i++;
                        if(i == maxI) {
                            moi.chargerPage("/pages/" + avancement.pageId + "/" + i, joueur).then(function(result){
                                page.push(result.sectionPage);
                                moi.avancement = avancement;
                                moi.page = page;
                                resolve({
                                    avancement: avancement,
                                    page: page
                                });
                            });
                        }
                        else {
                            iterationChargerPages(i, maxI);
                        }
                    });
                }
            });
        });
    }
    
    // Affichage de la pop up guérison
    this.popUpGuerison = function (sectionPage, joueur) {
        if(sectionPage.id != 1 && 
           sectionPage.section == 1 && 
           joueur.disciplines.indexOf("Guérison") > -1 && 
           joueur.endurancePlus < joueur.enduranceBase && 
           localStorage.getItem("guerison") != sectionPage.id)
        {
            // Enregistrement du fait qu'on a déjà appliqué la guérison à cette page
            localStorage.setItem("guerison", sectionPage.id);
            alert("Vous disposez de la discipline Guérison : vous gagnez un point d'endurance");
            
            joueur.endurancePlus++;
        }  
    }
    
    this.chargerPage = function chargerPage(page, joueur, reinitialiserAleatoire = false, estCourante = true) {
        return $q(function(resolve, reject) {
            // Récupération de la page
            $http.get(mesRoutes.api + page).then(function(response) {
                var sectionPage = response.data;
                
                // Pop Up de guérison
                moi.popUpGuerison(sectionPage, joueur);
                
                // Si on a un ajout objet
                if(sectionPage.ajouterObjets) {
                    sectionPage.objetsAAjouter = {};
                }
                
                // Le lien est activé en fonction de l'état de la section (courante ou non)
                sectionPage.lienActif = estCourante;
                
                // Mise à jour de l'avancement
                var avancement = null;
                moi.recupererAvancement(joueur).then(function(result){

                    avancement = result.avancement;
                    avancement.pageId = sectionPage.id;
                    avancement.sectionId = sectionPage.section;
                    if(sectionPage.section == 1 && !sectionPage.combat) {
                        avancement.combat = null;
                    }
                    // Si on a un combat
                    if(sectionPage.combat) {
                        sectionPage.combat.rondes = [];
                        // Charger un combat depuis l'avancement
                        if(avancement.combat && avancement.combat.rondes.length > 0) {
                            sectionPage.combat = avancement.combat;
                            joueur.endurancePlus = sectionPage.combat.rondes[sectionPage.combat.rondes.length - 1].enduranceJoueur;
                        }
                    }
                    
                    if(reinitialiserAleatoire) {
                        avancement.valeurAleatoire = null;
                    }
                    
                    // Si on a une décision
                    if(sectionPage.decision) {
                        sectionPage.decisions = [];
                        var urlDecision = mesRoutes.racine + sectionPage.decision + "/" + sectionPage.id;
                        
                        if(avancement.valeurAleatoire) {
                            urlDecision += "/" + avancement.valeurAleatoire;
                        }
                        $http.get(urlDecision).then(function(response) {
                            // Pour chaque décision, on découpe le lien pour avoir en plus la page et la section à part
                            sectionPage.decisions = [];
                            for(decision of response.data)
                            {
                                decision.lien = decision.page;
                                var splitLien = decision.page.split("/");
                                decision.page = splitLien[2];
                                decision.section = splitLien[3];
                                if(avancement.valeurAleatoire) {
                                    decision.valeurAleatoire = avancement.valeurAleatoire;
                                }
                                sectionPage.decisions.push(decision);
                            }
                            // On transforme en booleen (les decisions sont dans sectionPage.decisions)
                            sectionPage.decision = true ;
                            
                            avancement.valeurAleatoire = sectionPage.decisions[0].valeurAleatoire || null;
                            resolve({sectionPage: sectionPage, avancement: avancement});
                        });
                    }

                    // Si on a une confirmation
                    if(sectionPage.confirmation) {
                        $http.get(mesRoutes.racine + sectionPage.confirmation + "/" + sectionPage.id).then(function(response) {
                            sectionPage.confirmation = response.data;
                            resolve({sectionPage: sectionPage, avancement: avancement});
                        });
                    }
                    
                    // Si on a bien fini nos requêtes sur décision ou confirmation
                    if(!sectionPage.decision && !sectionPage.confirmation) {
                        resolve({sectionPage: sectionPage, avancement: avancement});
                    }
                });
            });
        });
    }
    
    this.combattre = function (lien, joueur, enduranceMonstre, fuite) {
        return $q(function(resolve, reject) {
            $http.get(mesRoutes.combat + lien).then(function(ronde) {
                // MAJ des données du joueur 
                // (on rajoute un champ qui correspond à son endurance après perte des points, plus pratique pour l'affichage)
                joueur.endurancePlus -= ronde.data.degatJoueur;
                if(joueur.endurancePlus < 0) {
                    joueur.endurancePlus = 0;
                }
                ronde.data.enduranceJoueur = joueur.endurancePlus;
                if(!fuite) {
                    ronde.data.enduranceEnnemi = enduranceMonstre - ronde.data.degatEnnemi;
                }
                if(ronde.data.enduranceEnnemi < 0) {
                    ronde.data.enduranceEnnemi = 0;
                }
                resolve({ronde: ronde.data});
            });
        });
    }
}

app.service('ServicePages', ['$http', '$q', 'mesRoutes', ServicePages]);