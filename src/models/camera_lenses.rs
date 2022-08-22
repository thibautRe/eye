use diesel::{dsl::*, prelude::*};

use crate::schema::camera_lenses;

#[derive(Debug, Queryable, Serialize)]
pub struct CameraLens {
  pub id: i32,
  pub name: String,
}

impl CameraLens {
  pub fn all() -> camera_lenses::table {
    camera_lenses::table
  }

  #[allow(unused)]
  pub fn get_by_id(id: i32) -> Filter<camera_lenses::table, Eq<camera_lenses::id, i32>> {
    camera_lenses::table.filter(camera_lenses::id.eq(id))
  }
}
