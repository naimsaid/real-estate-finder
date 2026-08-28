# RealEstateFinder

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.13.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Running SonarQube analysis locally

Start a SonarQube instance on `http://localhost:9000` and create the project with the key `real-estate-finder-api`. Then provide a project analysis token and run the Maven scanner from the backend directory:

```bash
cd real-estate-finder-api
export SONAR_TOKEN=<project-analysis-token>
mvn sonar:sonar
```

The SonarQube URL and project key are configured in `real-estate-finder-api/pom.xml`. They can be overridden for another instance with Maven properties, for example `-Dsonar.host.url=https://sonarqube.example.com`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
