# Docker Compose Configuration Documentation

## Overview

This `docker-compose.yml` file defines the containerized services for a web application project. It sets up two main services: the application itself and a MongoDB database. The file is designed to orchestrate the deployment of these services in a Docker environment.

## File Structure

```yaml
version: "3.8"

services:
    app:
        # Application service configuration
    mongo:
        # MongoDB service configuration

volumes:
    mongo-data:
```

## Services

### App Service

This service represents the main application.

```yaml
app:
    build: .
    ports:
        - "3000:3000"
    environment:
        - NODE_ENV=production
        - MONGODB_URI=mongodb://mongo:27017/autocode
        - JWT_TOKEN=${JWT_TOKEN}
        - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
        - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
        - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
        - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    depends_on:
        - mongo
```

#### Configuration Details:

-   **build**: Builds the Docker image using the Dockerfile in the current directory.
-   **ports**: Maps port 3000 of the container to port 3000 on the host machine.
-   **environment**: Sets environment variables for the application:
    -   `NODE_ENV`: Set to production mode.
    -   `MONGODB_URI`: Connection string for MongoDB.
    -   Other environment variables are set using Docker's environment variable substitution (${...}).
-   **depends_on**: Ensures that the MongoDB service is started before this service.

### Mongo Service

This service sets up a MongoDB database.

```yaml
mongo:
    image: mongo:latest
    volumes:
        - mongo-data:/data/db
    ports:
        - "27017:27017"
```

#### Configuration Details:

-   **image**: Uses the latest official MongoDB image.
-   **volumes**: Mounts a named volume `mongo-data` to persist database data.
-   **ports**: Maps MongoDB's default port 27017 to the same port on the host.

## Volumes

```yaml
volumes:
    mongo-data:
```

Defines a named volume `mongo-data` for persisting MongoDB data across container restarts.

## Usage in Project Context

Given the project structure, this `docker-compose.yml` file is crucial for:

1. **Development Environment**: Developers can use this to set up a consistent development environment.
2. **Deployment**: It can be used for deploying the application in various environments.
3. **Database Management**: Manages the MongoDB instance required by the application.
4. **Environment Configuration**: Sets up necessary environment variables for the application, including sensitive data like API keys.

## Running the Application

To start the application using this Docker Compose configuration:

1. Ensure Docker and Docker Compose are installed on your system.
2. Navigate to the project directory containing this `docker-compose.yml` file.
3. Run the following command:

    ```
    docker-compose up
    ```

This will build the application image (if not already built) and start both the application and MongoDB services.

## Notes

-   Ensure that all required environment variables (like `JWT_TOKEN`, `STRIPE_SECRET_KEY`, etc.) are properly set in your environment or in a `.env` file before running `docker-compose up`.
-   The application will be accessible at `http://localhost:3000` once the containers are up and running.
-   MongoDB data will persist in the `mongo-data` volume even if the containers are stopped or removed.
