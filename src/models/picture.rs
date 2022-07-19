use diesel::{dsl::*, prelude::*};

use crate::schema::pictures;

#[derive(Debug, Serialize, Deserialize, Queryable)]
pub struct Picture {
  pub id: i32,
  pub name: Option<String>,
  pub shot_by_camera_body_id: Option<i32>,
}

impl Picture {
  #[allow(unused)]
  pub fn get_by_id(id: i32) -> Filter<pictures::table, Eq<pictures::id, i32>> {
    pictures::table.filter(pictures::id.eq(id))
  }
}
