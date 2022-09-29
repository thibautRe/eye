use crate::schema::albums;
use chrono::NaiveDateTime;
use diesel::{dsl::*, prelude::*};

use super::picture::PictureApi;

#[derive(Debug, Queryable)]
pub struct Album {
  pub id: i32,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: NaiveDateTime,
  pub deleted_at: Option<NaiveDateTime>,
}

#[derive(Debug, Insertable)]
#[table_name = "albums"]
pub struct AlbumInsert {
  pub name: String,
  pub created_at: NaiveDateTime,
  pub edited_at: NaiveDateTime,
}

type All = albums::table;
type GetById = Filter<All, Eq<albums::id, i32>>;

impl Album {
  pub fn all() -> All {
    albums::table
  }
  pub fn get_by_id(id: i32) -> GetById {
    Album::all().filter(albums::id.eq(id))
  }

  pub fn into_api(self: Self, pictures: Vec<PictureApi>) -> AlbumApi {
    AlbumApi {
      id: self.id,
      name: self.name,
      created_at: self.created_at,
      updated_at: self.edited_at,
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
  /// Up to 20 pictures
  pub pictures_excerpt: Vec<PictureApi>,
}
