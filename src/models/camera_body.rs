use diesel::{
  dsl::{Eq, Filter},
  prelude::*,
};

use crate::schema::camera_bodies;

#[derive(Debug, Serialize, Deserialize, Queryable)]
pub struct DbCameraBody {
  pub id: i32,
  pub name: String,
}

impl DbCameraBody {
  #[allow(unused)]
  pub fn get_by_id(id: i32) -> Filter<camera_bodies::table, Eq<camera_bodies::id, i32>> {
    camera_bodies::table.filter(camera_bodies::id.eq(id))
  }
}
