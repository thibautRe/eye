use crate::{database::PooledConnection, schema::picture_albums};
use diesel::{dsl::*, prelude::*};

use super::picture::{GetPublicIds, GetSharedIds, Picture};

#[derive(Debug, Queryable)]
pub struct PictureAlbum {
  pub picture_id: i32,
  pub album_id: i32,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = picture_albums)]
pub struct PictureAlbumInsert {
  pub picture_id: i32,
  pub album_id: i32,
}

pub type GetByAlbumIdAndPictureIds = Filter<
  Filter<picture_albums::table, Eq<picture_albums::album_id, i32>>,
  EqAny<picture_albums::picture_id, Vec<i32>>,
>;
pub type GetPictureIdsForAlbumId = Select<
  Filter<picture_albums::table, Eq<picture_albums::album_id, i32>>,
  picture_albums::picture_id,
>;
pub type GetPictureIdsForAlbumIds = Select<
  Filter<picture_albums::table, EqAny<picture_albums::album_id, Vec<i32>>>,
  picture_albums::picture_id,
>;
pub type GetAlbumIdsWithPublicPictures = Select<
  Filter<picture_albums::table, EqAny<picture_albums::picture_id, GetPublicIds>>,
  picture_albums::album_id,
>;
pub type GetAlbumIdsWithSharedPictures = Select<
  Filter<picture_albums::table, EqAny<picture_albums::picture_id, GetSharedIds>>,
  picture_albums::album_id,
>;
impl PictureAlbum {
  pub fn get_by_album_id_and_picture_ids(
    album_id: i32,
    picture_ids: Vec<i32>,
  ) -> GetByAlbumIdAndPictureIds {
    picture_albums::table
      .filter(picture_albums::album_id.eq(album_id))
      .filter(picture_albums::picture_id.eq_any(picture_ids))
  }
  pub fn get_picture_ids_for_album_id(id: i32) -> GetPictureIdsForAlbumId {
    picture_albums::table
      .filter(picture_albums::album_id.eq(id))
      .select(picture_albums::picture_id)
  }
  pub fn get_picture_ids_for_album_ids(ids: Vec<i32>) -> GetPictureIdsForAlbumIds {
    picture_albums::table
      .filter(picture_albums::album_id.eq_any(ids))
      .select(picture_albums::picture_id)
  }

  pub fn get_album_ids_with_public_pictures() -> GetAlbumIdsWithPublicPictures {
    picture_albums::table
      .filter(picture_albums::picture_id.eq_any(Picture::get_public_ids()))
      .select(picture_albums::album_id)
  }
  pub fn get_album_ids_with_shared_pictures(user_id: i32) -> GetAlbumIdsWithSharedPictures {
    picture_albums::table
      .filter(picture_albums::picture_id.eq_any(Picture::get_shared_ids(user_id)))
      .select(picture_albums::album_id)
  }
}

impl PictureAlbumInsert {
  pub fn insert_mul(
    items: &Vec<PictureAlbumInsert>,
    db: &mut PooledConnection,
  ) -> Result<usize, diesel::result::Error> {
    use self::picture_albums::dsl::*;
    insert_into(picture_albums).values(items).execute(db)
  }
}

pub fn delete_pictures_album(
  album_id: i32,
  picture_ids: Vec<i32>,
  db: &mut PooledConnection,
) -> Result<usize, diesel::result::Error> {
  diesel::delete(PictureAlbum::get_by_album_id_and_picture_ids(
    album_id,
    picture_ids,
  ))
  .execute(db)
}
