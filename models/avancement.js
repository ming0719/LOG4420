var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AvancementSchema   = new Schema({
    pageEnCours: Number,
    idJoueur: String,
    /*
     * On enregistre les rounds du combat en cours (si on est sur une page de combat)
     * afin de pouvoir retrouver le même état de combat si l'utilisateur venait à 
     * fermer le navigateur au milieu du combat.
     * Un round sera représenté ainsi : [ratio, nbAleatoire, endurancePerso, enduranceEnnemi].
     * Grâce à ces informations on sera capable de recalculer le nombre de points perdus 
     * à chaque round
     */
    combatEnCours: Array
});

module.exports = mongoose.model('Avancement', AvancementSchema);