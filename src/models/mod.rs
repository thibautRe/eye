use diesel::{backend::Backend, deserialize, sql_types::Text, Queryable};

pub mod camera_body;
pub mod camera_lenses;
pub mod picture;
pub mod picture_size;
pub mod user;

#[derive(Debug, PartialEq)]
pub enum AccessType {
  Private,
  Public,
}

// impl<DB, ST> Queryable<ST, DB> for AccessType
// where
//   DB: Backend,
//   String: Queryable<ST, DB>,
// {
//   type Row = <String as Queryable<ST, DB>>::Row;

//   fn build(row: Self::Row) -> Self {
//     match String::build(row).ok().as_str() {
//       "public" => AccessType::Public,
//       "private" => AccessType::Private,
//       _ => AccessType::Private,
//     }
//   }
// }

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
      _ => Ok(AccessType::Private),
    }
  }
}
