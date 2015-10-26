exports.disciplines = 
{  
    CAMOUFLAGE: "Le Camouflage",        
    CHASSE: "La Chasse",
    SENS: "Le Sixième Sens",
    ORIENTATION: "L’Orientation",
    GUERISON: "La Guérison",
    MAITRISE_ARMES: "La Maîtrise des Armes",
    BOUCLIER: " Le Bouclier Psychique",
    PUISSANCE: "La Puissance Psychique",
    COMMUNICATION: "La Communication Animale",
    MAITRISE_MATIERE: "La Maîtrise Psychique de la Matière"
};

exports.armes = 
{  
    EPEE: "Epée",        
    SABRE: "Sabre",
    LANCE: "Lance",
    MASSE: "Masse d'Armes",
    MARTEAU: "Marteau de Guerre",
    HACHE: "Hâche",
    BATON: "Bâton",
    GLAIVE: "Glaive",
    POIGNARD: "Poignard"
};

exports.objSpeciaux =
{
    GILET: "Gilet De Cuir Matelassé",
    HUILE: "Huile de Bakanal"
};

exports.objSacADos =
{
    POTION: "Potion de Lampsur",
    RATIONS: "Rations spéciales"
};

// Pour le choix de l'arme pour la discipline Maitrise d'armes
exports.armes_ids = [
  "POIGNARD",
  "LANCE",
  "MASSE",
  "SABRE",
  "MARTEAU",
  "EPEE",
  "HACHE",
  "EPEE",
  "BATON",
  "GLAIVE"
];

// Table de calcul des pertes d'endurance pour les ratios négatifs
exports.tableCombatNegatifs = [
     ["12,0", "11,0", "10,0", "9,0", "8,0", "7,0", "6,0"],
    ["3,5", "2,5", "1,6", "0,6", "0,8", "0,K", "0,K"],
    ["4,4", "3,5", "2,5", "1,6", "0,7", "0,8", "0,K"],
    ["5,4", "4,4", "3,5", "2,5", "1,6", "0,7", "0,8"],
    ["6,3", "5,4", "4,4", "3,5", "2,6", "1,7", "0,8"],
    ["7,2", "6,3", "5,4", "4,4", "3,5", "2,6", "1,7"],
    ["8,2", "7,2", "6,3", "5,4", "4,5", "3,6", "2,6"],
    ["9,1", "8,2", "7,2", "6,3", "5,4", "4,5", "3,5"],
    ["10,0", "9,1", "8,1", "7,2", "6,3", "5,4", "4,4"],
    ["11,0", "10,0", "9,0", "8,0", "7,2", "6,3", "5,3"]
]

exports.tableCombatPositifs = [
    ["12,0", "14,0", "16,0", "18,0", "K,0", "K,0", "K,0"],
    ["3,5", "4,5", "5,4", "6,4", "7,4", "8,3", "9,3"],
    ["4,4", "5,4", "6,3", "7,3", "8,3", "9,3", "10,2"],
    ["5,4", "6,3", "7,3", "8,3", "9,2", "10,2", "11,2"],
    ["6,3", "7,3", "8,2", "9,2", "10,2", "11,2", "12,2"],
    ["7,2", "8,2", "9,2", "10,2", "11,2", "12,2", "14,1"],
    ["8,2", "9,2", "10,2", "11,1", "12,1", "14,1", "16,1"],
    ["9,1", "10,1", "11,1", "12,0", "14,0", "16,0", "18,0"],
    ["10,0", "11,0", "12,0", "14,0", "16,0", "18,0", "K,0"],
    ["11,0", "12,0", "14,0", "16,0", "18,0", "K,0", "K,0"]
]

// Objets comprenant toutes les correspondances page courante/pages accessibles(id et element requis) par numero de page
exports.tableCorrespondancePage = {
    "1": [{id: 160, requis: ""}, {id: 273, requis: ""}],
    "4": [{id: 331, requis: ""}],
    "12": [{id: 180, requis: ""}, {id: 259, requis: ""}],
    "70": [{id: 209, requis: exports.objSpeciaux["HUILE"]}, {id: 339, requis: ""}],
    "78": [{id: 245, requis: ""}],
    "91": [{id: 134, requis: ""}],
    "129": [{id: 155, requis: ""}],
    "134": [{id: 4, requis: ""}, {id: 188, requis: ""}, {id: 331, requis: ""}],
    "155": [{id: 248, requis: ""}, {id: 191, requis: ""}],
    "160": [{id: 78, requis: ""}, {id: 204, requis: exports.disciplines["CHASSE"]}, {id: 318, requis: exports.disciplines["COMMUNICATION"]}],
    "167": [{id: 85, requis: ""}, {id: 300, requis: ""}],
    "172": [{id: 134, requis: ""}],
    "180": [{id: 70, requis: ""}, {id: 129, requis: ""}],
    "204": [{id: 134, requis: ""}],
    "209": [{id: 155, requis: ""}],
    "245": [{id: 91, requis: ""}, {id: 172, requis: ""}],
    "248": [],
    "288": [{id: 167, requis: ""}],
    "300": [{id: 12, requis: ""}, {id: 238, requis: ""}],
    "318": [{id: 134, requis: ""}],
    "331": [{id: 62, requis: ""}, {id: 288, requis: ""}],
    "339": []
};

exports.pagesCombat = {
    "78": {nomAdversaire: "Bakanal", enduranceAdversaire: 30, habileteAdversaire: 19},
    "180": {nomAdversaire: "Languabarb", enduranceAdversaire: 35, habileteAdversaire: 11}
};

// Objet comprenant toutes les page ayant un choix aleatoires avec comme cle le numero de la page.
// Les intervalles sont ordonnee en fonction des pages accessibles prise dans la table de correspondance plus haut,
// donc choixAleatoires["id"].intervalle[0] est l'intervalle pour aller a la page tableCorrespondancePage["id"][0]
// La fonction aleatoire retourne un chiffre aleatoire entre 0 et 9
exports.pagesChoixAleatoires = {
    "134": {fonctionAleatoire: function () { return Math.floor(Math.random() * 10);}, intervalles: [[0, 3], [4, 6], [7, 9]], pages: exports.tableCorrespondancePage["134"]},
    "155": {fonctionAleatoire: function () { return Math.floor(Math.random() * 10);}, intervalles: [[-2, 2], [3, 10]], pages: exports.tableCorrespondancePage["155"]},
    "167": {fonctionAleatoire: function () { return Math.floor(Math.random() * 10);}, intervalles: [[0, 6], [7, 9]], pages: exports.tableCorrespondancePage["167"]},
    "331": {fonctionAleatoire: function () { return Math.floor(Math.random() * 10);}, intervalles: [[0, 4], [5, 9]], pages: exports.tableCorrespondancePage["331"]}
};


