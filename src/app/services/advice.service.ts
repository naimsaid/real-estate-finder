import { Injectable } from '@angular/core';
import { Advice } from '../models/advice';

const ADVICE: Advice[] = [
  { category: 'Bien acheter', title: 'Les 6 étapes pour préparer votre achat immobilier', description: 'Définissez votre budget, anticipez les frais et organisez vos visites avec une méthode simple.', readingTime: '6 min de lecture', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80' },
  { category: 'Location', title: 'Constituer un dossier locataire solide', description: 'Les documents à prévoir et les bonnes pratiques pour présenter un dossier clair et complet.', readingTime: '4 min de lecture', image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80' },
  { category: 'Investissement', title: 'Évaluer le potentiel d’un quartier', description: 'Transports, services, demande locative : les indicateurs qui vous aident à choisir sereinement.', readingTime: '7 min de lecture', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80' },
];

@Injectable({ providedIn: 'root' })
export class AdviceService {
  getAdvice(): Advice[] {
    return ADVICE.map((article) => ({ ...article }));
  }
}
