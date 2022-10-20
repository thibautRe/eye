use crate::{
  jwt::{Claims, Role},
  schema::albums,
};
use chrono::NaiveDateTime;
use diesel::{dsl::*, pg::Pg, prelude::*};

use super::{
  picture::PictureApi,
  picture_album::{GetAlbumIdsWithPublicPictures, GetAlbumIdsWithSharedPictures, PictureAlbum},
};

#[derive(Debug, Queryable)]
pub struct Album {
  pub id: i32,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: NaiveDateTime,
  pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = albums)]
pub struct AlbumInsert {
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: NaiveDateTime,
}

type All = Order<albums::table, Asc<albums::created_at>>;

impl Album {
  pub fn all() -> All {
    albums::table.order(albums::created_at.asc())
  }

  pub fn get_filters(
    claims: Option<Claims>,
    album_id: Option<i32>,
  ) -> IntoBoxed<'static, albums::table, Pg> {
    let mut query = Self::all().into_boxed();

    if let Some(album_id) = album_id {
      query = query.filter(albums::id.eq(album_id));
    }

    query = match claims {
      None => query.filter(Self::with_public_pictures()),
      Some(claims) => match claims.role {
        Role::Admin => query,
        Role::User => query.filter(Self::with_shared_pictures(claims.user_id)),
      },
    };

    query
  }

  fn with_public_pictures() -> EqAny<albums::id, GetAlbumIdsWithPublicPictures> {
    albums::id.eq_any(PictureAlbum::get_album_ids_with_public_pictures())
  }

  fn with_shared_pictures(user_id: i32) -> EqAny<albums::id, GetAlbumIdsWithSharedPictures> {
    albums::id.eq_any(PictureAlbum::get_album_ids_with_shared_pictures(user_id))
  }

  pub fn into_api(self: Self, pictures: Vec<PictureApi>, pictures_amt: i64) -> AlbumApi {
    AlbumApi {
      id: self.id,
      name: self.name,
      created_at: self.created_at,
      updated_at: self.edited_at,
      pictures_amt,
      pictures_excerpt: pictures,
    }
  }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AlbumApi {
  pub id: i32,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
  pub pictures_amt: i64,
  /// Up to 5 pictures
  pub pictures_excerpt: Vec<PictureApi>,
}
