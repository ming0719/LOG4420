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
    GILET: "Gilet De Cuir Matelassé"
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