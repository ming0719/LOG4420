var app = angular.module('monApp', []);
var nbObjets = 2;
var nbDisciplines = 5;

app.controller('validationFormulaire', function($scope) {
    $scope.formData = {
        armes: {},
        objetsSpeciaux: {},
        objets: {},
        disciplines: {},
    };
    
    nbArmesChoisies = function() {
        var nbArmesChoisies = 0;
        Object.keys($scope.formData.armes).forEach(function(key) {
            if($scope.formData.armes[key]) {
                nbArmesChoisies++;
            }
        });
        return nbArmesChoisies;
    }
    
    nbObjetsChoisis = function() {
        var nbObjetsChoisis = 0;
        
        Object.keys($scope.formData.objets).forEach(function(key) {
            if($scope.formData.objets[key]) {
                nbObjetsChoisis++;
            }
        });
        
        Object.keys($scope.formData.objetsSpeciaux).forEach(function(key) {
            if($scope.formData.objetsSpeciaux[key]) {
                nbObjetsChoisis++;
            }
        });
        
        nbObjetsChoisis += nbArmesChoisies();
        return nbObjetsChoisis;
    }
    
    nbDisciplinesChoisies = function() {
        var nbDisciplinesChoisies = 0;
        Object.keys($scope.formData.disciplines).forEach(function(key) {
            if($scope.formData.disciplines[key]) {
                nbDisciplinesChoisies++;
            }
        });
        return nbDisciplinesChoisies;
    }
    
    $scope.bloquerFormulaire = function() {
        if($scope.formData.disciplines['MAITRISE_ARMES'] && nbArmesChoisies() == 0)
        {
            return true;
        }
        return !(nbDisciplinesChoisies() == nbDisciplines && nbObjetsChoisis() == nbObjets);
    }
    /*
    $scope.showErrorDisciplines = function() {
        return !(nbDisciplinesChoisies() == nbDisciplines);
    }
    
    $scope.showErrorEquipement = function() {
        return !(nbObjetsChoisis() == nbObjets);
    }
    */
});