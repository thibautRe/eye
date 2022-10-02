use diesel::{dsl::*, prelude::*};

use crate::schema::camera_lenses;

#[derive(Debug, Queryable, Serialize, Clone)]
pub struct CameraLens {
  pub id: i32,
  pub name: String,
}

type Table = camera_lenses::table;
pub type GetById = Filter<Table, Eq<camera_lenses::id, i32>>;
pub type GetByIds = Filter<Table, EqAny<camera_lenses::id, Vec<i32>>>;
impl CameraLens {
  pub fn all() -> Table {
    camera_lenses::table
  }

  #[allow(unused)]
  pub fn get_by_id(id: i32) -> GetById {
    camera_lenses::table.filter(camera_lenses::id.eq(id))
  }

  pub fn get_by_ids(ids: Vec<i32>) -> GetByIds {
    camera_lenses::table.filter(camera_lenses::id.eq_any(ids))
  }
}
