
```
docker run --name mypostgres -e POSTGRES_PASSWORD=postgres -d postgres

docker run -it --rm --link mypostgres:postgres postgres psql -h postgres -U postgres
```
