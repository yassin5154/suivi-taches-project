export interface Tache {
  id: number;
  description: string;
  dateLimite: Date;
  duree: number;
  etat: 'en attente' | 'en cours' | 'validee' | 'non validee';
  commentaire: string;
  typeCommentaire: 'urgent' | 'quotidien' | 'informatif';
}
