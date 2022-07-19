use chrono::NaiveDateTime;
use diesel::{dsl::*, prelude::*};

use crate::schema::users;

#[derive(Debug, Serialize, Deserialize, Queryable)]
pub struct User {
  pub id: i32,
  pub email: String,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

impl User {
  #[allow(unused)]
  pub fn get_by_id(id: i32) -> Filter<users::table, Eq<users::id, i32>> {
    users::table.filter(users::id.eq(id))
  }

  pub fn get_all() -> users::table {
    users::table
  }
}
