# Règles du projet Real Estate Finder

- Utiliser Angular 21, TypeScript strict, composants standalone, signals et SCSS.
- Avant une modification, lire les fichiers directement concernés et réutiliser les conventions existantes.
- Conserver les modèles, services, composants et routes séparés ; ne pas étendre indéfiniment `src/app/app.ts`.
- Écrire ou mettre à jour les tests unitaires de toute logique métier modifiée.
- Avant de terminer une tâche de code, exécuter `npm run test` et `npm run build` et rapporter leurs résultats.
- Ne jamais mettre de clés API, tokens, mots de passe ou données privées dans le code client ou dans Git.
- Demander confirmation avant les actions externes ou irréversibles : déploiement, publication, suppression, migration de données ou installation de dépendances.
- Préférer des changements petits, ciblés et compatibles avec l’architecture existante.
