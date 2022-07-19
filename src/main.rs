#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

mod api;
mod cli_args;
mod database;
mod errors;
mod jwt;
mod models;
mod schema;

use actix_web::middleware::Logger;
use actix_web::web::Data;
use actix_web::{App, HttpServer};
use cli_args::{Commands, Opt};
use database::Pool;
use jwt::JwtKey;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  // Gets environment variables from `.env`
  dotenv::dotenv().ok();

  // Initiates error logger
  env_logger::init();

  // Sets options to environment variables
  let opt: Opt = {
    use clap::Parser;
    Opt::from_args()
  };

  match opt.command {
    Commands::Serve {
      port,
      host,
      jwt_secret,
      database_url,
    } => {
      let pool: Pool = database::pool::establish_connection(&database_url);
      let jwt_key = JwtKey::from_secret(jwt_secret.as_ref());
      start_server(pool.clone(), jwt_key.clone(), host, port).await
    }
    Commands::ExtractPictures {} => Ok(()),
  }
}

async fn start_server(
  pool: Pool,
  jwt_key: JwtKey,
  host: String,
  port: u16,
) -> Result<(), std::io::Error> {
  let host = host.clone();
  let port = port;
  // Server
  let server = HttpServer::new(move || {
    App::new()
      .app_data(Data::new(pool.clone()))
      .app_data(Data::new(jwt_key.clone()))
      .wrap(Logger::default())
      .configure(api::api_service)
  })
  .bind((host.clone(), port))
  .unwrap()
  .run();

  eprintln!("Listening on {}:{}", host, port);

  // Awaiting server to exit
  server.await
}
