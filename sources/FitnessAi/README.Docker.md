# FitnessAi Docker setup (Core.Api + MySQL)

This repository includes a Docker Compose stack for:

- `api` (`Core.Api`)
- `mysql` (MySQL 8.4)

## Start the stack

```powershell
docker compose up --build -d
```

## Endpoints

- API (host + LAN): `http://<HOST_IP>:8080`
- MySQL (host + LAN): `<HOST_IP>:3306`

Examples:

- `http://localhost:8080/swagger`
- `http://192.168.x.x:8080/swagger`

## Stop the stack

```powershell
docker compose down
```

To remove containers and also delete database data volume:

```powershell
docker compose down -v
```

## Helper scripts

From `D:\dev\FitnessAi\sources\FitnessAi`:

```powershell
.\scripts\docker\up.ps1
.\scripts\docker\update.ps1
.\scripts\docker\clean.ps1
```

- `up.ps1`: builds (if needed) and starts the compose stack in detached mode.
- `update.ps1`: pulls images and recreates the compose stack with a rebuild.
- `clean.ps1`: removes compose containers, volumes, and images.

Batch wrappers (same folder):

```bat
.\scripts\docker\up.bat
.\scripts\docker\update.bat
.\scripts\docker\clean.bat
```

## Notes

- API listens on `0.0.0.0:8080` in the container.
- Compose injects a container-safe DB connection string (`host=mysql`).
- If LAN clients cannot connect, allow inbound TCP traffic in your OS firewall for ports `8080` and `3306`.
