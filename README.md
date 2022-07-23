# Eye

Personal self-hosted website aimed to be run on an Olimex Board.

## Install

Install diesel-cli:

```sh
cargo install diesel_cli --no-default-features --features postgres
```

```sh
# edit the .env values as needed
cp .env.example .env

# run migration
diesel migration run

# start api server
cargo run serve
```

Create a new migration:

```sh
diesel migration generate <name-of-migration>
# run migration
diesel migration run
# redo last migration
diesel migration redo
```

## Generate a JWT secret

Run this in your browser

```js
;(() => {
  const GUID_LENGTH = 100
  const bytes = crypto.getRandomValues(new Uint8Array(GUID_LENGTH))
  let output = ``
  for (let i = 0; i < GUID_LENGTH; i++) {
    const code = bytes[i] & 31
    output += String.fromCharCode(code < 10 ? code + 48 : code + 87)
  }
  return output
})()
```

Put the result in the `JWT_SECRET` env variable in `.env`.
Run the server with `cargo run serve --unsafe-no-jwt-checks`, and go to `localhost:3001/admin/jwt_gen#force-admin` to get a valid admin JWT.

## Acknowledgments

- https://github.com/clifinger/canduma: Rust Boilerplate
