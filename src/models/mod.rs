use diesel::{backend::Backend, deserialize, sql_types::Text, Queryable};
pub mod album;
pub mod camera_body;
pub mod camera_lenses;
pub mod picture;
pub mod picture_album;
pub mod picture_size;
pub mod picture_user_access;
pub mod user;

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum AccessType {
  Private,
  Shared,
  Public,
}

impl<DB> Queryable<Text, DB> for AccessType
where
  DB: Backend,
  String: deserialize::FromSql<Text, DB>,
{
  type Row = String;

  fn build(s: String) -> deserialize::Result<Self> {
    match s.as_str() {
      "public" => Ok(AccessType::Public),
      "private" => Ok(AccessType::Private),
      "shared" => Ok(AccessType::Shared),
      _ => Ok(AccessType::Private),
    }
  }
}

impl AccessType {
  pub fn to_string(self) -> &'static str {
    match self {
      AccessType::Private => "private",
      AccessType::Public => "public",
      AccessType::Shared => "shared",
    }
  }
}
