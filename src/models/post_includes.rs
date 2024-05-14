use crate::{
  database::PooledConnection,
  schema::{post_includes, sql_types},
};
use diesel::{
  deserialize::{self, FromSql},
  dsl::*,
  expression::AsExpression,
  pg::{Pg, PgValue},
  prelude::*,
  serialize::{self, ToSql},
};
use std::io::Write;

#[derive(Queryable)]
pub struct PostInclude {
  pub post_id: i32,
  pub target_id: i32,
  pub target_kind: PostIncludeTargetKind,
}

#[derive(Insertable)]
#[diesel(table_name = post_includes)]
pub struct PostIncludeInsert {
  pub post_id: i32,
  pub target_id: i32,
  pub target_kind: PostIncludeTargetKind,
}

type GetPictureIdsForPostId = Select<
  Filter<
    Filter<post_includes::table, Eq<post_includes::target_kind, PostIncludeTargetKind>>,
    Eq<post_includes::post_id, i32>,
  >,
  post_includes::target_id,
>;

impl PostInclude {
  pub fn get_picture_ids_for_post_id(post_id: i32) -> GetPictureIdsForPostId {
    post_includes::table
      .filter(post_includes::target_kind.eq(PostIncludeTargetKind::Picture))
      .filter(post_includes::post_id.eq(post_id))
      .select(post_includes::target_id)
  }
}

#[derive(Debug, Copy, Clone, PartialEq, AsExpression, FromSqlRow)]
#[diesel(sql_type = sql_types::PostIncludeTargetKind)]
pub enum PostIncludeTargetKind {
  Picture,
  Album,
}

impl ToSql<sql_types::PostIncludeTargetKind, Pg> for PostIncludeTargetKind {
  fn to_sql<'b>(&'b self, out: &mut serialize::Output<'b, '_, Pg>) -> serialize::Result {
    match *self {
      Self::Picture => out.write_all(b"picture")?,
      Self::Album => out.write_all(b"album")?,
    }
    Ok(serialize::IsNull::No)
  }
}

impl FromSql<sql_types::PostIncludeTargetKind, Pg> for PostIncludeTargetKind {
  fn from_sql(bytes: PgValue) -> deserialize::Result<Self> {
    match bytes.as_bytes() {
      b"picture" => Ok(Self::Picture),
      b"album" => Ok(Self::Album),
      _ => Err("Unrecognized enum variant".into()),
    }
  }
}

impl PostIncludeInsert {
  fn insert(values: Vec<Self>, db: &mut PooledConnection) -> Result<usize, diesel::result::Error> {
    use self::post_includes::dsl::*;
    insert_into(post_includes)
      .values(values)
      .on_conflict_do_nothing()
      .execute(db)
  }
}
