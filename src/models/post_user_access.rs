use crate::{database::PooledConnection, schema::post_user_access};
use diesel::{dsl::*, prelude::*};

#[derive(Debug, Queryable)]
pub struct PostUserAccess {
  pub post_id: i32,
  pub user_id: i32,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = post_user_access)]
pub struct PostUserAccessInsert {
  pub post_id: i32,
  pub user_id: i32,
}

pub type GetPostIdByUserId = Select<
  Filter<post_user_access::table, Eq<post_user_access::user_id, i32>>,
  post_user_access::post_id,
>;
pub type GetUserIdByPostId = Select<
  Filter<post_user_access::table, Eq<post_user_access::post_id, i32>>,
  post_user_access::user_id,
>;
type GetByPostIdsAndUserIds = Filter<
  Filter<post_user_access::table, EqAny<post_user_access::user_id, Vec<i32>>>,
  EqAny<post_user_access::post_id, Vec<i32>>,
>;
impl PostUserAccess {
  pub fn get_post_id_by_user_id(user_id: i32) -> GetPostIdByUserId {
    post_user_access::table
      .filter(post_user_access::user_id.eq(user_id))
      .select(post_user_access::post_id)
  }
  pub fn get_user_id_by_post_id(post_id: i32) -> GetUserIdByPostId {
    post_user_access::table
      .filter(post_user_access::post_id.eq(post_id))
      .select(post_user_access::user_id)
  }

  pub fn get_by_post_ids_and_user_ids(
    post_ids: Vec<i32>,
    user_ids: Vec<i32>,
  ) -> GetByPostIdsAndUserIds {
    post_user_access::table
      .filter(post_user_access::user_id.eq_any(user_ids))
      .filter(post_user_access::post_id.eq_any(post_ids))
  }
}

impl PostUserAccessInsert {
  pub fn insert(
    items: Vec<Self>,
    db: &mut PooledConnection,
  ) -> Result<usize, diesel::result::Error> {
    use self::post_user_access::dsl::*;
    insert_into(post_user_access)
      .values(items)
      .on_conflict_do_nothing()
      .execute(db)
  }

  pub fn delete(
    post_ids: Vec<i32>,
    user_ids: Vec<i32>,
    db: &mut PooledConnection,
  ) -> Result<usize, diesel::result::Error> {
    diesel::delete(PostUserAccess::get_by_post_ids_and_user_ids(
      post_ids, user_ids,
    ))
    .execute(db)
  }

  pub fn from_post_ids(post_ids: Vec<i32>, user_ids: Vec<i32>) -> Vec<Self> {
    post_ids
      .into_iter()
      .flat_map(|post_id| {
        user_ids
          .iter()
          .map(move |&user_id| Self { post_id, user_id })
      })
      .collect()
  }
}
