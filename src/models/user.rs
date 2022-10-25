use chrono::NaiveDateTime;
use diesel::{dsl::*, prelude::*};

use crate::{database::PooledConnection, schema::users};

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

#[derive(Debug, Insertable)]
#[diesel(table_name = users)]
pub struct UserInsert {
  pub email: String,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

impl UserInsert {
  pub fn insert(&self, db: &mut PooledConnection) -> Result<User, diesel::result::Error> {
    use self::users::dsl::*;
    insert_into(users).values(self).get_result::<User>(db)
  }
}
