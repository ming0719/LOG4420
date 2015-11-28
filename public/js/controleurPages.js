app.controller('controleurPages', ['$scope', '$location', '$http', 
                                    function($scope, $location, $http) {
    $scope.joueur = {};
    $scope.avancement = {};
    $scope.page = {};
    $scope.decision = {};
    var LOCAL_URL = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    
    $http.get(LOCAL_URL + "/api/joueurs/joueurCourant").then(function(response) {
        $scope.joueur = response.data;
        $http.get(LOCAL_URL + "/api/joueurs/avancement/" + $scope.joueur._id).then(function (response) {
            $scope.avancement = response.data;
            $scope.chargerPage("/pages/" + $scope.avancement.pageId + "/" + $scope.avancement.sectionId);
        });
    }); 
        
    $scope.chargerPage = function (page){
        $scope.page = {};
        $scope.decision = {};
        $http.get(LOCAL_URL + "/api" + page)
            .then(function(response){
                $scope.page = response.data;
                console.log($scope.page);
                $http.get(LOCAL_URL + $scope.page.decision + "/" + $scope.page.id).then(function(response) {
                    $scope.decision = response.data;
                    console.log($scope.decision);
                    // Si on est dans le cas d'une décision aléatoire
                    /*
                    if($scope.page.decision == "/api/pages/decisionAleatoire"){
                        console.log("Aleatoire");
                        var decisionRetenue;
                        for(i in $scope.decision) {
                            if($scope.decision[i].valid) {
                                decisionRetenue = i;
                                break;
                            }
                        }
                        $scope.decision = [$scope.decision[decisionRetenue]];
                        console.log($scope.decision);
                    }*/
                })
                
            }
        )
    }
}]);