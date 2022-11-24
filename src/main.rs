#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

mod api;
mod cli_args;
mod database;
mod errors;
mod exif_helpers;
mod extract_pictures;
mod jwt;
mod models;
mod schema;

use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use api::api_routes;
use cli_args::{Commands, Opt, ServeArgs};
use database::Pool;
use extract_pictures::extract_pictures;
use jwt::JwtKey;

type CommandReturn = Result<(), std::io::Error>;

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

  let pool: Pool = database::create_pool(&opt.database_url);
  println!("Db pool initialized");

  match opt.command {
    Commands::Serve(args) => start_server(args, pool).await,
    Commands::ExtractPictures => extract_pictures(opt.extract_from, opt.cache_path, pool),
  }
}

async fn start_server(args: ServeArgs, pool: Pool) -> CommandReturn {
  let jwt_key = JwtKey::from_secret(args.jwt_secret.as_ref());
  let host = args.host.clone();
  let port = args.port;
  // Server
  let server = HttpServer::new(move || {
    App::new()
      .app_data(Data::new(pool.clone()))
      .app_data(Data::new(jwt_key.clone()))
      .app_data(Data::new(args.clone()))
      .wrap(Logger::default())
      .service(actix_files::Files::new("/api/static/", ".eye_cache").show_files_listing())
      .service(api_routes())
  })
  .bind((host.clone(), port))
  .unwrap()
  .run();

  eprintln!("Listening on {}:{}", host, port);

  // Awaiting server to exit
  server.await
}
