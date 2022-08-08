use chrono::NaiveDateTime;
use diesel::{dsl::*, prelude::*};

use super::picture_size::{PictureSize, PictureSizeApi};
use crate::{database::PooledConnection, schema::pictures};

#[derive(Debug, Queryable)]
pub struct Picture {
  pub id: i32,
  pub name: Option<String>,
  pub shot_at: Option<NaiveDateTime>,
  pub shot_by_user_id: Option<i32>,
  pub shot_by_camera_body_id: Option<i32>,
  pub shot_by_camera_lens_id: Option<i32>,
  pub shot_with_aperture: Option<String>,
  pub shot_with_focal_length: Option<i32>,
  pub shot_with_exposure_time: Option<String>,
  pub shot_with_iso: Option<i32>,
  pub uploaded_at: NaiveDateTime,
  pub original_width: i32,
  pub original_height: i32,
  pub thumbnail_base64: String,
  pub original_file_path: String,
  pub alt: String,
}

#[derive(Debug, Insertable)]
#[table_name = "pictures"]
pub struct PictureInsert {
  pub name: Option<String>,
  pub shot_at: Option<NaiveDateTime>,
  pub shot_by_user_id: Option<i32>,
  pub shot_by_camera_body_id: Option<i32>,
  pub shot_by_camera_lens_id: Option<i32>,
  pub shot_with_aperture: Option<String>,
  pub shot_with_focal_length: Option<i32>,
  pub shot_with_exposure_time: Option<String>,
  pub shot_with_iso: Option<i32>,
  pub uploaded_at: NaiveDateTime,
  pub original_width: i32,
  pub original_height: i32,
  pub thumbnail_base64: String,
  pub original_file_path: String,
  pub alt: String,
}

#[derive(Debug, Serialize)]
pub struct PictureApiFull {
  pub id: i32,
  pub name: Option<String>,
  pub alt: String,
  pub thumb: String,
  pub sizes: Vec<PictureSizeApi>,
}

impl Picture {
  pub fn all() -> pictures::table {
    pictures::table
  }

  #[allow(unused)]
  pub fn get_by_id(id: i32) -> Filter<pictures::table, Eq<pictures::id, i32>> {
    Picture::all().filter(pictures::id.eq(id))
  }

  pub fn into_api_full(self, sizes: Vec<PictureSize>) -> PictureApiFull {
    PictureApiFull {
      id: self.id,
      alt: self.alt,
      name: self.name,
      thumb: "".into(),
      sizes: sizes.into_iter().map(|f| PictureSizeApi::from(f)).collect(),
    }
  }
}

impl PictureInsert {
  pub fn insert(&self, db: &PooledConnection) -> Result<Picture, diesel::result::Error> {
    use self::pictures::dsl::*;
    insert_into(pictures).values(self).get_result::<Picture>(db)
  }
}
