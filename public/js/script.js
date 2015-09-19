var formCharacter = document.getElementById('formCharacter');
if(formCharacter){
    var checkboxes = formCharacter.querySelectorAll("input[type='checkbox']");
    
    formCharacter.addEventListener("click", function(event){
        if(event.target.tagName == "INPUT" && 
           event.target.type == "checkbox" &&
           event.target.checked) {
            var cpt = 0;
            for(var i = 0 ; i < checkboxes.length ; i++){
                if(checkboxes.item(i).checked){
                    cpt++;
                }
            }
            if(cpt > 5){
                alert('Vous ne pouvez pas choisir plus de 5 disciplines.');
                event.target.checked = false;
            }
        } 
    });

    formCharacter.addEventListener("submit", function(event){
        var cptDisciplines = 0;
        for(var i = 0 ; i < checkboxes.length ; i++){
            if(checkboxes.item(i).checked){
                cptDisciplines++;
            }
        }
        var options = formCharacter.querySelectorAll("select");
         for(var i = 0 ; i < options.length ; i++){
            if(options.item(i).value == ""){
                alert("Vous devez choisir 2 équipements");
                event.preventDefault();
                return;
            }
        }
        
        if(cptDisciplines<5)
        {
            alert("Vous devez choisir 5 disciplines Kaï");
            event.preventDefault();
            return;
        }
    });
}

var combat = document.getElementById("combat");
if(combat) {
    var btnRound = document.getElementById("combatbtn");
    btnRound.disabled = false;
    var endurancePersoInit = endurancePerso = combat.dataset.enduranceperso;
    var enduranceAdversaireInit = enduranceAdversaire = combat.dataset.enduranceadversaire;
    var round = 1;
    btnRound.addEventListener('click', function() {
        var degatsAdversaire = Math.floor(Math.random() * (12 - 5 +1) + 5);
        var degatsPerso = Math.floor(Math.random() * (3 - 1 +1) + 1);
    
        endurancePerso -= degatsPerso;
        enduranceAdversaire -= degatsAdversaire;
        
        if(enduranceAdversaire <= 0) {
            enduranceAdversaire = 0;
            btnRound.disabled = true;
        } 
        if (endurancePerso <= 0) {
            endurancePerso = 0;
            btnRound.disabled = true;
        }
        
        //Création nouveau round
        var thRound = document.createElement("th");
        thRound.appendChild(document.createTextNode("Round n°" + round));
        
        var tdPerso = document.createElement("td");
        tdPerso.appendChild(document.createTextNode(endurancePerso));
        
        var tdAdversaire = document.createElement("td");
        tdAdversaire.appendChild(document.createTextNode(enduranceAdversaire));
        
        var trRound = document.createElement("tr");
        trRound.appendChild(thRound);
        trRound.appendChild(tdPerso);
        trRound.appendChild(tdAdversaire);
        
        document.getElementById("tableau-rounds").appendChild(trRound);
        
        // Mise a jour barres de vie
        var viePerso = document.getElementById("barre-perso").firstChild;
        var vieAdversaire = document.getElementById("barre-adversaire").firstChild;
        
        var proportionPerso = endurancePerso*100/endurancePersoInit;
        var proportionAdversaire = enduranceAdversaire*100/enduranceAdversaireInit;
        viePerso.style.width = proportionPerso + "%";
        vieAdversaire.style.width = proportionAdversaire + "%";
        
        round++;
    })
}