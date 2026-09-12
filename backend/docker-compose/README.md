# docker-compose (entorno local / demo)

Levanta los 2 microservicios de esta primera entrega junto con sus bases de datos:

- `mysql-productos` (MySQL) + `ms-productos` (FastAPI, puerto 8001)
- `postgres-usuarios` (PostgreSQL) + `ms-usuarios` (Spring Boot, puerto 8002)

## Error de build: `No space left on device` (EC2)

Este error indica que el almacenamiento usado por Docker se quedó sin espacio
o sin inodos. No es un error de compilación Java. Ejecuta en la VM:

```bash
df -h
df -i
docker info --format '{{.DockerRootDir}}'
docker system df
```

Comprueba el filesystem que contiene el directorio de Docker indicado arriba.
Para recuperar espacio de compilaciones anteriores, elimina la caché de build
no utilizada (Docker pedirá confirmación):

```bash
docker builder prune -a
df -h
```

Esto elimina cachés reutilizables, incluyendo dependencias de Maven, que se
descargarán nuevamente. No elimina los volúmenes de MySQL/PostgreSQL.
No uses `docker compose down -v` ni limpiezas de volúmenes para solucionar
este problema: contienen los datos de las bases de datos.

Si el disco sigue lleno, amplía el volumen EBS y luego la partición y el
filesystem dentro de Linux siguiendo la
[guía de AWS](https://docs.aws.amazon.com/ebs/latest/userguide/recognize-expanded-volume-linux.html).
Los nombres de dispositivo y el comando dependen de la VM (`lsblk -f`, `df -hT`);
ampliar solo el volumen en la consola no garantiza que Linux use el espacio nuevo.

Con espacio disponible y los archivos actualizados en la VM, compila los servicios
uno por uno para reducir el consumo simultáneo de recursos:

```bash
cd ~/CloudCommerce/backend/docker-compose
docker compose build ms-usuarios &&
docker compose build ms-productos &&
docker compose up -d --no-build
docker compose ps
```

El Dockerfile de usuarios usa una caché de BuildKit para Maven y compila directamente,
sin la descarga adicional de `dependency:go-offline`. La caché sigue ocupando disco,
pero no se guarda dentro de las capas de la imagen. Los `.dockerignore` excluyen
artefactos locales del contexto de build. Estas medidas reducen espacio utilizado;
no sustituyen disponer de capacidad suficiente para imágenes, caché y bases de datos.

Referencia: [caché de Docker](https://docs.docker.com/build/cache/optimize/).

## Uso

```bash
cd backend/docker-compose
docker compose up -d --build
```

- ms-productos: http://localhost:8001 (docs interactivos en http://localhost:8001/docs)
- ms-usuarios: http://localhost:8002 (swagger en http://localhost:8002/swagger-ui.html)

## Carga masiva de datos (mínimo 20,000 registros)

- **ms-usuarios** se auto-siembra al arrancar (usa `SEED_COUNT`, default 20000) gracias a `DataSeeder`.
- **ms-productos** requiere ejecutar el script una vez:

```bash
docker compose exec ms-productos python -m app.seed
```

## Notas para el despliegue final en AWS

Para la entrega final, este mismo compose se dividirá en:
- `docker-compose.mv1.yml` / `docker-compose.mv2.yml` — microservicios, repartidos entre 2 MV de producción detrás de un balanceador de carga privado.
- `docker-compose.db.yml` — bases de datos, en una 3ra MV privada (no pública).
- Exposición pública de las APIs vía AWS API Gateway (https) apuntando al balanceador.

Por ahora (primera entrega), se usa un solo compose para correr y demostrar los 2 microservicios funcionando.
