use crate::schema::sql_types;
use diesel::{backend::Backend, deserialize, sql_types::Text, Queryable};
use diesel::{
  deserialize::FromSql,
  pg::{Pg, PgValue},
  serialize::{self, ToSql},
};
use std::io::Write;

pub mod album;
pub mod camera_body;
pub mod camera_lenses;
pub mod picture;
pub mod picture_album;
pub mod picture_size;
pub mod picture_user_access;
pub mod post_includes;
pub mod post_user_access;
pub mod posts;
pub mod user;

#[derive(Copy, Clone, Debug, PartialEq, AsExpression, FromSqlRow)]
#[diesel(sql_type = sql_types::AccessType)]
pub enum AccessType {
  Private,
  Shared,
  Public,
}

impl ToSql<sql_types::AccessType, Pg> for AccessType {
  fn to_sql<'b>(&'b self, out: &mut serialize::Output<'b, '_, Pg>) -> serialize::Result {
    match *self {
      Self::Private => out.write_all(b"private")?,
      Self::Public => out.write_all(b"public")?,
      Self::Shared => out.write_all(b"shared")?,
    }
    Ok(serialize::IsNull::No)
  }
}

impl FromSql<sql_types::AccessType, Pg> for AccessType {
  fn from_sql(bytes: PgValue) -> deserialize::Result<Self> {
    match bytes.as_bytes() {
      b"private" => Ok(Self::Private),
      b"public" => Ok(Self::Public),
      b"shared" => Ok(Self::Shared),
      _ => Err("Unrecognized enum variant".into()),
    }
  }
}

// --- everything below this is legacy and only used because the "pictures" table is still using STRING type

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum AccessTypeOld {
  Private,
  Shared,
  Public,
}
impl<DB> Queryable<Text, DB> for AccessTypeOld
where
  DB: Backend,
  String: deserialize::FromSql<Text, DB>,
{
  type Row = String;

  fn build(s: String) -> deserialize::Result<Self> {
    match s.as_str() {
      "public" => Ok(Self::Public),
      "private" => Ok(Self::Private),
      "shared" => Ok(Self::Shared),
      _ => Ok(Self::Private),
    }
  }
}

impl AccessTypeOld {
  pub fn to_string(self) -> &'static str {
    match self {
      Self::Private => "private",
      Self::Public => "public",
      Self::Shared => "shared",
    }
  }
}
