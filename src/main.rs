#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

mod api;
mod cli_args;
mod database;
mod errors;
mod exif_helpers;
mod jwt;
mod models;
mod schema;

use std::{collections::HashMap, path::Path};

use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use cli_args::{Commands, ExtractPicturesArgs, Opt, ServeArgs};
use database::{Pool, PooledConnection};
use diesel::RunQueryDsl;
use exif_helpers::*;
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageError};
use jwt::JwtKey;
use models::{
  camera_lenses::CameraLens,
  picture::{Picture, PictureInsert},
  picture_size::PictureSizeInsert,
};
use walkdir::WalkDir;

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
  let mut db = database::db_connection(&pool).unwrap();

  let lenses = CameraLens::all().load::<CameraLens>(&mut db).unwrap();
  let lenses_by_name: HashMap<String, CameraLens> = lenses
    .into_iter()
    .map(|lens| (lens.name.clone(), lens))
    .collect();

  for entry in WalkDir::new(args.extract_from)
    .follow_links(true)
    .into_iter()
    .filter_map(|e| e.ok())
    .filter(|e| is_picture_file(e))
  {
    let entry_name = entry.file_name().to_str().unwrap();
    let dyn_img = image::open(entry.path()).unwrap();
    let exif = get_exif(&std::fs::File::open(entry.path())?);

    let pic = PictureInsert {
      name: Some(entry_name.into()),
      uploaded_at: chrono::Local::now().naive_local(),
      original_file_path: entry.path().to_str().unwrap().into(),
      original_width: dyn_img.width() as i32,
      original_height: dyn_img.height() as i32,
      blurhash: create_blurhash(dyn_img.thumbnail(128, 128)).into(),
      alt: "".into(),
      access_type: None,
      shot_by_user_id: None,        // TODO
      shot_by_camera_body_id: None, // TODO

      shot_by_camera_lens_id: get_shot_by_camera_lens_name(&exif)
        .map(|name| lenses_by_name.get(name).map(|lens| lens.id))
        .flatten(),
      shot_at: get_shot_at(&exif),
      shot_with_aperture: get_shot_with_fstop(&exif),
      shot_with_focal_length: get_shot_with_focal_length(&exif),
      shot_with_exposure_time: get_shot_with_exposure_time(&exif),
      shot_with_iso: get_shot_with_iso(&exif),
    }
    .insert(&mut db)
    .unwrap();

    let cache_path = Path::new(&args.cache_path);
    create_subsize_picture(&pic, &dyn_img, 1600, cache_path, &mut db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 900, cache_path, &mut db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 600, cache_path, &mut db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 320, cache_path, &mut db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 100, cache_path, &mut db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 50, cache_path, &mut db).unwrap();
  }
  Ok(())
}

fn create_blurhash(img: DynamicImage) -> String {
  let (width, height) = img.dimensions();
  blurhash::encode(4, 3, width, height, &img.to_rgba8())
}

fn create_subsize_picture(
  pic: &Picture,
  img: &DynamicImage,
  max_size: u32,
  cache_path: &Path,
  db: &mut PooledConnection,
) -> Result<(), ImageError> {
  let pic_name = pic.name.clone().unwrap_or("unknown.jpg".into());
  eprintln!("Resizing image {} for size {}...", pic_name, max_size);
  let resized_img = img.resize(max_size, max_size, FilterType::Nearest);
  let file_path = max_size.to_string() + "-" + &rand::random::<u64>().to_string() + "-" + &pic_name;
  PictureSizeInsert {
    picture_id: pic.id,
    height: resized_img.height() as i32,
    width: resized_img.width() as i32,
    file_path: file_path.clone(),
  }
  .insert(db)
  .unwrap();
  resized_img.save(cache_path.join(file_path))
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
      .configure(api::api_service)
      .service(actix_files::Files::new("/api/static/", ".eye_cache").show_files_listing())
  })
  .bind((host.clone(), port))
  .unwrap()
  .run();

  eprintln!("Listening on {}:{}", host, port);

  // Awaiting server to exit
  server.await
}
