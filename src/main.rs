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

use std::path::Path;

use actix_web::middleware::Logger;
use actix_web::web::Data;
use actix_web::{App, HttpServer};
use chrono::NaiveDateTime;
use cli_args::{Commands, ExtractPicturesArgs, Opt, ServeArgs};
use database::Pool;
use diesel::{insert_into, RunQueryDsl};
use image::imageops::FilterType;
use jwt::JwtKey;
use walkdir::WalkDir;

use crate::models::picture::PicturesInsert;

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
    Commands::ExtractPictures(args) => extract_pictures(args, pool),
  }
}

/// Filter pictures (JPG files)
fn is_picture_file(file: &walkdir::DirEntry) -> bool {
  file.file_type().is_file()
    && file.file_name().to_str().map_or(false, |f| {
      f.to_lowercase().ends_with(".jpg") || f.to_lowercase().ends_with(".jpeg")
    })
}

fn extract_pictures(args: ExtractPicturesArgs, pool: Pool) -> CommandReturn {
  let db = database::db_connection(&pool).unwrap();
  for entry in WalkDir::new(args.extract_from)
    .follow_links(true)
    .into_iter()
    .filter_map(|e| e.ok())
    .filter(|e| is_picture_file(e))
  {
    let entry_name = entry.file_name().to_str().unwrap();
    let _pic = PicturesInsert {
      name: Some(entry_name.into()),
      ..Default::default()
    }
    .insert(&db)
    .unwrap();
    eprintln!("Resizing image {}...", entry_name);
    image::open(entry.path())
      .unwrap()
      .resize(1600, 1600, FilterType::Nearest)
      .save(Path::new(&args.cache_path).join(entry.file_name().to_str().unwrap()))
      .unwrap();
  }
  Ok(())
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
