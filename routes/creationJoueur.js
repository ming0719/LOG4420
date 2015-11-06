var express = require('express');
var u = require("underscore");
var constantes = require('../lib/constantes.js');
var Joueur = require('../models/joueur');
var Avancement = require('../models/avancement');
var router = express.Router();

// GET page de création du joueur.
router.get('/creationJoueur', function(req, res, next) {
    res.render('creationJoueur', {
        c: constantes,
        erreursMsg: []
    });
});

// POST page de création du joueur
router.post('/jeu/1', function(req, res) {
    var erreursMsg = [];

    // Récupération des données du formulaire
    var disciplines = (req.body.discipline) ? [].concat(req.body.discipline) : [];
    var armes = (req.body.arme) ? [].concat(req.body.arme) : [];
    var objets = (req.body.objet) ? [].concat(req.body.objet) : [];
    var objetsSpeciaux = (req.body.objetSpecial) ? [].concat(req.body.objetSpecial) : [];

    // Traitement des disciplines choisies
    var NB_DISCIPLINE = 5;
    if (disciplines.length < NB_DISCIPLINE || disciplines.length > NB_DISCIPLINE) {
        erreursMsg.push("Vous devez choisir EXACTEMENT " + NB_DISCIPLINE + " disciplines Kai.");
    }

    // Traitement des armes choisies
    if (!u.contains(disciplines, constantes.discipline.MAITRISE_ARMES) && armes.length > 1) {
        erreursMsg.push("Vous ne pouvez pas choisir une arme si vous ne maîtriser pas la discipline de Maîtrise des Armes.");
    }

    // Traitement des objets choisis
    var NB_OBJET = 2;
    var nbObjetsChoisis = armes.length + objets.length + objetsSpeciaux.length;
    if (nbObjetsChoisis < 2 || nbObjetsChoisis > 2) {
        erreursMsg.push("Vous devez choisir EXACTEMENT " + NB_OBJET + " objets.");
    }

    // S'il y au moins une erreur, on revient à la page de création avec la
    // liste d'erreurs. Sinon, on se dirige vers la 1ere page de l'histoire.
    if (u.isEmpty(erreursMsg)) {
        var joueur = Joueur.creerJoueur({
            disciplines: disciplines,
            armes: armes,
            objets: objets,
            objetsSpeciaux: objetsSpeciaux
        });
        
        var _idJoueur;
        // Sauvegarde le joueur et vérifie s'il y a des erreurs
        joueur.save(function(err, objJoueur) {
            if (err)
            {
                console.log(err);
            }
            console.log("Joueur sauvegardé en base");

            var avancement = new Avancement ({
                idJoueur: objJoueur._id,
                pageCourante: 1,
                combatEnCours: []
            });

            // Sauvegarde l'avancement du joueur et vérifie s'il y a des erreurs
            avancement.save(function(err) {
                if (err)
                {
                    console.log(err);
                }
                console.log("Avancement du joueur sauvegardé en base");
            });

            //Redirection vers la premiere page de jeu
            res.redirect('/jeu/1');
            // On ajoute le joueur dans la session
            req.session.joueur = joueur;
        });

    } else {
        res.render('creationJoueur', {
            c: constantes,
            erreursMsg: erreursMsg
        });
    }
});



module.exports = router;

