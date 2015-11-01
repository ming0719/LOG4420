var mongoose = require('mongoose');
var constantes = require('../lib/constantes.js');
var Schema = mongoose.Schema;
var u = require("underscore");

var JoueurSchema   = new Schema({
    habilete: Number,
    endurance: Number,
    pieceOr: Number,
    disciplines: Array,
    armes: Array,
    objets: Array,
    objetsSpeciaux: Array
});

JoueurSchema.statics.creerJoueur = function (options)
{
    var disciplines = options.disciplines || [];
    var armes = options.armes || [];
    var objetsSpeciaux = options.objetsSpeciaux || [];
    var objets = options.objets || [];
    
    var habilete = u.random(10, 19);
    var endurance = u.random(20, 29);
    var pieceOr = u.random(10, 19);
    
    /*
     * On calcul les points d'habiletes du joueur en fonction de ses disciplines
     * et de ses objets.
     */
    if (u.contains(disciplines, constantes.discipline.MAITRISE_ARMES) && !u.isEmpty(armes)) {
        habilete += 2;
    } else {
        habilete -= 4;
    }
    
    /*
     * On calcul les points d'endurance du joueur en fonction de ses disciplines
     * et de ses objets.
     */
    if (u.contains(objetsSpeciaux, constantes.objetSpecial.GILET_CUIR_MARTELE)) {
        endurance += 2;
    }
    
    return new this({
        habilete: habilete,
        endurance: endurance,
        pieceOr: pieceOr,
        disciplines: disciplines,
        armes: armes,
        objets: objets,
        objetsSpeciaux: objetsSpeciaux
    });
}


module.exports = mongoose.model('Joueur', JoueurSchema);