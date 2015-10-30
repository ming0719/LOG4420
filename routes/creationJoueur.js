var express = require('express');
var u = require("underscore");
var constantes = require('../lib/constantes.js')
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
        var joueur = {
            habileteBase: u.random(10, 19),
            enduranceBase: u.random(20, 29),
            pieceOr: u.random(10, 19),
            disciplines: disciplines,
            armes: armes,
            objets: objets,
            objetsSpeciaux: objetsSpeciaux
        };
        joueur = ajouterHabilete(joueur);
        joueur = ajouterEndurance(joueur);

        // On ajoute le joueur dans la session
        req.session.joueur = joueur;
        res.redirect('/jeu/1');
    } else {
        res.render('creationJoueur', {
            c: constantes,
            erreursMsg: erreursMsg
        });
    }
});


/**
 * On calcul les points d'habiletes du joueur en fonction de ses disciplines
 * et de ses objets.
 *
 * @param joueur Joueur du jeu
 * @return Joueur avec ses points d'habileté
 */
function ajouterHabilete(joueur) {
    var joueurCopie = u.clone(joueur);
    if (u.contains(joueurCopie.disciplines, constantes.discipline.MAITRISE_ARMES) && !u.isEmpty(joueurCopie.armes)) {
        joueurCopie.habilete = joueurCopie.habileteBase + 2;
    } else {
        joueurCopie.habilete = joueurCopie.habileteBase - 4;
    }
    return joueurCopie;
}

/**
 * On calcul les points d'endurance du joueur en fonction de ses disciplines
 * et de ses objets.
 *
 * @param joueur Joueur du jeu
 * @return Joueur avec ses points d'endurance
 */
function ajouterEndurance(joueur) {
    var joueurCopie = u.clone(joueur);
    if (u.contains(joueur.objetsSpeciaux, constantes.objetSpecial.GILET_CUIR_MARTELE)) {
        joueurCopie.endurance = joueurCopie.enduranceBase + 2;
    } else {
        joueurCopie.endurance = joueurCopie.enduranceBase;
    }
    return joueurCopie;
}

module.exports = router;

