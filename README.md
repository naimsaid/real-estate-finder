# Habita — Real Estate Finder

Habita est une application de recherche immobilière permettant de consulter et filtrer des annonces, d'afficher leur détail et leur localisation, de gérer des favoris et des recherches sauvegardées, puis de contacter une agence ou de publier une annonce.

Le dépôt regroupe une interface Angular rendue côté serveur et le socle d'une API Spring Boot.

## Architecture

```text
Navigateur
   │
   ▼
Application Angular 21 / SSR
   ├── pages et composants de présentation
   ├── services (cas d'usage et état local)
   ├── modèles métier
   └── repositories
          └── StaticListingRepository (données simulées)

API Spring Boot 3 (socle indépendant)
   ├── presentation
   ├── application
   ├── domain
   └── infrastructure (configuration et persistance H2)
```

Le frontend suit une séparation par responsabilités : les pages composent l'interface, les composants portent les éléments réutilisables, les services orchestrent les fonctionnalités et les repositories isolent l'accès aux annonces. L'implémentation actuelle utilise des données statiques, ce qui permettra de substituer un repository HTTP sans modifier les composants consommateurs.

Le backend adopte une organisation inspirée de l'architecture en couches. Il fournit actuellement le socle Spring Boot, la persistance JPA et les configurations H2 de développement et de production ; il n'est pas encore connecté au frontend.

## Prérequis

- Node.js 22 ou une version LTS compatible avec Angular 21
- npm 11 (version déclarée : `npm@11.13.0`)
- Java 21 pour le backend
- Maven 3.9+ pour le backend

## Installation et lancement

Installer les dépendances depuis la racine :

```bash
npm install
```

Cette commande installe aussi le hook Git Husky qui contrôle le format des messages de commit.

Lancer le frontend en développement :

```bash
npm start
```

L'application est disponible sur <http://localhost:4200> et se recharge à chaque modification.

Pour lancer le backend avec le profil de développement :

```bash
cd real-estate-finder-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Le profil `dev` utilise une base H2 en mémoire et active sa console. Le profil `prod` utilise par défaut un fichier local et accepte les variables `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` et `DATABASE_DRIVER`.

## Build

Construire le frontend pour la production :

```bash
npm run build
```

Les artefacts navigateur et serveur sont générés dans `dist/real-estate-finder/`. Après le build, lancer le rendu côté serveur avec :

```bash
npm run serve:ssr
```

Construire le backend :

```bash
cd real-estate-finder-api
mvn clean package
```

## Tests et qualité

```bash
npm test              # tests unitaires Vitest en mode interactif
npm run test:ci       # tests unitaires en exécution unique
npm run lint          # analyse ESLint des fichiers TypeScript et HTML
npm run format:check  # vérification Prettier
npm run check         # format, lint, tests et build frontend
```

Les tests frontend couvrent notamment les routes, pages, composants, services, utilitaires et règles d'accessibilité. Le backend configure JaCoCo (seuil global de 80 %), Checkstyle, PMD, SpotBugs, Spotless et SonarQube dans son `pom.xml` ; `mvn verify` exécute les contrôles liés au cycle Maven.

## Structure du projet

```text
.
├── public/                       # ressources statiques et PWA
├── src/
│   ├── app/
│   │   ├── components/           # composants d'interface réutilisables
│   │   ├── data/                 # annonces simulées
│   │   ├── models/               # modèles du domaine frontend
│   │   ├── pages/                # pages associées aux routes
│   │   ├── repositories/         # abstraction de l'accès aux annonces
│   │   ├── services/             # logique applicative et stockage local
│   │   └── utils/                # fonctions utilitaires
│   ├── main.ts                   # point d'entrée navigateur
│   ├── main.server.ts            # configuration du rendu serveur
│   └── server.ts                 # serveur SSR Node/Express
├── real-estate-finder-api/
│   ├── config/checkstyle/         # règles Checkstyle
│   ├── src/main/java/             # application Spring Boot par couches
│   ├── src/main/resources/        # configurations dev et prod
│   └── pom.xml                    # build et qualité backend
├── angular.json                   # configuration Angular CLI
├── eslint.config.js               # règles ESLint
└── package.json                   # scripts et dépendances frontend
```

## Choix techniques

- **Angular 21 et composants standalone** : routage et composition explicites, sans modules applicatifs historiques.
- **SSR Angular** : améliore le premier rendu et l'indexabilité des annonces.
- **TypeScript strict** : sécurise les contrats entre modèles, services et composants.
- **SCSS** : facilite l'organisation des styles globaux et locaux.
- **Vitest, Angular Testing et axe-core** : tests rapides, intégrés à Angular, avec contrôles d'accessibilité.
- **Repository pattern** : découple l'interface de la source de données et prépare l'intégration future de l'API.
- **Spring Boot 3, Java 21, JPA et H2** : socle backend moderne avec persistance légère selon l'environnement.
- **ESLint, Prettier et outils Maven de qualité** : conventions homogènes et contrôles automatisables en intégration continue.

## Convention des commits

Les messages suivent [Conventional Commits](https://www.conventionalcommits.org/) :

```text
<type>(<scope optionnel>)!: <description>
```

Types acceptés : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` et `revert`.

Exemples :

```text
feat(search): add price range filter
fix(favorites): preserve listings after refresh
docs: document local installation
refactor(api)!: change listing response format
```

Le hook `.husky/commit-msg` refuse les messages qui ne respectent pas ce format. Après un clonage, `npm install` active automatiquement Husky via le script `prepare`.
