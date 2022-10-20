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

pub type GetByAlbumId = Select<
  Filter<picture_albums::table, Eq<picture_albums::album_id, i32>>,
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
  pub fn get_by_album_id(id: i32) -> GetByAlbumId {
    picture_albums::table
      .filter(picture_albums::album_id.eq(id))
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
