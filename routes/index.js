var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./index.jade');
});

/* GET Reset. */
// Supprime le cookie contenant le personnage en cours et la page de jeu dernièrement visitée
// et redirige vers la page de création d'un perso
router.get('/reset', function(req, res, next) {
  req.session.destroy();
  res.redirect('/perso');
});
  
/* GET perso. */
// Formulaire de création d'un perso
router.get('/perso', function(req, res, next) {
  var erreur = req.query.erreur;
  // Les valeurs propres au personnage sont stockées sous forme de cookie
  // Si le cookie existe déjà on redirige vers la page de jeu (avec les infos du joueur déjà crée)
  if(req.session.perso) {
    res.redirect('/jeu');
  }
  // Sinon on initialise les propriétés du perso qui seront en champs cachés dans le formulaire
  var perso = {
      habilete: Math.floor(Math.random() * (19 - 10 +1) + 10),
      endurance: Math.floor(Math.random() * (29 - 20 +1) + 20),
      pieces: Math.floor(Math.random() * (19 - 10 +1) + 10),
  };
  if(erreur == 1)
  {
    res.render("./perso.jade", {perso: perso, erreur: true});
    return;
  }
  res.render("./perso.jade", {perso: perso}); 
});

/* POST jeu. */
// Résultat de la création du personnage : page de jeu
router.post('/jeu', function(req, res, next) {
  // Les valeurs propres au personnage sont stockées sous forme de cookie
  // les valeurs équipement contiennent leur type (arme, objetSacADos, objetSpécial) et leur valeur ce qui permet d'éviter de faire des <select> globaux
  var equipement1 = req.body.equipement1;
  var equipement2 = req.body.equipement2;
  var arme1, arme2 = null;
  var objSpeciaux = [];
  var sacADos = [];
  if(req.body.discipline == null || req.body.discipline.length != 5 || req.body.equipement1 == '' || req.body.equipement2 == '')
  {
    res.redirect('/perso?erreur=1');
    return;
  }
  
  // On place les objets en fonction de leur type
  if(req.app.locals.armes.hasOwnProperty(equipement1))
    arme1 = equipement1;
  else if (req.app.locals.objSpeciaux.hasOwnProperty(equipement1))
    objSpeciaux.push(equipement1);
  else if (req.app.locals.objSacADos.hasOwnProperty(equipement1))
    sacADos.push(equipement1);
  
  if(req.app.locals.armes.hasOwnProperty(equipement2))
    if(arme1 == null)
      arme1 = equipement2;
    else
      arme2 = equipement2;
  else if (req.app.locals.objSpeciaux.hasOwnProperty(equipement2))
    objSpeciaux.push(equipement2);
  else if (req.app.locals.objSacADos.hasOwnProperty(equipement2))
    sacADos.push(equipement2);
    
  // On crée le cookie
  perso = req.session.perso;
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
  if(req.body.discipline && perso.disciplines.indexOf('MAITRISE_ARMES')>=0)
  {
    perso.maitriseArme = req.app.locals.armes_ids[Math.floor(Math.random() * 10)];
    // On vérifie si l'arme désignée par la maîtrise d'arme est une des armes du joueur
    if(perso.maitriseArme == perso.arme1 || perso.maitriseArme == perso.arme2)
    {
      // Si oui, on ajoute 2 points d'habileté
      perso.habilete = parseInt(perso.habilete) + 2;
    }
  }
  // On vérifie si le gilet de cuir a été choisi
  if(perso.objSpeciaux.indexOf('GILET') >= 0)
  {
    // Si oui, on ajoute 2 points d'endurance
    perso.endurance = parseInt(perso.endurance) + 2;
  }
  req.session.perso = perso;
  // Une fois le perso crée, on va à la 1ere page de jeu
  res.redirect('/jeu');
});

/* GET jeu. */
// Page de jeu : première page depuis laquel on a le résumé du perso et où on peut commencer
// la partie ou recréer un personnage
router.get('/jeu', function(req, res, next) {
  var perso = req.session.perso;
  // Si le cookie n'existe pas, on n'a pas de personnage il faut donc en créer un
  if(!perso) {
    res.redirect('/perso');
  }
  // Cookie page actuelle permettant de pouvoir revenir à la dernière page visitée 
  // pendant la partie
  var pageActuelle = req.session.pageActuelle;
  res.render("./pageJeu.jade", { perso: perso, pageActuelle: pageActuelle });
});

/* GET pages de jeu. */
// Les pages de jeu proprement dites
router.get('/jeu/:page', function(req, res, next) {
  var pageNum = req.params.page;
  var page = "pages/page" + pageNum + ".jade";
  var perso = req.session.perso;
  
  if(!perso) {
    res.redirect('/perso');
  }
  req.session.pageActuelle = pageNum;
  // le cookie perso est à la fois envoyé à page en particulier et au template, sinon 
  // impossibilité d'y accèder sur la page de combat (dû à la l'include dans l'include)
  res.render(page, { perso: perso }, function(err, html) {
    res.render('pageJeuTemplate', { perso: perso, pageNum: pageNum, htmlPage: html});
  });  
});

router.get('/jeu/:page/:sousPage', function(req, res, next) {
  var pageNum = req.params.page;
  var sousPage = req.params.sousPage;
  console.log(sousPage);
  var page = "pages/page" + pageNum + "_" + sousPage + ".jade";
  var perso = req.session.perso;
  if(!perso) {
    res.redirect('/perso');
  }
  req.session.pageActuelle = pageNum;
  // le cookie perso est à la fois envoyé à page en particulier et au template, sinon 
  // impossibilité d'y accèder sur la page de combat (dû à la l'include dans l'include)
  res.render(page, { perso: perso }, function(err, html) {
    res.render('pageJeuTemplate', { perso: perso, pageNum: pageNum, htmlPage: html});
  });  
});


/* POST page de jeu. */
// Objets speciaux ammasses au cours du jeu
router.post('/jeu/:page', function(req, res, next) {
  var pageNum = req.params.page;
  var objSpeciaux = req.body.objSpeciaux;
  var objSacADos = req.body.objSacADos;
  
  // On mets les objets speciaux dans un tableau
  if(objSpeciaux) {
    objSpeciaux = objSpeciaux.toString().split(',');
  }

  // On mets les objets du sac a dos dans un tableau
  if(objSacADos) {
    objSacADos = objSacADos.toString().split(',');
  }
  
  var perso = req.session.perso;
  if(!perso) {
    res.redirect('/perso');
  }

  // On ajoute les objets speciaux obtenus a ceux qu'on possede deja
  if (objSpeciaux) {
    objSpeciaux.forEach( function(value) {
        perso.objSpeciaux.push(value);
    });
  }

  // On ajoute les objets sac a dos obtenus a ceux qu'on possede deja
  if (objSacADos) {
    objSacADos.forEach( function(value) {
        perso.sacADos.push(value);
      }
    );
  }
  req.session.perso = perso;
  // Une fois le perso crée, on va à la 1ere page de jeu
  res.redirect('/jeu/' + pageNum);
});

/* GET pages d'aide. */
router.get('/aide/:valeur', function(req, res, next) {
  var v = req.params.valeur;
  var page = "pagesAide/" + v + ".jade";
  res.render(page, function(err, html) {
  	res.render('aideTemplate', {htmlPage: html})
  });  
});

/* WS pour renvoyer le json du perso */
router.get('/persoWS', function(req, res, next) {
  var perso = req.session.perso;
  res.json(perso);
});

/* GET autres pages. */
router.get('/:valeur', function(req, res, next) {
  var v = req.params.valeur;
  var page = "./" + v + ".jade";
  res.render(page);  
});

module.exports = router;
