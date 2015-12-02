var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rondeSchema = new Schema({
    chiffreAleatoire: Number,
    quotientAttaque: Number,
    degatEnnemi: Number,
    degatJoueur: Number,
    enduranceEnnemi: Number,
    enduranceJoueur: Number,
});

var AvancementSchema = new Schema({
    pageId: Number,
    sectionId: Number,
    joueurId: Schema.Types.ObjectId,
    combat: {
        defaite: Boolean,
        victoire: Boolean,
        fuite: Boolean,
        rondes: [rondeSchema]
    },
    valeurAleatoire: Number
});

module.exports = mongoose.model('Avancement', AvancementSchema);

