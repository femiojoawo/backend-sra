const BASE_URL = 'https://api.sra-hotel.com'

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    try {
      const data = await res.json()
      message = data.detail || data.message || message
    } catch {}
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ---------- Auth ----------
export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  client_id: number
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ---------- Clients ----------
export interface ClientCreate {
  nom: string
  prenom: string
  email: string
  telephone?: string
  password: string
}

export interface ClientRead {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  created_at?: string
}

export interface ClientUpdate {
  nom?: string
  prenom?: string
  telephone?: string
  password?: string
}

export interface ClientReadList {
  items: ClientRead[]
  total: number
  page: number
  limit: number
}

export function createClient(payload: ClientCreate): Promise<ClientRead> {
  return request<ClientRead>('/clients/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getClient(clientId: number, token: string): Promise<ClientRead> {
  return request<ClientRead>(`/clients/${clientId}`, {}, token)
}

export function updateClient(
  clientId: number,
  payload: ClientUpdate,
  token: string,
): Promise<ClientRead> {
  return request<ClientRead>(
    `/clients/${clientId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  )
}

// ---------- Rooms ----------
export interface RoomRead {
  id: number
  nom: string
  type_hebergement: string
  description?: string
  capacite_adultes: number
  capacite_enfants: number
  prix_nuit: number
  note_moyenne?: number
  nb_avis?: number
  photos?: string[]
  statut_menage?: string
}

export interface RoomSearchParams {
  date_arrivee: string
  date_depart: string
  nb_adultes?: number
  nb_enfants?: number
  type_hebergement?: string
}

export function searchRooms(params: RoomSearchParams): Promise<RoomRead[]> {
  const qs = new URLSearchParams({
    date_arrivee: params.date_arrivee,
    date_depart: params.date_depart,
    ...(params.nb_adultes !== undefined ? { nb_adultes: String(params.nb_adultes) } : {}),
    ...(params.nb_enfants !== undefined ? { nb_enfants: String(params.nb_enfants) } : {}),
    ...(params.type_hebergement ? { type_hebergement: params.type_hebergement } : {}),
  })
  return request<RoomRead[]>(`/rooms?${qs.toString()}`)
}

export function getRoomById(id: number): Promise<RoomRead> {
  return request<RoomRead>(`/rooms/${id}`)
}

// ---------- Reservations ----------
// Statuts alignés sur RESERVATION.statut ENUM du schéma DB
export type ReservationStatus = 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE'

// Une ligne de réservation — correspond à RESERVATION_LIGNE
export interface ReservationLigneCreate {
  /** FK → TYPE_CHAMBRE.id (mock: room_id) */
  type_chambre_id: number
  check_in: string
  check_out: string
  adultes: number
  enfants: number
  /** Copie du prix au moment de la réservation */
  prix_unitaire_nuit: number
  /** Calculé : (check_out - check_in) * prix_unitaire_nuit */
  prix_total_ligne: number
  /** Options souscrites pour cette ligne */
  options_souscrites?: { petit_dejeuner?: boolean; transfert?: boolean; spa?: boolean }
}

export interface ReservationLigneRead extends ReservationLigneCreate {
  id: number
  reservation_id: number
}

// Réservation parente — correspond à RESERVATION
export interface ReservationCreate {
  utilisateur_id: number
  contact_nom: string
  contact_email: string
  contact_telephone: string
  demandes_speciales?: string
  lignes: ReservationLigneCreate[]
}

export interface ReservationRead {
  id: number
  utilisateur_id: number
  reference: string
  contact_nom: string
  contact_email: string
  contact_telephone: string
  demandes_speciales?: string
  prix_total: number
  statut: ReservationStatus
  date_creation: string
  lignes?: ReservationLigneRead[]
}

export interface ReservationReadList {
  items: ReservationRead[]
  total: number
  page: number
  limit: number
}

export function createReservation(
  payload: ReservationCreate,
  token: string,
): Promise<ReservationRead> {
  return request<ReservationRead>(
    '/reservations/',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  )
}

export function getReservationsByClient(
  clientId: number,
  token: string,
  page = 1,
  limit = 10,
): Promise<ReservationReadList> {
  return request<ReservationReadList>(
    `/reservations/?utilisateur_id=${clientId}&page=${page}&limit=${limit}`,
    {},
    token,
  )
}

export function cancelReservation(
  reservationId: number,
  token: string,
): Promise<ReservationRead> {
  return request<ReservationRead>(
    `/reservations/${reservationId}`,
    { method: 'PATCH', body: JSON.stringify({ statut: 'ANNULEE' }) },
    token,
  )
}
