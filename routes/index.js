var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./index.jade', function(err, html) {
  	res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html })
  });
});

/* GET character. */
router.get('/character', function(req, res, next) {
  var character = {
        habilete: Math.floor(Math.random() * (19 - 10 +1) + 10),
        endurance: Math.floor(Math.random() * (29 - 20 +1) + 20),
        pieces: Math.floor(Math.random() * (19 - 10 +1) + 10),
    }
  res.render("./character.jade", {character: character}, function(err, html) {
	 res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html})
	});  
});

/* Post character. */
router.post('/postCharacter', function(req, res, next) {
  // Les valeurs propres au personnage sont stockées sous forme de variable de session
  character = req.cookies.character;
  var character = {
        habilete: req.body.habilete,
        endurance: req.body.endurance,
        pieces: req.body.pieces,
        arme1: req.body.arme,
        arme2: req.body.arme2,
        disciplines: req.body.discipline,
    }
  res.cookie('character', character, { maxAge: 900000, httpOnly: true });
  // Mène à la 1ere page de jeu
  res.render("./page1.jade", {character: character}, function(err, html) {
   res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html})
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
