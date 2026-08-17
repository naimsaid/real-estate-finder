# Tâche de développement

## Ticket Jira

- Clé : REF-35
- Titre : Rendre fonctionnels les CTA principaux
- Priorité : Medium
- Branche à créer : feature/ref-35

## Description fonctionnelle

Value : Rendre fonctionnels les CTA principaux

## Gestion Git obligatoire

Avant toute modification :

1. Vérifier que le dépôt Git ne contient aucune modification locale.
2. Se positionner sur la branche develop.
3. Exécuter git pull --ff-only origin develop.
4. Créer ou utiliser la branche feature/ref-35.
5. Vérifier que la branche courante est bien feature/ref-35.
6. Ne jamais développer directement sur main ou develop.
7. Ne pas pousser le code sans validation humaine.

## Consignes techniques

1. Analyser l'architecture existante avant toute modification.
2. Respecter les conventions et les dépendances déjà utilisées.
3. Ne modifier que les éléments nécessaires au ticket.
4. Ajouter les tests unitaires nécessaires.
5. Ajouter les tests d'intégration si la fonctionnalité le nécessite.
6. Exécuter la compilation et l'ensemble des tests.
7. Ne pas désactiver un test existant.
8. Documenter les choix techniques importants.
9. Ne pas ajouter de secret ou de donnée sensible dans le dépôt.

## Commandes de validation

Pour Maven sous Windows :

```powershell
mvnw.cmd clean verify
```

Pour Maven sous Linux :

```bash
./mvnw clean verify
```

## Résultat attendu

- Branche utilisée : feature/ref-35
- Fonctionnalité implémentée.
- Tests réussis.
- Aucun secret ajouté au dépôt.
- Résumé des fichiers modifiés.
- Résumé des choix techniques.
- Points restant à valider manuellement.
