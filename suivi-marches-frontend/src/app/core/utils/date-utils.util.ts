export class DateUtils {

  // ✅ Convertir une date au format JJ/MM/AAAA
  static formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // ✅ Calculer le nombre de jours restants avant une deadline
  static daysRemaining(deadline: Date | string): number {
    const today = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); // en jours
  }

  // ✅ Vérifie si une tâche est en retard
  static isLate(deadline: Date | string): boolean {
    const today = new Date();
    const end = new Date(deadline);
    return end.getTime() < today.getTime();
  }

  // ✅ Retourne une couleur selon le nombre de jours restants
  static getDeadlineColor(deadline: Date | string): string {
    const days = this.daysRemaining(deadline);
    if (days <= 0) return 'red';
    if (days <= 3) return 'orange';
    return 'green';
  }
}
