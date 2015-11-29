var express = require('express');
var u = require("underscore");
var fs = require('fs');
var rest = require('restler');
var Joueur = require('../../models/joueur');
var Avancement = require('../../models/avancement');

var constantes = require('../../lib/constantes.js');
var pagesJeu = require('../../lib/pagesJeu.js');

var router = express.Router();

/**
 * Charge un joueur en session.
 * @param id
 */
router.get('/charger/:id', function(req, res) {
    Joueur.findById(req.params.id, function(err, joueur) {
        if (err) {
            res.send(err);
        } else if (joueur) {
            req.session.joueur = joueur;
            res.json(joueur);
        } else {
            res.json({});
        }
    });
});

/**
 * Recupère le joueur en session
 */
router.get('/joueurCourant', function(req, res){
    res.json(req.session.joueur);
});

/**
 * Obtient la représentation du joueur.
 * @param id Id du joueur optionnel
 */
router.get('/:id?', function(req, res) {
    if (req.params.id) {
        Joueur.findById(req.params.id, function(err, joueur) {
            if (err) {
                res.send(err);
            } else if (joueur) {
                res.json(joueur);
            } else {
                res.json({});
            }
        });
    } else {
        Joueur.find({}, function(err, joueurs) {
            if (err) {
                res.send(err);
            } else {
                res.json(joueurs);
            }
        });
    }
});

/**
 * Modifie la représentation du joueur.
 * @param id Id du joueur
 */
router.put('/:id', function(req, res) {
    var id = req.params.id;
    Joueur.findById(id, function(err, joueur) {
        if (err) {
            res.send(err);
        } else {
            var joueurAJour = req.body.joueur;
            joueur.pieceOr = joueurAJour.pieceOr;
            joueur.armes = joueurAJour.pieceOr;
            joueur.objets = joueurAJour.objets;
            joueur.objetsSpeciaux = joueurAJour.objetsSpeciaux;
            joueur.habileteBase = joueurAJour.habileteBase;
            joueur.enduranceBase = joueurAJour.enduranceBase;
            joueur.habiletePlus = joueurAJour.habiletePlus;
            joueur.endurancePlus = joueurAJour.endurancePlus;
            joueur.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({message: "Le joueur a été correctement mis à jour."});
                }
            });
        }
    });
});

/**
 * Supprime un joueur de la BD selon l'ID.
 * @param id Id du joueur
 */
router.delete('/:id', function(req, res) {
    Joueur.remove({ _id: req.params.id }, function(err, joueur) {
        if (err) {
            res.send(err);
        } else {
            Avancement.remove({ joueurId: req.params.id }, function(err, avancement) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({ message: "Le joueur et son avancement ont été correctement supprimé." });
                }
            });
        }
    });
});

/**
 * Obtient l'avancement d'un joueur.
 * @param id Id du joueur
 */
router.get('/avancement/:id', function(req, res) {
    Avancement.findOne({joueurId: req.params.id}, function(err, avancement) {
        if (err) {
            res.send(err);
        } else if (avancement) {
            res.json(avancement);
        } else {
            res.json({});
        }
    });
});

/**
 * Ajoute l'état initial du joueur au commencement de l'histoire.
 */
router.post('/avancement/:joueurId', function(req, res) {
    var avancement = new Avancement;
    avancement.pageId = 1;
    avancement.sectionId = 1;
    avancement.joueurId = req.params.joueurId;
    avancement.save(function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send("L'avancement du joueur " + req.params.joueurId  + " a été correction sauvegardé.");
        }
    });
});

/**
 * Modifie l'état courant du joueur.
 */
router.put('/avancement/:joueurId', function(req, res) {
    Avancement.findOne({joueurId: req.params.joueurId}, function(err, avancement) {
        if (err) {
            res.send(err);
        } else {
            var avancementAJour = req.body.avancement;
            avancement.pageId = avancementAJour.pageId;
            avancement.sectionId = avancementAJour.sectionId;
            avancement.combats = avancementAJour.combats;
            avancement.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({message: "L'avancement du joueur " + req.params.joueurId + " a été correctement mis à jour."});
                }
            });
        }
    });
});

/**
 * Supprime l'état courant du joueur.
 */
router.delete('/avancement/:id', function(req, res) {
    Joueur.remove({ _id: req.params.id }, function(err, joueur) {
        if (err) {
            res.send(err);
        } else {
            Avancement.remove({ joueurId: req.params.id }, function(err, avancement) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({ message: "Le joueur et son avancement ont été correctement supprimé." });
                }
            });
        }
    });
});

module.exports = router;

