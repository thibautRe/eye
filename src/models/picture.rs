use chrono::NaiveDateTime;
use diesel::{dsl::*, prelude::*};

use super::{
  camera_lenses::CameraLens,
  picture_album::{self, PictureAlbum},
  picture_size::{PictureSize, PictureSizeApi},
  AccessType,
};
use crate::{
  database::PooledConnection,
  schema::{picture_albums, pictures},
};

#[derive(Debug, Queryable)]
pub struct Picture {
  pub id: i32,
  pub name: Option<String>,
  pub shot_at: Option<NaiveDateTime>,
  pub shot_by_user_id: Option<i32>,
  pub shot_by_camera_body_id: Option<i32>,
  pub shot_by_camera_lens_id: Option<i32>,
  pub shot_with_aperture: Option<String>,
  pub shot_with_focal_length: Option<i32>,
  pub shot_with_exposure_time: Option<String>,
  pub shot_with_iso: Option<i32>,
  pub uploaded_at: NaiveDateTime,
  pub original_width: i32,
  pub original_height: i32,
  pub blurhash: String,
  pub original_file_path: String,
  pub alt: String,
  pub access_type: AccessType,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = pictures)]
pub struct PictureInsert {
  pub name: Option<String>,
  pub shot_at: Option<NaiveDateTime>,
  pub shot_by_user_id: Option<i32>,
  pub shot_by_camera_body_id: Option<i32>,
  pub shot_by_camera_lens_id: Option<i32>,
  pub shot_with_aperture: Option<String>,
  pub shot_with_focal_length: Option<i32>,
  pub shot_with_exposure_time: Option<String>,
  pub shot_with_iso: Option<i32>,
  pub uploaded_at: NaiveDateTime,
  pub original_width: i32,
  pub original_height: i32,
  pub blurhash: String,
  pub original_file_path: String,
  pub alt: String,
  pub access_type: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PictureApi {
  pub id: i32,
  pub name: Option<String>,
  pub width: i32,
  pub height: i32,
  pub alt: String,
  pub blurhash: String,
  pub sizes: Vec<PictureSizeApi>,

  pub shot_with_camera_lens: Option<CameraLens>,
  pub shot_at: Option<NaiveDateTime>,
  pub shot_with_aperture: Option<String>,
  pub shot_with_focal_length: Option<i32>,
  pub shot_with_exposure_time: Option<String>,
  pub shot_with_iso: Option<i32>,
}

type Table = pictures::table;
pub type GetAllPublic = Filter<Table, Eq<pictures::access_type, &'static str>>;
pub type GetByAlbumId = Filter<
  Table,
  EqAny<pictures::id, Select<picture_album::GetByAlbumId, picture_albums::picture_id>>,
>;
pub type GetByAlbumIds = Filter<
  Table,
  EqAny<pictures::id, Select<picture_album::GetByAlbumIds, picture_albums::picture_id>>,
>;
impl Picture {
  pub fn all() -> Table {
    pictures::table
  }

  pub fn get_all_public() -> GetAllPublic {
    Picture::all().filter(pictures::access_type.eq("public"))
  }

  pub fn get_by_id(id: i32) -> Filter<Table, Eq<pictures::id, i32>> {
    Picture::all().filter(pictures::id.eq(id))
  }

  #[allow(unused)]
  pub fn get_by_ids(ids: Vec<i32>) -> Filter<Table, EqAny<pictures::id, Vec<i32>>> {
    Picture::all().filter(pictures::id.eq_any(ids.to_owned()))
  }

  pub fn get_by_album_id(id: i32) -> GetByAlbumId {
    Picture::all().filter(
      pictures::id.eq_any(PictureAlbum::get_by_album_id(id).select(picture_albums::picture_id)),
    )
  }
  pub fn get_by_album_ids(ids: Vec<i32>) -> GetByAlbumIds {
    Picture::all().filter(
      pictures::id.eq_any(PictureAlbum::get_by_album_ids(ids).select(picture_albums::picture_id)),
    )
  }

  pub fn into_api_full(
    self,
    sizes: Vec<PictureSize>,
    shot_with_camera_lens: Option<CameraLens>,
  ) -> PictureApi {
    PictureApi {
      id: self.id,
      height: self.original_height,
      width: self.original_width,
      alt: self.alt,
      name: self.name,
      blurhash: self.blurhash,
      sizes: sizes.into_iter().map(|f| PictureSizeApi::from(f)).collect(),

      shot_with_camera_lens,
      shot_at: self.shot_at,
      shot_with_aperture: self.shot_with_aperture,
      shot_with_exposure_time: self.shot_with_exposure_time,
      shot_with_focal_length: self.shot_with_focal_length,
      shot_with_iso: self.shot_with_iso,
    }
  }
}

impl PictureInsert {
  pub fn insert(&self, db: &mut PooledConnection) -> Result<Picture, diesel::result::Error> {
    use self::pictures::dsl::*;
    insert_into(pictures).values(self).get_result::<Picture>(db)
  }
}
