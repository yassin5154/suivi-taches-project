export interface Commentaire {
  id: number;
  contenu: string;
  type: 'urgent' | 'quotidien' | 'informatif';
  auteurId: number;
  tacheId: number;
  date: Date;
}
