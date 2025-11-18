export interface Marche {
  id: number;
  nom: string;
  service: string;
  budget: number;
  dateDebut: Date;
  dateFin: Date;
  etat: 'en attente' | 'en cours' | 'valide' | 'non valide';
}
