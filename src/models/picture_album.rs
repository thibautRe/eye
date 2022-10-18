use crate::{database::PooledConnection, schema::picture_albums};
use diesel::{dsl::*, prelude::*};

#[derive(Debug, Queryable)]
pub struct PictureAlbum {
  pub id: i64,
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
impl PictureAlbum {
  pub fn get_by_album_id(id: i32) -> GetByAlbumId {
    picture_albums::table
      .filter(picture_albums::album_id.eq(id))
      .select(picture_albums::picture_id)
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
