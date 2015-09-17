document.getElementById('maitrisearmes').addEventListener('click', function() {
    if(document.getElementById('maitrisearmes').checked){
        document.getElementById('valeurmaitrisearmes').disabled = false;
    } 
    else {
        document.getElementById('valeurmaitrisearmes').disabled = true;
    }
})

function getHabilete(){
	Math.floor((Math.random() * 19) + 10);
}
