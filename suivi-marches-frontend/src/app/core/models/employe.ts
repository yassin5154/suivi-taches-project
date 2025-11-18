export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'employe' | 'chefService' | 'admin';
  serviceId: number;
}
