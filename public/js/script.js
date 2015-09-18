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


