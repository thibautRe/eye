use chrono::NaiveDateTime;
use diesel::{dsl::*, pg::Pg, prelude::*};

use super::{
  camera_lenses::CameraLens,
  picture_album::PictureAlbum,
  picture_size::{PictureSize, PictureSizeApi},
  picture_user_access::{GetPictureIdByUserId, PictureUserAccess},
  post_includes::PostInclude,
  AccessTypeOld,
};
use crate::{
  database::PooledConnection,
  jwt::{Claims, Role},
  schema::pictures,
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
  pub access_type: AccessTypeOld,
  pub extract_version: i32,
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
  pub extract_version: i32,
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
  pub original: PictureSizeApi,

  pub shot_with_camera_lens: Option<CameraLens>,
  pub shot_at: Option<NaiveDateTime>,
  pub shot_with_aperture: Option<String>,
  pub shot_with_focal_length: Option<i32>,
  pub shot_with_exposure_time: Option<String>,
  pub shot_with_iso: Option<i32>,
}

type Table = Order<pictures::table, Desc<pictures::shot_at>>;
type GetById = Filter<pictures::table, Eq<pictures::id, i32>>;
type EqPublic = Eq<pictures::access_type, &'static str>;
type EqShared = Or<EqPublic, EqAny<pictures::id, GetPictureIdByUserId>>;
pub type GetPublicIds = Select<Filter<pictures::table, EqPublic>, pictures::id>;
pub type GetSharedIds = Select<Filter<pictures::table, EqShared>, pictures::id>;

impl Picture {
  pub fn all() -> Table {
    pictures::table.order(pictures::shot_at.desc())
  }

  pub fn get_by_id(picture_id: i32) -> GetById {
    pictures::table.filter(pictures::id.eq(picture_id))
  }

  pub fn get_filters(
    claims: Option<Claims>,
    id: Option<i32>,
    album_id: Option<i32>,
    not_album_id: Option<i32>,
  ) -> IntoBoxed<'static, pictures::table, Pg> {
    let mut query = Self::all().into_boxed();

    if let Some(id) = id {
      query = query.filter(pictures::id.eq(id));
    }

    if let Some(album_id) = album_id {
      query =
        query.filter(pictures::id.eq_any(PictureAlbum::get_picture_ids_for_album_id(album_id)));
    }

    if let Some(not_album_id) = not_album_id {
      query =
        query.filter(pictures::id.ne_all(PictureAlbum::get_picture_ids_for_album_id(not_album_id)))
    }

    Self::with_claims(claims, query)
  }

  pub fn get_by_included_in_post_id(
    post_id: i32,
    claims: Option<Claims>,
  ) -> IntoBoxed<'static, pictures::table, Pg> {
    let mut query = Self::all().into_boxed();
    query = query.filter(pictures::id.eq_any(PostInclude::get_picture_ids_for_post_id(post_id)));

    Self::with_claims(claims, query)
  }

  pub fn get_by_album_id(
    id: i32,
    claims: Option<Claims>,
  ) -> IntoBoxed<'static, pictures::table, Pg> {
    let mut query = Self::all().into_boxed();
    query = query.filter(pictures::id.eq_any(PictureAlbum::get_picture_ids_for_album_id(id)));
    if claims.is_none() {
      query = query.filter(pictures::access_type.eq(AccessTypeOld::Public.to_string()))
    }

    query
  }

  pub fn get_public_ids() -> GetPublicIds {
    pictures::table.filter(Self::public()).select(pictures::id)
  }

  pub fn get_shared_ids(user_id: i32) -> GetSharedIds {
    pictures::table
      .filter(Self::shared(user_id))
      .select(pictures::id)
  }

  fn with_claims<'a>(
    claims: Option<Claims>,
    query: IntoBoxed<'a, pictures::table, Pg>,
  ) -> IntoBoxed<'a, pictures::table, Pg> {
    match claims {
      None => query.filter(Self::public()),
      Some(claims) => match claims.role {
        Role::Admin => query,
        Role::User => query.filter(Self::shared(claims.user_id)),
      },
    }
  }

  fn public() -> EqPublic {
    pictures::access_type.eq(AccessTypeOld::Public.to_string())
  }
  fn shared(user_id: i32) -> EqShared {
    Self::public().or(pictures::id.eq_any(PictureUserAccess::get_picture_id_by_user_id(user_id)))
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
      original: PictureSizeApi {
        height: self.original_height,
        width: self.original_width,
        url: format!("/api/pictures/{}/original/", self.id),
      },

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

pub fn update_pictures_access(
  picture_ids: Vec<i32>,
  access_type: AccessTypeOld,
  db: &mut PooledConnection,
) -> Result<usize, diesel::result::Error> {
  diesel::update(pictures::table)
    .filter(pictures::id.eq_any(picture_ids))
    .set(pictures::access_type.eq(access_type.to_string()))
    .execute(db)
}
