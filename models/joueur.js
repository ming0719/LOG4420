var mongoose = require('mongoose');
var constantes = require('../lib/constantes.js');
var Schema = mongoose.Schema;
var u = require("underscore");

var JoueurSchema   = new Schema({
    habileteBase: Number,
    enduranceBase: Number,
    pieceOr: Number,
    disciplines: Array,
    armes: Array,
    objets: Array,
    objetsSpeciaux: Array
});


/**
 * On calcul les points d'habiletes du joueur en fonction de ses disciplines
 * et de ses objets.
 *
 * @param joueur Joueur du jeu
 * @return Joueur avec ses points d'habileté
 */
JoueurSchema.methods.ajouterHabilete = function () {
    if (u.contains(this.disciplines, constantes.discipline.MAITRISE_ARMES) && !u.isEmpty(this.armes)) {
        this.habilete += 2;
    } else {
        this.habilete -= 4;
    }
}

/**
 * On calcul les points d'endurance du joueur en fonction de ses disciplines
 * et de ses objets.
 *
 * @param joueur Joueur du jeu
 * @return Joueur avec ses points d'endurance
 */
JoueurSchema.methods.ajouterEndurance = function () {
    if (u.contains(this.objetsSpeciaux, constantes.objetSpecial.GILET_CUIR_MARTELE)) {
        this.endurance += 2;
    }
}


module.exports = mongoose.model('Joueur', JoueurSchema);