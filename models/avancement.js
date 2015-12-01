var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rondeSchema = new Schema({
    chiffreAleatoire: Number,
    enduranceMonstre: Number,
    puissancePsychique: Boolean,
    fuite: Boolean
});

var AvancementSchema = new Schema({
    pageId: Number,
    sectionId: Number,
    joueurId: Schema.Types.ObjectId,
    combat: [rondeSchema]
});

module.exports = mongoose.model('Avancement', AvancementSchema);

