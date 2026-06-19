export interface MockRoom {
  id: number
  nom: string
  type_hebergement: string
  description_courte: string
  description_longue: string
  superficie: number
  type_lit: string
  capacite_adultes: number
  capacite_enfants: number
  prix_nuit: number
  note_moyenne: number
  nb_avis: number
  badge?: string
  photos: string[]
  equipements: { categorie: string; items: string[] }[]
  points_forts: string[]
}

export const MOCK_ROOMS: MockRoom[] = [
  {
    id: 1,
    nom: 'Chambre Standard',
    type_hebergement: 'Chambre Standard',
    description_courte: 'Fonctionnelle et soignée, elle offre tout le nécessaire pour un séjour agréable.',
    description_longue:
      "La Chambre Standard du SRA Hotel incarne l'alliance du confort et de la sobriété. Conçue pour les voyageurs qui souhaitent l'essentiel sans compromis sur la qualité, elle propose une literie premium, une salle de bain moderne avec douche à l'italienne et une connexion Wi-Fi haut débit. Sa décoration contemporaine aux tons chauds crée une atmosphère apaisante, idéale après une journée chargée à Abidjan.",
    superficie: 30,
    type_lit: '1 lit Queen size',
    capacite_adultes: 2,
    capacite_enfants: 1,
    prix_nuit: 60000,
    note_moyenne: 4.2,
    nb_avis: 87,
    photos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=85',
      'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1400&q=85',
      'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1400&q=85',
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['Lit Queen size', 'Couette haut de gamme', 'Oreillers mémoire de forme', 'Climatisation'] },
      { categorie: 'Salle de bain', items: ['Douche à l\'italienne', 'Produits de bain Molton Brown', 'Sèche-cheveux', 'Peignoir & chaussons'] },
      { categorie: 'Technologies', items: ['Wi-Fi haut débit', 'TV HD 43"', 'Prises USB', 'Téléphone'] },
      { categorie: 'Mobilier', items: ['Bureau de travail', 'Coffre-fort', 'Réfrigérateur minibar', 'Penderie'] },
    ],
    points_forts: ['Idéale affaires', 'Vue jardin', 'Calme assuré'],
  },
  {
    id: 2,
    nom: 'Chambre Supérieure',
    type_hebergement: 'Chambre Supérieure',
    description_courte: 'Spacieuse et lumineuse, une décoration raffinée pour les séjours d\'affaires.',
    description_longue:
      "La Chambre Supérieure offre un cran supplémentaire d'espace et d'élégance. Sa superficie généreuse accueille un coin bureau parfaitement aménagé et une literie grand confort. La décoration mêle matériaux naturels et touches dorées pour une atmosphère hôtelière distinguée. Idéale pour les cadres en déplacement ou les couples souhaitant un séjour mémorable à Cocody.",
    superficie: 35,
    type_lit: '1 lit Queen size',
    capacite_adultes: 2,
    capacite_enfants: 1,
    prix_nuit: 80000,
    note_moyenne: 4.5,
    nb_avis: 124,
    photos: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1400&q=85',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400&q=85',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['Lit Queen size', 'Couette duvet', 'Oreillers surclassés', 'Climatisation réversible'] },
      { categorie: 'Salle de bain', items: ['Douche à l\'italienne XL', 'Produits de luxe', 'Double vasque', 'Peignoir & chaussons'] },
      { categorie: 'Technologies', items: ['Wi-Fi fibre', 'TV HD 50"', 'Prises USB-C', 'Système son Bluetooth'] },
      { categorie: 'Mobilier', items: ['Bureau ergonomique', 'Fauteuil lounge', 'Coffre-fort', 'Minibar garni'] },
    ],
    points_forts: ['Coin bureau aménagé', 'Lumière naturelle', 'Minibar garni'],
  },
  {
    id: 3,
    nom: 'Chambre Twin',
    type_hebergement: 'Chambre Twin',
    description_courte: 'Deux lits individuels, une même qualité d\'accueil pour les duos.',
    description_longue:
      "La Chambre Twin a été pensée pour les voyageurs en binôme : collègues en déplacement professionnel, amis ou membres d'une famille. Deux lits individuels haut de gamme, un espace optimisé et une ambiance contemporaine et chaleureuse font de cette chambre un choix pratique et confortable. La salle de bain partagée est spacieuse et équipée de produits de soin sélectionnés.",
    superficie: 30,
    type_lit: '2 lits simples',
    capacite_adultes: 2,
    capacite_enfants: 0,
    prix_nuit: 80000,
    note_moyenne: 4.3,
    nb_avis: 56,
    photos: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1400&q=85',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1400&q=85',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['2 lits simples haut de gamme', 'Couettes individuelles', 'Climatisation'] },
      { categorie: 'Salle de bain', items: ['Douche', 'Produits de bain', 'Sèche-cheveux', 'Serviettes premium'] },
      { categorie: 'Technologies', items: ['Wi-Fi haut débit', 'TV HD 43"', 'Prises USB x4'] },
      { categorie: 'Mobilier', items: ['2 bureaux', 'Coffre-fort', 'Réfrigérateur', 'Penderie double'] },
    ],
    points_forts: ['Idéal collègues / amis', '2 espaces de travail', 'Penderie double'],
  },
  {
    id: 4,
    nom: 'Chambre Premium',
    type_hebergement: 'Chambre Premium',
    description_courte: 'Lit king-size, baignoire et douche séparées. Le meilleur des chambres.',
    description_longue:
      "La Chambre Premium représente le summum de notre collection de chambres. Son lit king-size trône au centre d'un espace généreux habillé de matières nobles. La salle de bain avec baignoire îlot et douche à l'italienne séparée crée une expérience spa privative. Pour ceux qui refusent de choisir entre confort et distinction, la Premium s'impose comme une évidence.",
    superficie: 40,
    type_lit: '1 lit King size',
    capacite_adultes: 2,
    capacite_enfants: 1,
    prix_nuit: 120000,
    note_moyenne: 4.8,
    nb_avis: 203,
    badge: 'Best seller',
    photos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&q=85',
      'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=1400&q=85',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1400&q=85',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['Lit King size', 'Matelas Simmons®', 'Couette hiver/été', 'Climatisation silencieuse'] },
      { categorie: 'Salle de bain', items: ['Baignoire îlot', 'Douche à l\'italienne', 'Double vasque', 'Produits Hermès', 'Peignoir & chaussons'] },
      { categorie: 'Technologies', items: ['Wi-Fi fibre', 'TV OLED 55"', 'Système audio Bose', 'Tablette de commande chambre'] },
      { categorie: 'Mobilier', items: ['Bureau premium', 'Fauteuil club', 'Coffre-fort grand format', 'Minibar garni', 'Penderie walk-in'] },
    ],
    points_forts: ['Baignoire îlot', 'TV OLED 55"', 'Produits Hermès', 'Vue piscine'],
  },
  {
    id: 5,
    nom: 'Suite Présidentielle',
    type_hebergement: 'Suite',
    description_courte: 'Un appartement de luxe avec salon privé et salle de bain d\'exception.',
    description_longue:
      "La Suite Présidentielle du SRA Hotel est une expérience à part entière. Avec son salon privé aux canapés en cuir, sa chambre king-size et sa salle de bain grandiose avec baignoire sur pied et douche hammam, elle redéfinit le séjour de luxe à Abidjan. Parfaite pour les voyageurs d'exception, les lunes de miel ou les séjours d'affaires au plus haut niveau.",
    superficie: 85,
    type_lit: '1 lit King size',
    capacite_adultes: 2,
    capacite_enfants: 2,
    prix_nuit: 130000,
    note_moyenne: 4.9,
    nb_avis: 78,
    photos: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=85',
      'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1400&q=85',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1400&q=85',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['Lit King size sur-mesure', 'Matelas Vispring®', 'Couette en duvet d\'oie', 'Climatisation multi-zones'] },
      { categorie: 'Salle de bain', items: ['Baignoire sur pied', 'Douche hammam', 'Double vasque marbre', 'Produits La Prairie', 'Peignoir cachemire'] },
      { categorie: 'Technologies', items: ['Wi-Fi fibre dédiée', 'TV OLED 65"', 'Home cinéma', 'Tablette smart room', 'Enceintes intégrées'] },
      { categorie: 'Espaces', items: ['Salon privé', 'Coin repas', 'Terrasse privative', 'Bar équipé'] },
      { categorie: 'Services', items: ['Majordome dédié', 'Conciergerie 24h/24', 'Petit-déjeuner inclus', 'Transfert aéroport offert'] },
    ],
    points_forts: ['Salon privé', 'Terrasse', 'Majordome', 'Petit-déj inclus'],
  },
  {
    id: 6,
    nom: 'Appartement 3 Pièces',
    type_hebergement: 'Appartement 3 Pièces',
    description_courte: 'Salon, cuisine équipée et deux chambres — l\'autonomie d\'un chez-soi.',
    description_longue:
      "L'Appartement 3 Pièces est conçu pour les familles, les expatriés ou les longs séjours. Deux chambres indépendantes, un salon convivial et une cuisine entièrement équipée offrent l'espace et l'autonomie d'un véritable appartement. La décoration soignée, les matériaux de qualité et les prestations hôtelières complètes en font un choix idéal pour des séjours résidentiels à Cocody.",
    superficie: 130,
    type_lit: '1 King + 1 Queen',
    capacite_adultes: 4,
    capacite_enfants: 2,
    prix_nuit: 180000,
    note_moyenne: 4.6,
    nb_avis: 45,
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&q=85',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=85',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&q=85',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['1 lit King size', '1 lit Queen size', 'Climatisation multi-pièces'] },
      { categorie: 'Cuisine', items: ['Cuisine équipée', 'Réfrigérateur américain', 'Micro-ondes', 'Lave-vaisselle', 'Nespresso'] },
      { categorie: 'Salle de bain', items: ['Salle de bain principale + WC séparé', 'Douche', 'Produits de bain'] },
      { categorie: 'Technologies', items: ['Wi-Fi haut débit', '2 TV HD', 'Prises USB partout'] },
      { categorie: 'Services', items: ['Ménage quotidien', 'Service blanchisserie', 'Conciergerie'] },
    ],
    points_forts: ['Idéal famille', 'Cuisine équipée', 'Long séjour', '130 m²'],
  },
  {
    id: 7,
    nom: 'Appartement 4 Pièces',
    type_hebergement: 'Appartement 4 Pièces',
    description_courte: 'Trois chambres, salon généreux et cuisine pour grandes familles ou équipes.',
    description_longue:
      "L'Appartement 4 Pièces est notre plus grand espace résidentiel. Trois chambres spacieuses, un salon généreux, une cuisine professionnelle et deux salles de bain en font la solution idéale pour les grandes familles, les équipes professionnelles ou les séjours longue durée. Avec 160 m² entièrement meublés et équipés, c'est littéralement un appartement de standing au cœur de l'hôtel.",
    superficie: 160,
    type_lit: '1 King + 2 Queen',
    capacite_adultes: 6,
    capacite_enfants: 3,
    prix_nuit: 180000,
    note_moyenne: 4.7,
    nb_avis: 32,
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=85',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&q=85',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&q=85',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1400&q=85',
    ],
    equipements: [
      { categorie: 'Literie & Confort', items: ['1 lit King size', '2 lits Queen size', 'Climatisation multi-zones'] },
      { categorie: 'Cuisine', items: ['Cuisine professionnelle', 'Réfrigérateur américain', 'Four', 'Lave-vaisselle', '2 Nespresso'] },
      { categorie: 'Salles de bain', items: ['2 salles de bain complètes', '2 WC séparés', 'Baignoire + douche'] },
      { categorie: 'Technologies', items: ['Wi-Fi fibre', '3 TV HD', 'Home cinéma salon', 'Prises USB dans chaque pièce'] },
      { categorie: 'Services', items: ['Ménage quotidien', 'Service blanchisserie', 'Conciergerie 24h/24', 'Parking inclus'] },
    ],
    points_forts: ['160 m²', '3 chambres', '2 salles de bain', 'Parking inclus'],
  },
]

export function getMockRoomById(id: number): MockRoom | undefined {
  return MOCK_ROOMS.find(r => r.id === id)
}
