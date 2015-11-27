var u = require('underscore');
var c = require('./constantes.js');

var decisionsAleatoire = [
    {
        id: 134,
        f: function() { return u.random(0, 9); },
        decision: [
            { page: "/pages/57/1", min: 0, max: 3, text: "Si vous tirez un chiffre entre 0 et 3," },
            { page: "/pages/188/1", min: 4, max: 6, text: "Entre 4 et 6," },
            { page: "/pages/331/1", min: 7, max: 9, text: "Entre 7 et 9," }
        ]
    },
    {
        id: 155,
        f: function(joueur) {
            var chiffre = u.random(0, 9);
            if (joueur.habilete < 10) {
                chiffre -= 2;
            } else if (joueur.habilete > 20) {
                chiffre += 1;
            }
            return chiffre;
        },
        decision: [
            { page: "/pages/248/1", min: -2, max: 2, text: "Si le total obtenu se situe entre -2 et 2,"},
            { page: "/pages/191/1", min: 3, max: 10, text: "S'il est de 3 à 10," }
        ]
    },
    {
        id: 167,
        f: function() { return u.random(0, 9); },
        decision: [
            { page: "/pages/85/1", min: 0, max: 6, text: "Si vous tirez un chiffre de 0 à 6," },
            { page: "/pages/300/1", min: 7, max: 9, text: "De 7 à 9," }
        ]
    },
    {
        id: 331,
        f: function() { return u.random(0, 9); },
        decision: [
            { page: "/pages/62/1", min: 0, max: 4, text: "Si vous tirez un chiffre entre 0 et 4," },
            { page: "/pages/288/1", min: 5, max: 9, text: "Entre 5 et 9," }
        ]
    }
]

module.exports = {
    decisionsAleatoire: decisionsAleatoire
}

