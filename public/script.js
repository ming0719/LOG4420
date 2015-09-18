var formDiscipline = document.querySelector(".form-discipline");

if(formDiscipline){
    formDiscipline.addEventListener("click", function(event){
        if(event.target.tagName == "INPUT" && 
           event.target.type == "checkbox" &&
           event.target.checked) {
            var checkboxes = formDiscipline.querySelectorAll("input[type='checkbox']");
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
}