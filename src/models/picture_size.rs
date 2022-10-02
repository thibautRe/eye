use diesel::{dsl::*, prelude::*};

use crate::{database::PooledConnection, schema::picture_sizes};

#[derive(Debug, Clone, Queryable)]
pub struct PictureSize {
  pub id: i32,
  pub picture_id: i32,
  pub file_path: String,
  pub height: i32,
  pub width: i32,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = picture_sizes)]
pub struct PictureSizeInsert {
  pub picture_id: i32,
  pub file_path: String,
  pub height: i32,
  pub width: i32,
}

#[derive(Debug, Serialize)]
pub struct PictureSizeApi {
  pub height: i32,
  pub width: i32,
  pub url: String,
}

type Table = picture_sizes::table;
pub type GetById = Filter<Table, Eq<picture_sizes::id, i32>>;
pub type GetByPictureId = Filter<Table, Eq<picture_sizes::picture_id, i32>>;
pub type GetByPictureIds = Filter<Table, EqAny<picture_sizes::picture_id, Vec<i32>>>;
impl PictureSize {
  pub fn all() -> Table {
    picture_sizes::table
  }
  #[allow(unused)]
  pub fn get_by_id(id: i32) -> GetById {
    PictureSize::all().filter(picture_sizes::id.eq(id))
  }

  pub fn get_by_picture_id(picture_id: i32) -> GetByPictureId {
    PictureSize::all().filter(picture_sizes::picture_id.eq(picture_id))
  }
  pub fn get_by_picture_ids(picture_ids: Vec<i32>) -> GetByPictureIds {
    PictureSize::all().filter(picture_sizes::picture_id.eq_any(picture_ids))
  }
}

impl PictureSizeInsert {
  pub fn insert(&self, db: &mut PooledConnection) -> Result<PictureSize, diesel::result::Error> {
    use self::picture_sizes::dsl::*;
    insert_into(picture_sizes)
      .values(self)
      .get_result::<PictureSize>(db)
  }
}

impl From<PictureSize> for PictureSizeApi {
  fn from(picture_size: PictureSize) -> Self {
    Self {
      height: picture_size.height,
      width: picture_size.width,
      url: "/api/static/".to_owned() + &picture_size.file_path,
    }
  }
}
