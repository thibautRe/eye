use crate::schema::picture_user_access;
use diesel::{dsl::*, prelude::*};

#[derive(Debug, Queryable)]
pub struct PictureUserAccess {
  pub picture_id: i32,
  pub user_id: i32,
}

pub type GetByUserId = Select<
  Filter<picture_user_access::table, Eq<picture_user_access::user_id, i32>>,
  picture_user_access::picture_id,
>;
impl PictureUserAccess {
  pub fn get_by_user_id(user_id: i32) -> GetByUserId {
    picture_user_access::table
      .filter(picture_user_access::user_id.eq(user_id))
      .select(picture_user_access::picture_id)
  }
}
