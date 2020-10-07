# Sequence Search

## Development

### Requirements
- Docker

### Running the Dev Server
To run the react dev server and proxy requests through to the python Sanic server:
```sh
docker-compose up
# If you have added or removed dependencies in requirements.txt or react_app/package.json
docker-compose up --build
```
The dev server runs on port 3000 bound to the host, visit http://localhost:3000 to launch the app.

### Testing

Will use docker-compose overide to run tests for CI.
Local TSX testing (to take advantage of --watch for simultanious dev) will be done with `docker-compose exec web yarn test`

## Deploy

A deploy target has not been determined, but the images created from `Dockerfile` will, by default, build the react app and serve it statically via Sanic on port 4000.
