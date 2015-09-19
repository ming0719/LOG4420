var express = require('express');
var router = express.Router();

var ARMES_IDS = [
  "Le poignard",
  "La lance",
  "La masse d'armes",
  "Le sabre",
  "Le marteau de guerre",
  "L'épée",
  "La hâche",
  "L'épée",
  "Le bâton",
  "Le glaive",
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./index.jade', { title: 'Lone Wolf : Les Grottes de Katle'});
});

/* GET Reset. */
router.get('/reset', function(req, res, next) {
  res.clearCookie('character');
  res.redirect('/character');
});
  
/* GET character. */
router.get('/character', function(req, res, next) {
  if(req.cookies.character) {
    res.redirect('/jeu');
  }
  var character = {
      habilete: Math.floor(Math.random() * (19 - 10 +1) + 10),
      endurance: Math.floor(Math.random() * (29 - 20 +1) + 20),
      pieces: Math.floor(Math.random() * (19 - 10 +1) + 10),
  };
  res.render("./character.jade", {character: character, title: 'Lone Wolf : Les Grottes de Katle'});  
});

/* POST jeu. */
router.post('/jeu', function(req, res, next) {
  // Les valeurs propres au personnage sont stockées sous forme de variable de session
  var equipement1 = req.body.equipement1.split("|");
  var equipement2 = req.body.equipement2.split("|");
  var arme1, arme2 = null;
  var objSpeciaux = [];
  var sacADos = [];
  
  switch(equipement1[0]){
    case "arme":
      arme1 = equipement1[1];
      break;
    case "objetSpecial":
      objSpeciaux.push(equipement1[1]);
      break;
    case "objetSacADos" :
      sacADos.push(equipement1[1]);
      break;
  }
  switch(equipement2[0]){
    case "arme":
      if(arme1) {
        arme2 = equipement2[1];
      } else {
        arme1 = equipement2[1];
      }
      break;
    case "objetSpecial":
      objSpeciaux.push(equipement2[1]);
      break;
    case "objetSacADos" :
      sacADos.push(equipement2[1]);
      break;
  }
 
  character = req.cookies.character;
  var character = {
      habilete: req.body.habilete,
      endurance: req.body.endurance,
      pieces: req.body.pieces,
      arme1: arme1,
      arme2: arme2,
      sacADos: sacADos,
      objSpeciaux: objSpeciaux,
      disciplines: req.body.discipline,
  };
  
  if(character.disciplines.indexOf('La Maîtrise Des Armes')>=0){
    character.maitriseArme = ARMES_IDS[Math.floor(Math.random() * 10)];
  }
  res.cookie('character', character, { expires: new Date(Date.now() + 86400000), maxAge: 900000, httpOnly: true });
  // Mène à la 1ere page de jeu
  res.redirect('/jeu');
});

/* GET jeu. */
router.get('/jeu', function(req, res, next) {
  var character = req.cookies.character;
  if(!character) {
    res.redirect('/character');
  }
  res.render("./pageJeu.jade", {character: character, title: 'Lone Wolf : Les Grottes de Katle'});
});

/* GET pages de jeu. */
router.get('/jeu/:page', function(req, res, next) {
  var pageNum = req.params.page;
  var page = "pages/page" + pageNum + ".jade";
  console.log(page);
  res.render(page, function(err, html) {
    console.log(err);
    console.log(html);
  	res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html })
  });  
});

/* GET other pages. */
router.get('/:valeur', function(req, res, next) {
  var v = req.params.valeur;
  var page = "./" + v + ".jade";
  res.render(page, function(err, html) {
  	res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html })
  });  
});

module.exports = router;
