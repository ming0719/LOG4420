var express = require('express');
var router = express.Router();

// Pour le choix de l'arme pour la discipline Maitrise d'armes
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
  res.render('./index.jade');
});

/* GET Reset. */
// Supprime le cookie contenant le personnage en cours et la page de jeu dernièrement visitée
// et redirige vers la page de création d'un perso
router.get('/reset', function(req, res, next) {
  res.clearCookie('perso');
  res.clearCookie('pageActuelle');
  res.redirect('/perso');
});
  
/* GET perso. */
// Formulaire de création d'un perso
router.get('/perso', function(req, res, next) {
  // Les valeurs propres au personnage sont stockées sous forme de cookie
  // Si le cookie existe déjà on redirige vers la page de jeu (avec les infos du joueur déjà crée)
  if(req.cookies.perso) {
    res.redirect('/jeu');
  }
  // Sinon on initialise les propriétés du perso qui seront en champs cachés dans le formulaire
  var perso = {
      habilete: Math.floor(Math.random() * (19 - 10 +1) + 10),
      endurance: Math.floor(Math.random() * (29 - 20 +1) + 20),
      pieces: Math.floor(Math.random() * (19 - 10 +1) + 10),
  };
  res.render("./perso.jade", {perso: perso});  
});

/* POST jeu. */
// Résultat de la création du personnage : page de jeu
router.post('/jeu', function(req, res, next) {
  // Les valeurs propres au personnage sont stockées sous forme de cookie
  // les valeurs équipement contiennent leur type (arme, objetSacADos, objetSpécial) et leur valeur ce qui permet d'éviter de faire des <select> globaux
  var equipement1 = req.body.equipement1.split("|");
  var equipement2 = req.body.equipement2.split("|");
  var arme1, arme2 = null;
  var objSpeciaux = [];
  var sacADos = [];
  // On place les objets en fonction de leur type
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
  // On crée le cookie
  perso = req.cookies.perso;
  var perso = {
      habilete: req.body.habilete,
      endurance: req.body.endurance,
      pieces: req.body.pieces,
      arme1: arme1,
      arme2: arme2,
      sacADos: sacADos,
      objSpeciaux: objSpeciaux,
      disciplines: req.body.discipline,
  };
  // On associe l'arme si la discipline maitrise des armes est choisie
  if(perso.disciplines.indexOf('La Maîtrise Des Armes')>=0){
    perso.maitriseArme = ARMES_IDS[Math.floor(Math.random() * 10)];
  }
  res.cookie('perso', perso, { expires: new Date(Date.now() + 86400000), maxAge: 900000, httpOnly: true });
  // Une fois le perso crée, on va à la 1ere page de jeu
  res.redirect('/jeu');
});

/* GET jeu. */
// Page de jeu : première page depuis laquel on a le résumé du perso et où on peut commencer
// la partie ou recréer un personnage
router.get('/jeu', function(req, res, next) {
  var perso = req.cookies.perso;
  // Si le cookie n'existe pas, on n'a pas de personnage il faut donc en créer un
  if(!perso) {
    res.redirect('/perso');
  }
  // Cookie page actuelle permettant de pouvoir revenir à la dernière page visitée 
  // pendant la partie
  var pageActuelle = req.cookies.pageActuelle;
  res.render("./pageJeu.jade", { perso: perso, pageActuelle: pageActuelle });
});

/* GET pages de jeu. */
// Les pages de jeu proprement dites
router.get('/jeu/:page', function(req, res, next) {
  var pageNum = req.params.page;
  var page = "pages/page" + pageNum + ".jade";
  var perso = req.cookies.perso;
  if(!perso) {
    res.redirect('/perso');
  }
  res.cookie('pageActuelle', pageNum, { expires: new Date(Date.now() + 86400000), maxAge: 900000, httpOnly: true });
  // le cookie perso est à la fois envoyé à page en particulier et au template, sinon 
  // impossibilité d'y accèder sur la page de combat (dû à la l'include dans l'include)
  res.render(page, { perso: perso }, function(err, html) {
    res.render('pageJeuTemplate', { perso: perso, pageNum: pageNum, htmlPage: html});
  });  
});

/* GET pages d'aide. */
router.get('/aide/:valeur', function(req, res, next) {
  var v = req.params.valeur;
  var page = "pagesAide/" + v + ".jade";
  res.render(page, function(err, html) {
  	res.render('aideTemplate', {htmlPage: html})
  });  
});

/* GET autres pages. */
router.get('/:valeur', function(req, res, next) {
  var v = req.params.valeur;
  var page = "./" + v + ".jade";
  res.render(page);  
});

module.exports = router;
