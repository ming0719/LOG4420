var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AvancementSchema = new Schema ({
	idJoueur: String,
	pageCourante: Number,
	combatEnCours: Array
});

module.exports = mongoose.model('Avancement', AvancementSchema);