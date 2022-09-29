use crate::schema::albums;
use chrono::NaiveDateTime;

use super::picture::PictureApi;

#[derive(Debug, Queryable)]
pub struct Album {
  pub id: i32,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: NaiveDateTime,
  pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Debug, Queryable)]
pub struct PictureAlbum {
  pub id: i64,
  pub picture_id: i32,
  pub album_id: i32,
}

#[derive(Debug, Insertable)]
#[table_name = "albums"]
pub struct AlbumInsert {
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: NaiveDateTime,
}

impl Album {
  #[allow(unused)]
  pub fn all() -> albums::table {
    albums::table
  }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AlbumApi {
  pub id: i32,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: Option<NaiveDateTime>,
  /// Up to 20 pictures
  pub pictures_excerpt: Vec<PictureApi>,
}
