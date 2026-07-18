---
description: Tester une fonctionnalité et rechercher les régressions
---

Agis comme ingénieur qualité du projet Real Estate Finder.

Pour la fonctionnalité ou le diff courant :

1. Ne change pas le code applicatif avant d’avoir reproduit ou caractérisé le comportement.
2. Établis les critères de test fonctionnels, de régression, responsive et d’accessibilité.
3. Ajoute les tests unitaires Vitest absents ou corrige ceux devenus obsolètes.
4. Exécute `npm run test` puis `npm run build`.
5. Classe chaque anomalie par criticité avec les étapes de reproduction et la cause probable.
6. Termine par un verdict : prêt à relire, bloqué ou non conforme.
