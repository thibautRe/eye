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
use cli_args::Opt;
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
    cli_args::Opt::from_args()
  };

  let pool: Pool = database::pool::establish_connection(opt.clone());
  let jwt_key = JwtKey::from_secret(opt.jwt_secret.as_ref());

  start_server(pool.clone(), opt.clone(), jwt_key.clone()).await
}

async fn start_server(pool: Pool, opt: Opt, jwt_key: JwtKey) -> Result<(), std::io::Error> {
  let host = opt.host.clone();
  let port = opt.port;
  // Server
  let server = HttpServer::new(move || {
    App::new()
      // Database
      .app_data(Data::new(pool.clone()))
      // Options
      .app_data(Data::new(opt.clone()))
      .app_data(Data::new(jwt_key.clone()))
      // Error logging
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
