use crate::{database::PooledConnection, schema::picture_user_access};
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
type GetByPictureIdsAndUserIds = Filter<
  Filter<picture_user_access::table, EqAny<picture_user_access::user_id, Vec<i32>>>,
  EqAny<picture_user_access::picture_id, Vec<i32>>,
>;
impl PictureUserAccess {
  pub fn get_by_user_id(user_id: i32) -> GetByUserId {
    picture_user_access::table
      .filter(picture_user_access::user_id.eq(user_id))
      .select(picture_user_access::picture_id)
  }

  pub fn get_by_picture_ids_and_user_ids(
    picture_ids: Vec<i32>,
    user_ids: Vec<i32>,
  ) -> GetByPictureIdsAndUserIds {
    picture_user_access::table
      .filter(picture_user_access::user_id.eq_any(user_ids))
      .filter(picture_user_access::picture_id.eq_any(picture_ids))
  }
}

#[derive(Debug, Insertable)]
#[diesel(table_name = picture_user_access)]
pub struct PictureUserAccessInsert {
  pub picture_id: i32,
  pub user_id: i32,
}

impl PictureUserAccessInsert {
  pub fn from_picture_ids(user_ids: Vec<i32>, picture_ids: Vec<i32>) -> Vec<Self> {
    picture_ids
      .into_iter()
      .flat_map(|picture_id| {
        user_ids.iter().map(move |&user_id| Self {
          picture_id,
          user_id,
        })
      })
      .collect()
  }
}

pub fn insert_pictures_user_access(
  picture_ids: Vec<i32>,
  user_ids: Vec<i32>,
  db: &mut PooledConnection,
) -> Result<usize, diesel::result::Error> {
  use self::picture_user_access::dsl::*;
  let items = PictureUserAccessInsert::from_picture_ids(user_ids, picture_ids);
  insert_into(picture_user_access)
    .values(items)
    .on_conflict_do_nothing()
    .execute(db)
}

pub fn delete_pictures_user_access(
  picture_ids: Vec<i32>,
  user_ids: Vec<i32>,
  db: &mut PooledConnection,
) -> Result<usize, diesel::result::Error> {
  diesel::delete(PictureUserAccess::get_by_picture_ids_and_user_ids(
    picture_ids,
    user_ids,
  ))
  .execute(db)
}
