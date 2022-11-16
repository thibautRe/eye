# Eye

Personal self-hosted website aimed to be run on an Olimex Board ([OlinuXino A20](https://www.olimex.com/Products/OLinuXino/A20/A20-OLinuXino-MICRO/open-source-hardware)).

## Architecture

The backend of the web service is running a compiled program written in Rust. This language was chosen for its lower memory footprint compared to other interpreted languages such as Python and Javascript. The main libraries used are [Actix](https://actix.rs/) (web server framework) and [Diesel](https://diesel.rs/) (query builder).

The API used to communicate with the web clients is a REST API. Authentication is handled via [JWT](https://jwt.io/).

The frontend of the web service is a TypeScript webapp using the [SolidJS](https://www.solidjs.com/) framework, and bundled using [Vite](https://vitejs.dev/). SolidJS was chosen for its lower network footprint, compared to other frameworks such as React. The styling of the app is handled using [vanilla-extract](https://vanilla-extract.style/) as a CSS-in-JS utility. The color theme is using colors from the [Radix-UI Colors](https://www.radix-ui.com/docs/colors/palette-composition/the-scales) project.

The images placeholders are generated and presented using [Blurhash](https://blurha.sh/).

## Install

Install diesel-cli:

```sh
cargo install diesel_cli --no-default-features --features postgres
```

```sh
# edit the .env values as needed
cp .env.example .env

# run migration
yarn db:migrate

# start api server
yarn start:rs

# start frontend server
yarn start
```

### Create a new migration:

```sh
diesel migration generate <name-of-migration>
# run migration
yarn db:migrate
# redo last migration
yarn db:migrate:redo
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
Run the server with `cargo run serve --unsafe-no-jwt-checks`, and go to `localhost:5750/admin/jwt_gen#force-admin` to get a valid admin JWT and hit the "use" button. You can then restart the cargo server without the flag.
