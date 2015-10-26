var express = require('express');
var jade = require('jade');
var fs = require('fs');
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
    if(perso.maitriseArme == perso.arme1 
      || perso.maitriseArme == perso.arme2)
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
router.get('/page/:page', function(req, res, next) {
  var pageNum = req.params.page;

  //Retourne a la page de creation de personnage si le cookie de personnage n'existe pas
  var perso = req.session.perso;
  if(!perso) {
    res.redirect('/perso');
  }
  req.session.pageActuelle = pageNum;

  //Html de l'histoire
  var htmlHistoire;
  //Verifie si le fichier existe
  try {
    htmlHistoire = jade.renderFile("./views/pages/" + pageNum + "/page" + pageNum + "_1" + ".jade", {perso: perso});
  } catch (ex) {
    console.log(ex);
    htmlHistoire = "";
  }

  // Html de la decision
  var htmlDecision;
  //Verifie si le fichier existe
  try {
    htmlDecision = jade.renderFile("./views/pages/" + pageNum + "/page" + pageNum + "_2" + ".jade", {perso: perso});
  } catch (ex) {
    console.log(ex);
    htmlDecision = "";
  }

  //Html complet de la page separer en deux parties (histoire et decision)
  var html = {"1": htmlHistoire, "2": htmlDecision};
  //Info sur les combats provenant des objets javascript
  var infoCombat = req.app.locals.pagesCombat[pageNum];
   //Info sur les acces de pages provenant des objets javascript
  var accesPages = req.app.locals.tableCorrespondancePage[pageNum];

  // On initialise la variable que l'on va retourner en json
  var page = {
    id: pageNum,
    html: html,
    infoCombat: infoCombat,
    accesPages: accesPages
  }

  res.json(page); 
});

/* GET pages de jeu par sous page*/
router.get('/page/:page/:sousPage', function(req, res, next) {
  var pageNum = req.params.page;
  var sousPage = req.params.sousPage;
  console.log(sousPage);
  var perso = req.session.perso;
  if(!perso) {
    res.redirect('/perso');
  }
  req.session.pageActuelle = pageNum;
  // le cookie perso est à la fois envoyé à page en particulier et au template, sinon 
  // impossibilité d'y accèder sur la page de combat (dû à la l'include dans l'include)
  var page = "pages/" + pageNum + "/page" + pageNum + "_" + sousPage + ".jade";
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
  res.redirect('/page/' + pageNum);
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

/* WS pour renvoyer le json du combat */
/* Le personnage doit avoir ete prealablement cree */
router.get('/combat/:habiletePerso/:habileteEnnemi', function(req, res, next) {
  var perso = req.session.perso;
  
  // Les composants du json
  var habiletePerso = Number(req.params.habiletePerso);
  var habileteEnnemi = Number(req.params.habileteEnnemi);
  var ratio;
  var random;
  var pertePerso;
  var perteEnnemi;
  
  var pertesPoints;
  var ratioIndice;

  // On vérifie si le joueur a choisi "La puissance psychique"
  if(perso.disciplines.indexOf('PUISSANCE') >= 0)
  {
    // Si oui, on ajoute 2 points d'habileté
    habiletePerso += 2;
  }
  
  // Calcul du ratio
  ratio = habiletePerso - habileteEnnemi;
  // Génération d'un chiffre aléatoire entre 0 et 9
  random = Math.floor(Math.random() * 10);
  console.log("Perso : " + habiletePerso + " Ennemi : " + habileteEnnemi + " Ratio : " + ratio + " Random : " + random);
  
  // Si le ratio est négatif on cherche à avoir des indices positifs
  if(ratio < 0)
  {
    ratioIndice = ratio - 2 * ratio;
  }
  else
  {
    ratioIndice = ratio;
  }
  
  // On ramène l'indice à 11 pour éviter un dépassement dans le tableau
  if(ratioIndice > 11)
  {
    ratioIndice = 11;
  }
  // Si l'indice modulo 2 == 0 on divise par 2 l'indice pour tomber sur la bonne case du tableau
  // car une case correspond à intervalle de 2 points de ratio
  if(ratio % 2 == 0 && ratio != 0)
  {
    ratioIndice = parseInt(ratioIndice/2);
  }
  // Même problème, on veut faire correspondre avec la bonne case du tableau
  else if(ratio > 1)
  {
    ratioIndice = parseInt(ratioIndice/2)+1;
  }
  
  // On choisit le bon tableau en fonction du signe du ratio
  if(ratio >= 0)
  {
    pertesPoints = req.app.locals.tableCombatPositifs[random][ratioIndice];
    console.log("[" + random + "]" + "[" + ratioIndice + "] = " + pertesPoints);
  }
  else if(ratio < 0)
  {
    pertesPoints = req.app.locals.tableCombatNegatifs[random][ratioIndice];
    console.log("[" + random + "]" + "[" + ratioIndice + "] = " + pertesPoints);
  }
  // Les cases du tableau contiennent des strings avec la perte du perso et de l'ennemi
  // séparées par une virgule, d'où l'utilisation du split
  perteEnnemi = Number(pertesPoints.split(',')[0]);
  pertePerso = Number(pertesPoints.split(',')[1]);
    
  // On initialise la variable que l'on va retourner en json
  var round = {
    habiletePerso: habiletePerso,
    habileteEnnemi: habileteEnnemi,
    ratio: ratio,
    random: random,
    pertePerso: pertePerso,
    perteEnnemi: perteEnnemi
  }

  res.json(round);
});

/* WS pour renvoyer le json du choix aleatoire */
router.get('/choixAleatoire/:page', function(req, res, next) {
  var pageNum = req.params.page;

  var pageChoixAleatoire = req.app.locals.pagesChoixAleatoires[pageNum];

  if (pageChoixAleatoire) {
    var intervalles = pageChoixAleatoire.intervalles;
    var accesPages = pageChoixAleatoire.pages;
    var randomNum = pageChoixAleatoire.fonctionAleatoire();
    var choix = [];

    //Check dans quel intervalle est le numero aleatoire pour le choix de page
    for (var i = 0; i < intervalles.length; i++) {
      if (randomNum >= intervalles[i][0] && randomNum <= intervalles[i][1]) {
        choix = accesPages[i];
      }
    };
  }

  //Creation de la structure du json
  var choixAleatoire = {
    numeroAleatoire: randomNum,
    choixPage: choix
  };

  res.json(choixAleatoire);
});

/* GET autres pages. */
router.get('/:valeur', function(req, res, next) {
  var v = req.params.valeur;
  var page = "./" + v + ".jade";
  res.render(page);  
});

module.exports = router;
