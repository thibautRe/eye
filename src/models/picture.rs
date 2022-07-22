use chrono::NaiveDateTime;
use diesel::{dsl::*, prelude::*};

use crate::{database::PooledConnection, schema::pictures};

#[derive(Debug, Serialize, Deserialize, Queryable)]
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
}

#[derive(Debug, Deserialize, Insertable)]
#[table_name = "pictures"]
pub struct PicturesInsert {
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
}

impl Default for PicturesInsert {
  fn default() -> Self {
    return Self {
      name: None,
      shot_at: None,
      shot_by_user_id: None,
      shot_by_camera_body_id: None,
      shot_by_camera_lens_id: None,
      shot_with_aperture: None,
      shot_with_focal_length: None,
      shot_with_exposure_time: None,
      shot_with_iso: None,
      uploaded_at: chrono::Local::now().naive_local(),
    };
  }
}

impl Picture {
  #[allow(unused)]
  pub fn get_by_id(id: i32) -> Filter<pictures::table, Eq<pictures::id, i32>> {
    pictures::table.filter(pictures::id.eq(id))
  }
}

impl PicturesInsert {
  pub fn insert(&self, db: &PooledConnection) -> Result<Picture, diesel::result::Error> {
    use self::pictures::dsl::*;
    insert_into(pictures).values(self).get_result::<Picture>(db)
  }
}
