app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    $scope.joueur = {};
    $scope.avancement = {};
    $scope.page = {};
    $scope.decision = {};
    $scope.confirmation = null;
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
        
    $scope.chargerPage = function (page) {
        $scope.page = {};
        $scope.decision = {};
        $scope.confirmation = null;
        // Récupération de la page
        $http.get(LOCAL_URL + "/api" + page).then(function(response){
            $scope.page = response.data;
            
             // Mise à jour de l'avancement dans la BDD
            $scope.avancement.pageId = $scope.page.id;
            $scope.avancement.sectionId = $scope.page.section;
            // TO DO : Traiter combat
            
            $http.put(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id, JSON.stringify({avancement: $scope.avancement}));
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
        });
    }
}]);