use std::{
  collections::{HashMap, HashSet},
  fs,
  path::Path,
};

use diesel::{QueryDsl, RunQueryDsl};
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageError};
use walkdir::{DirEntry, WalkDir};

use crate::{
  database::{self, Pool, PooledConnection},
  exif_helpers::*,
  models::{
    camera_lenses::CameraLens,
    picture::{Picture, PictureInsert},
    picture_size::PictureSizeInsert,
  },
  schema::pictures,
  CommandReturn,
};

pub fn extract_pictures(extract_from: String, cache_path: String, pool: Pool) -> CommandReturn {
  let mut db = database::db_connection(&pool).unwrap();

  let lenses = CameraLens::all().load::<CameraLens>(&mut db).unwrap();
  let lenses_by_name: HashMap<String, CameraLens> = lenses
    .into_iter()
    .map(|lens| (lens.name.clone(), lens))
    .collect();

  let all_pictures: Vec<(String, i32)> = Picture::all()
    .select((pictures::original_file_path, pictures::extract_version))
    .load(&mut db)
    .unwrap();
  let all_pictures: HashSet<_> = all_pictures.into_iter().collect();

  let cache_path = Path::new(&cache_path);
  for entry in WalkDir::new(extract_from)
    .follow_links(true)
    .into_iter()
    .filter_map(|e| e.ok())
    .filter(|e| is_picture_file(e))
  {
    let file_path = entry.path().to_str().unwrap();
    if all_pictures.contains(&(String::from(file_path), 1)) {
      continue;
    }
    process_picture(entry, &lenses_by_name, cache_path, &mut db)?;
  }
  Ok(())
}

fn process_picture(
  entry: DirEntry,
  lenses_by_name: &HashMap<String, CameraLens>,
  cache_path: &Path,
  db: &mut PooledConnection,
) -> Result<(), std::io::Error> {
  let file_path = entry.path().to_str().unwrap();
  let entry_name = entry.file_name().to_str().unwrap();
  let dyn_img = image::open(entry.path()).unwrap();
  let exif = get_exif(&std::fs::File::open(entry.path())?);

  let orientation = get_orientation(&exif).unwrap();
  let (original_width, original_height) = get_dimensions_for_orientation(
    orientation,
    (dyn_img.width() as i32, dyn_img.height() as i32),
  );

  let pic = PictureInsert {
    name: Some(entry_name.into()),
    uploaded_at: chrono::Local::now().naive_local(),
    original_file_path: file_path.into(),
    original_width,
    original_height,
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
    extract_version: 1,
  }
  .insert(db)
  .unwrap();

  let file_cache_path = Path::new(&rand::random::<u8>().to_string())
    .join(&rand::random::<u8>().to_string())
    .join(&rand::random::<u64>().to_string());
  fs::create_dir_all(cache_path.join(&file_cache_path))?;

  for &(max_size, filter_type) in [
    (2500, FilterType::CatmullRom),
    (1800, FilterType::CatmullRom),
    (1200, FilterType::CatmullRom),
    (900, FilterType::CatmullRom),
    (600, FilterType::CatmullRom),
    (320, FilterType::Nearest),
    (100, FilterType::Nearest),
  ]
  .iter()
  {
    create_subsize_picture(
      &pic,
      &dyn_img,
      max_size,
      filter_type,
      orientation,
      cache_path,
      &file_cache_path,
      db,
    )
    .unwrap();
  }
  Ok(())
}

/// Filter pictures (JPG files)
fn is_picture_file(file: &walkdir::DirEntry) -> bool {
  file.file_type().is_file()
    && file.file_name().to_str().map_or(false, |f| {
      f.to_lowercase().ends_with(".jpg") || f.to_lowercase().ends_with(".jpeg")
    })
}

fn create_blurhash(img: DynamicImage) -> String {
  let (width, height) = img.dimensions();
  blurhash::encode(4, 3, width, height, &img.to_rgba8())
}

/// Flip dimensions if orientation is 90 or 270deg
fn get_dimensions_for_orientation(orientation: i16, dimensions: (i32, i32)) -> (i32, i32) {
  match orientation {
    6 | 8 => (dimensions.1, dimensions.0),
    _ => (dimensions.0, dimensions.1),
  }
}

fn create_subsize_picture(
  pic: &Picture,
  img: &DynamicImage,
  max_size: u32,
  filter_type: FilterType,
  // see EXIT doc for Orientation https://exiftool.org/TagNames/EXIF.html
  orientation: i16,
  cache_path: &Path,
  file_cache_path: &Path,
  db: &mut PooledConnection,
) -> Result<(), ImageError> {
  let pic_name = pic.name.clone().unwrap_or("unknown.jpg".into());
  eprintln!("Resizing image {} for size {}...", pic_name, max_size);
  let mut resized_img = img.resize(max_size, max_size, filter_type);

  resized_img = match orientation {
    3 => resized_img.rotate180(),
    6 => resized_img.rotate90(),
    8 => resized_img.rotate270(),
    _ => resized_img,
  };

  let (width, height) = get_dimensions_for_orientation(
    orientation,
    (resized_img.width() as i32, resized_img.height() as i32),
  );

  let file_name = max_size.to_string() + "-" + &pic_name;
  let file_path_and_name = file_cache_path.join(file_name);
  PictureSizeInsert {
    picture_id: pic.id,
    height,
    width,
    file_path: file_path_and_name.to_str().unwrap().to_string(),
  }
  .insert(db)
  .unwrap();

  resized_img.save(cache_path.join(file_path_and_name))
}
