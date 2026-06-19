// ── Mock Reservations ────────────────────────────────────────────────────────
export interface MockReservation {
  id: number
  reference: string
  statut: 'CONFIRMEE' | 'TERMINEE' | 'ANNULEE'
  date_creation: string
  prix_total: number
  contact_nom: string
  contact_email: string
  contact_telephone: string
  demandes_speciales?: string
  lignes: MockReservationLigne[]
}

export interface MockReservationLigne {
  id: number
  chambre_id: number
  chambre_numero: string
  type_chambre: string
  check_in: string
  check_out: string
  adultes: number
  enfants: number
  prix_unitaire_nuit: number
  prix_total_ligne: number
  options_souscrites: { petit_dejeuner?: boolean; transfert?: boolean; spa?: boolean }
  photo: string
}

export const MOCK_RESERVATIONS: MockReservation[] = [
  {
    id: 1,
    reference: 'SRA-20260610-001',
    statut: 'CONFIRMEE',
    date_creation: '2026-06-10T14:32:00',
    prix_total: 290000,
    contact_nom: 'Traoré',
    contact_email: 'client@sra-hotel.com',
    contact_telephone: '+225 07 12 34 56',
    demandes_speciales: 'Chambre haute de préférence, vue jardin si possible.',
    lignes: [
      {
        id: 1,
        chambre_id: 12,
        chambre_numero: '204',
        type_chambre: 'Suite',
        check_in: '2026-07-10',
        check_out: '2026-07-12',
        adultes: 2,
        enfants: 0,
        prix_unitaire_nuit: 130000,
        prix_total_ligne: 260000,
        options_souscrites: { petit_dejeuner: true },
        photo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      },
      {
        id: 2,
        chambre_id: 5,
        chambre_numero: '105',
        type_chambre: 'Chambre Standard',
        check_in: '2026-07-10',
        check_out: '2026-07-10',
        adultes: 1,
        enfants: 0,
        prix_unitaire_nuit: 60000,
        prix_total_ligne: 30000,
        options_souscrites: {},
        photo: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80',
      },
    ],
  },
  {
    id: 2,
    reference: 'SRA-20260520-007',
    statut: 'TERMINEE',
    date_creation: '2026-05-20T09:15:00',
    prix_total: 360000,
    contact_nom: 'Traoré',
    contact_email: 'client@sra-hotel.com',
    contact_telephone: '+225 07 12 34 56',
    lignes: [
      {
        id: 3,
        chambre_id: 18,
        chambre_numero: '301',
        type_chambre: 'Appartement 3 Pièces',
        check_in: '2026-06-01',
        check_out: '2026-06-03',
        adultes: 3,
        enfants: 1,
        prix_unitaire_nuit: 180000,
        prix_total_ligne: 360000,
        options_souscrites: { petit_dejeuner: true, transfert: true },
        photo: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      },
    ],
  },
  {
    id: 3,
    reference: 'SRA-20260401-014',
    statut: 'ANNULEE',
    date_creation: '2026-04-01T11:00:00',
    prix_total: 80000,
    contact_nom: 'Traoré',
    contact_email: 'client@sra-hotel.com',
    contact_telephone: '+225 07 12 34 56',
    lignes: [
      {
        id: 4,
        chambre_id: 7,
        chambre_numero: '112',
        type_chambre: 'Chambre Supérieure',
        check_in: '2026-04-15',
        check_out: '2026-04-16',
        adultes: 2,
        enfants: 0,
        prix_unitaire_nuit: 80000,
        prix_total_ligne: 80000,
        options_souscrites: {},
        photo: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      },
    ],
  },
]

// ── Mock Services (Room Service) ─────────────────────────────────────────────
export interface MockService {
  id: number
  nom: string
  categorie: 'RESTAURATION' | 'SPA' | 'VEHICULE' | 'AUTRE'
  description: string
  prix_unitaire: number
  est_disponible: boolean
  photo: string
}

export const MOCK_SERVICES: MockService[] = [
  {
    id: 1,
    nom: 'Petit-déjeuner Continental',
    categorie: 'RESTAURATION',
    description: 'Viennoiseries fraîches, jus de fruits, café ou thé, fruits tropicaux de saison.',
    prix_unitaire: 8500,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80',
  },
  {
    id: 2,
    nom: 'Menu du Chef — Midi',
    categorie: 'RESTAURATION',
    description: 'Entrée + plat + dessert élaborés par notre chef. Cuisine ivoirienne revisitée.',
    prix_unitaire: 22000,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  },
  {
    id: 3,
    nom: 'Plateau Apéritif',
    categorie: 'RESTAURATION',
    description: 'Assortiment de fromages, charcuteries fines, crackers et crudités.',
    prix_unitaire: 15000,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80',
  },
  {
    id: 4,
    nom: 'Bouteille de Champagne',
    categorie: 'RESTAURATION',
    description: 'Moët & Chandon Brut Impérial, servi frappé avec coupes en cristal.',
    prix_unitaire: 85000,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1584307833174-a3bbb76ab367?w=600&q=80',
  },
  {
    id: 5,
    nom: 'Massage Relaxant 60 min',
    categorie: 'SPA',
    description: 'Massage aux huiles essentielles pour un relâchement total des tensions.',
    prix_unitaire: 45000,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
  },
  {
    id: 6,
    nom: 'Soin Visage Prestige',
    categorie: 'SPA',
    description: 'Soin hydratant et revitalisant avec produits Carita pour un éclat naturel.',
    prix_unitaire: 35000,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
  },
  {
    id: 7,
    nom: 'Transfert Aéroport',
    categorie: 'VEHICULE',
    description: 'Véhicule climatisé avec chauffeur privé. Aéroport Félix Houphouët-Boigny.',
    prix_unitaire: 25000,
    est_disponible: true,
    photo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
  },
  {
    id: 8,
    nom: 'Location Véhicule — Journée',
    categorie: 'VEHICULE',
    description: 'Toyota Land Cruiser avec chauffeur pour visites et déplacements professionnels.',
    prix_unitaire: 120000,
    est_disponible: false,
    photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80',
  },
]

// ── Mock Commandes ────────────────────────────────────────────────────────────
export interface MockCommande {
  id: number
  chambre_numero: string
  service_nom: string
  service_categorie: 'RESTAURATION' | 'SPA' | 'VEHICULE' | 'AUTRE'
  quantite: number
  prix_total_ligne: number
  statut: 'RECUE' | 'EN_PREPARATION' | 'EN_LIVRAISON' | 'VALIDEE'
  date_commande: string
  note?: string
}

export const MOCK_COMMANDES: MockCommande[] = [
  { id: 1, chambre_numero: '204', service_nom: 'Menu du Chef — Midi', service_categorie: 'RESTAURATION', quantite: 2, prix_total_ligne: 44000, statut: 'EN_PREPARATION', date_commande: '2026-06-18T12:05:00', note: 'Sans piment pour l\'un des plats.' },
  { id: 2, chambre_numero: '112', service_nom: 'Petit-déjeuner Continental', service_categorie: 'RESTAURATION', quantite: 1, prix_total_ligne: 8500, statut: 'EN_LIVRAISON', date_commande: '2026-06-18T07:50:00' },
  { id: 3, chambre_numero: '301', service_nom: 'Massage Relaxant 60 min', service_categorie: 'SPA', quantite: 2, prix_total_ligne: 90000, statut: 'RECUE', date_commande: '2026-06-18T14:10:00', note: 'Couple — cabin privée.' },
  { id: 4, chambre_numero: '105', service_nom: 'Bouteille de Champagne', service_categorie: 'RESTAURATION', quantite: 1, prix_total_ligne: 85000, statut: 'VALIDEE', date_commande: '2026-06-18T10:20:00' },
  { id: 5, chambre_numero: '215', service_nom: 'Plateau Apéritif', service_categorie: 'RESTAURATION', quantite: 1, prix_total_ligne: 15000, statut: 'RECUE', date_commande: '2026-06-18T17:30:00' },
]

// ── Mock Chambres (Physical rooms for back-office) ───────────────────────────
export interface MockChambre {
  id: number
  numero: string
  type: string
  etage: number
  statut_menage: 'PROPRE' | 'SALE' | 'EN_COURS' | 'MAINTENANCE'
  est_active: boolean
  occupee: boolean
  client_actuel?: string
}

export const MOCK_CHAMBRES: MockChambre[] = [
  { id: 1,  numero: '101', type: 'Chambre Standard',      etage: 1, statut_menage: 'PROPRE',       est_active: true,  occupee: false },
  { id: 2,  numero: '102', type: 'Chambre Standard',      etage: 1, statut_menage: 'SALE',         est_active: true,  occupee: false },
  { id: 3,  numero: '103', type: 'Chambre Supérieure',    etage: 1, statut_menage: 'PROPRE',       est_active: true,  occupee: true, client_actuel: 'M. Konan' },
  { id: 4,  numero: '104', type: 'Chambre Supérieure',    etage: 1, statut_menage: 'EN_COURS',     est_active: true,  occupee: false },
  { id: 5,  numero: '105', type: 'Chambre Standard',      etage: 1, statut_menage: 'PROPRE',       est_active: true,  occupee: true, client_actuel: 'M. Traoré I.' },
  { id: 6,  numero: '106', type: 'Chambre Twin',          etage: 1, statut_menage: 'MAINTENANCE',  est_active: false, occupee: false },
  { id: 7,  numero: '112', type: 'Chambre Supérieure',    etage: 1, statut_menage: 'PROPRE',       est_active: true,  occupee: true, client_actuel: 'Mme Ouattara' },
  { id: 8,  numero: '201', type: 'Chambre Premium',       etage: 2, statut_menage: 'PROPRE',       est_active: true,  occupee: false },
  { id: 9,  numero: '202', type: 'Chambre Premium',       etage: 2, statut_menage: 'SALE',         est_active: true,  occupee: false },
  { id: 10, numero: '203', type: 'Chambre Twin',          etage: 2, statut_menage: 'PROPRE',       est_active: true,  occupee: false },
  { id: 11, numero: '204', type: 'Suite',                 etage: 2, statut_menage: 'PROPRE',       est_active: true,  occupee: true, client_actuel: 'Mme Traoré I.' },
  { id: 12, numero: '205', type: 'Suite',                 etage: 2, statut_menage: 'EN_COURS',     est_active: true,  occupee: false },
  { id: 13, numero: '215', type: 'Chambre Supérieure',    etage: 2, statut_menage: 'PROPRE',       est_active: true,  occupee: true, client_actuel: 'M. Bamba' },
  { id: 14, numero: '301', type: 'Appartement 3 Pièces',  etage: 3, statut_menage: 'PROPRE',       est_active: true,  occupee: true, client_actuel: 'Famille Koffi' },
  { id: 15, numero: '302', type: 'Appartement 3 Pièces',  etage: 3, statut_menage: 'SALE',         est_active: true,  occupee: false },
  { id: 16, numero: '401', type: 'Appartement 4 Pièces',  etage: 4, statut_menage: 'PROPRE',       est_active: true,  occupee: false },
  { id: 17, numero: '402', type: 'Appartement 4 Pièces',  etage: 4, statut_menage: 'MAINTENANCE',  est_active: false, occupee: false },
]

// ── Mock Arrivées/Départs du jour ─────────────────────────────────────────────
export interface MockArrivee {
  id: number
  reference: string
  client_nom: string
  type_chambre: string
  chambre_attribuee?: string
  check_in: string
  check_out: string
  adultes: number
  enfants: number
  statut_checkin: 'EN_ATTENTE' | 'EFFECTUE'
}

export const MOCK_ARRIVEES: MockArrivee[] = [
  { id: 1, reference: 'SRA-20260618-023', client_nom: 'M. Diallo Sékou',      type_chambre: 'Suite',                 chambre_attribuee: undefined, check_in: '2026-06-18', check_out: '2026-06-20', adultes: 2, enfants: 0, statut_checkin: 'EN_ATTENTE' },
  { id: 2, reference: 'SRA-20260618-024', client_nom: 'Mme Koné Adjoua',      type_chambre: 'Chambre Premium',       chambre_attribuee: '201',     check_in: '2026-06-18', check_out: '2026-06-19', adultes: 1, enfants: 0, statut_checkin: 'EFFECTUE' },
  { id: 3, reference: 'SRA-20260618-025', client_nom: 'Famille N\'Guessan',   type_chambre: 'Appartement 3 Pièces', chambre_attribuee: undefined, check_in: '2026-06-18', check_out: '2026-06-25', adultes: 2, enfants: 3, statut_checkin: 'EN_ATTENTE' },
  { id: 4, reference: 'SRA-20260618-026', client_nom: 'M. Bah Mamadou',       type_chambre: 'Chambre Standard',      chambre_attribuee: '101',     check_in: '2026-06-18', check_out: '2026-06-19', adultes: 1, enfants: 0, statut_checkin: 'EFFECTUE' },
]

export const MOCK_DEPARTS: MockArrivee[] = [
  { id: 5, reference: 'SRA-20260614-018', client_nom: 'M. Sanogo Pierre',     type_chambre: 'Chambre Supérieure',    chambre_attribuee: '103',     check_in: '2026-06-14', check_out: '2026-06-18', adultes: 1, enfants: 0, statut_checkin: 'EFFECTUE' },
  { id: 6, reference: 'SRA-20260615-019', client_nom: 'Mme Touré Hawa',       type_chambre: 'Suite',                 chambre_attribuee: '205',     check_in: '2026-06-15', check_out: '2026-06-18', adultes: 2, enfants: 1, statut_checkin: 'EFFECTUE' },
]
