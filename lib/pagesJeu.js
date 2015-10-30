var u = require('underscore');

var cheminJeu = [
    { id: 1, next: [ 160, 273 ] },
    { id: 12, next: [ 180, 259 ] },
    { id: 57, next: [ 331 ] },
    { id: 62, next: [ 288 ] },
    { id: 70, next: [ 209, 339 ] },
    { id: 78, next: [ 245 ] },
    { id: 85, next: [ 300 ] },
    { id: 91, next: [ 134 ] },
    { id: 129, next: [ 155 ] },
    { id: 134, next: [ 57, 188, 331 ] },
    { id: 155, next: [ 248, 191 ] },
    { id: 160, next: [ 204, 318, 78 ] },
    { id: 167, next: [ 85, 300 ] },
    { id: 172, next: [ 134 ] },
    { id: 180, next: [ 70, 129 ] },
    { id: 188, next: [ 331 ] },
    { id: 204, next: [ 134 ] },
    { id: 209, next: [ 155 ] },
    { id: 245, next: [ 91, 172  ] },
    { id: 248, next: [] },
    { id: 288, next: [ 167 ] },
    { id: 300, next: [ 12, 238 ] },
    { id: 318, next: [ 134 ] },
    { id: 331, next: [ 62, 288 ] },
    { id: 339, next: [] }
]

var pagesAleatoire = [
    {
        id: 134,
        f: function(joueur) {
            return u.random(0, 9);
        },
        pages: [
            { page: 57, min: 0, max: 3 },
            { page: 188, min: 4, max: 6 },
            { page: 331, min: 7, max: 9 }
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
        pages: [
            { page: 248, min: -2, max: 2 },
            { page: 191, min: 3, max: 10 }
        ]
    },
    {
        id: 167,
        f: function(joueur) {
            return u.random(0, 9);
        },
        pages: [
            { page: 85, min: 0, max: 6 },
            { page: 300, min: 7, max: 9 }
        ]
    },
    {
        id: 331,
        f: function(joueur) {
            return u.random(0, 9);
        },
        pages: [
            { page: 62, min: 0, max: 4 },
            { page: 288, min: 5, max: 9 }
        ]
    }
]

module.exports = {
    cheminJeu: cheminJeu,
    pagesAleatoire: pagesAleatoire
}

// Page aléatoire
// Intervalle d'un chiffre aléatoire
// Si possède une discipline, ajouter 3 au chiffre
// Intervalle. Perte d'endurance entre 0 et 3, sinon mort.
// Si possède huile, ajouter 2 au chiffre. Intervalle.
// Si possède discipline, aller à x. Sinon, deux chemins s'imposent avec chiffre aléatoire.
