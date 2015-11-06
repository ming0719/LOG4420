var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AvancementSchema = new Schema ({
	idJoueur: String,
	pageCourante: Number,
	combatCourant: Object
});

module.exports = mongoose.model('Avancement', AvancementSchema);