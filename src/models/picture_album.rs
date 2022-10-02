use crate::schema::picture_albums;
use diesel::{dsl::*, prelude::*};

#[derive(Debug, Queryable)]
pub struct PictureAlbum {
  pub id: i64,
  pub picture_id: i32,
  pub album_id: i32,
}

pub type GetByAlbumId = Filter<picture_albums::table, Eq<picture_albums::album_id, i32>>;
pub type GetByAlbumIds = Filter<picture_albums::table, EqAny<picture_albums::album_id, Vec<i32>>>;
impl PictureAlbum {
  pub fn all() -> picture_albums::table {
    picture_albums::table
  }

  pub fn get_by_album_id(id: i32) -> GetByAlbumId {
    PictureAlbum::all().filter(picture_albums::album_id.eq(id))
  }
  pub fn get_by_album_ids(ids: Vec<i32>) -> GetByAlbumIds {
    PictureAlbum::all().filter(picture_albums::album_id.eq_any(ids))
  }
}
