# Eye

Boilerplate taken from https://github.com/clifinger/canduma.

## Install


Install diesel-cli:

```sh
cargo install diesel_cli --no-default-features --features postgres
```

```sh
# edit the .env values as needed
cp .env.example .env

diesel migration run
cargo run
```