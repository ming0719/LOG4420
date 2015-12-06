function ServiceJoueur($location, $http, $q, mesRoutes, ServicePages) {
    
    var joueur = null;
    
    this.joueur = function() {
        return $q(function(resolve, reject){
            if(joueur) {
                resolve({joueur: joueur});
            } else {
                $http.get(mesRoutes.joueurCourant).then(function(response) {
                    joueur = response.data;
                    resolve({joueur: joueur});
                }, function() {
                    reject("Joueur invalide");
                });
            }
        })
    };
    
    this.majSacADos = function(page, section, objets) {
        return $http.put(mesRoutes.sacADos + page + "/" + section, JSON.stringify({objets: objets}));
    }
    
    // MAJ du joueur en BDD
    this.mettreAJourJoueur = function (lien, joueur) {
        return $q(function(resolve, reject){
            $http.put(mesRoutes.joueur + joueur._id, JSON.stringify({joueur: joueur})).then( function () {
                ServicePages.chargerPage(lien, joueur).then(function (result){
                    resolve({
                        sectionPage: result.sectionPage,
                        avancement: result.avancement,
                        joueur: joueur
                    });
                });
            });
        });
    }
    
    this.supprimerJoueur = function (joueur) {
        return $http.delete(mesRoutes.joueur + joueur._id);
    }
}

app.service('ServiceJoueur', ['$location','$http', '$q', 'mesRoutes','ServicePages', ServiceJoueur]);