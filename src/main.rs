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

use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use cli_args::{Commands, ExtractPicturesArgs, Opt, ServeArgs};
use database::{Pool, PooledConnection};
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageError};
use jwt::JwtKey;
use models::{
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
  let db = database::db_connection(&pool).unwrap();
  for entry in WalkDir::new(args.extract_from)
    .follow_links(true)
    .into_iter()
    .filter_map(|e| e.ok())
    .filter(|e| is_picture_file(e))
  {
    let entry_name = entry.file_name().to_str().unwrap();
    let dyn_img = image::open(entry.path()).unwrap();

    let file = std::fs::File::open(entry.path())?;
    let mut bufreader = std::io::BufReader::new(&file);
    let exif = exif::Reader::new()
      .read_from_container(&mut bufreader)
      .expect("Cannot parse EXIF data");

    println!(
      "PhotographicSensitivity: {:?}",
      exif.get_field(exif::Tag::PhotographicSensitivity, exif::In::PRIMARY)
    );

    // See https://exiftool.org/TagNames/EXIF.html for EXIF format info

    let pic = PictureInsert {
      name: Some(entry_name.into()),
      uploaded_at: chrono::Local::now().naive_local(),
      original_file_path: entry.path().to_str().unwrap().into(),
      original_width: dyn_img.width() as i32,
      original_height: dyn_img.height() as i32,
      blurhash: create_blurhash(dyn_img.thumbnail(128, 128)).into(),
      shot_at: None,                // TODO
      shot_by_user_id: None,        // TODO
      shot_by_camera_body_id: None, // TODO
      shot_by_camera_lens_id: None, // TODO
      shot_with_aperture: exif
        .get_field(exif::Tag::FNumber, exif::In::PRIMARY)
        .map(|ref f| match f.value {
          exif::Value::Rational(ref v) => Some(v[0].to_f64().to_string()),
          _ => None,
        })
        .flatten(),
      shot_with_focal_length: exif
        .get_field(exif::Tag::FocalLength, exif::In::PRIMARY)
        .map(|f| match f.value {
          exif::Value::Rational(ref v) => Some(v[0].to_f64() as i32),
          _ => None,
        })
        .flatten(),
      shot_with_exposure_time: exif
        .get_field(exif::Tag::ExposureTime, exif::In::PRIMARY)
        .map(|f| match f.value {
          exif::Value::Rational(ref v) => Some(v[0].to_f64().to_string()),
          _ => None,
        })
        .flatten(),
      shot_with_iso: exif
        .get_field(exif::Tag::PhotographicSensitivity, exif::In::PRIMARY)
        .map(|f| match f.value {
          exif::Value::Short(ref v) => Some(v[0] as i32),
          _ => None,
        })
        .flatten(),
      alt: "".into(),
    }
    .insert(&db)
    .unwrap();

    create_subsize_picture(&pic, &dyn_img, 2500, Path::new(&args.cache_path), &db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 1600, Path::new(&args.cache_path), &db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 900, Path::new(&args.cache_path), &db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 600, Path::new(&args.cache_path), &db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 320, Path::new(&args.cache_path), &db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 100, Path::new(&args.cache_path), &db).unwrap();
    create_subsize_picture(&pic, &dyn_img, 50, Path::new(&args.cache_path), &db).unwrap();
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
  db: &PooledConnection,
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
  .insert(&db)
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
