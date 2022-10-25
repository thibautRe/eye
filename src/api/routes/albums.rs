use actix_web::{get, post, web, HttpRequest, HttpResponse, Scope};
use diesel::RunQueryDsl;

use crate::{
  api::{pagination::{Paginate, PaginatedApi}, RouteResult, utils::{complete_albums, complete_album}},
  database::{db_connection, Pool},
  jwt::{Claims, JwtKey},
  models::{album::Album, picture_album::PictureAlbumInsert},
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AlbumsRequest {
  page: Option<i64>,
  limit: Option<i64>,
}
#[get("/")]
async fn albums_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  query: web::Query<AlbumsRequest>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();

  let mut db = db_connection(&pool)?;
  let (albums, info) = Album::get_filters(claims, None)
    .paginate_option(query.page)
    .per_page(query.limit, 50)
    .load_and_count_pages::<Album>(&mut db)?;

  Ok(HttpResponse::Ok().json(PaginatedApi {
    items: complete_albums(albums, &mut db, claims)?,
    info,
  }))
}

#[get("/{id}")]
async fn album_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();
  let mut db = db_connection(&pool)?;
  let album_id = path.0;
  let album: Album = Album::get_filters(claims, Some(album_id)).first(&mut db)?;
  Ok(HttpResponse::Ok().json(complete_album(album, &mut db, claims)?))
}

#[post("/{id}/add_pictures")]
async fn album_add_pictures_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
  data: web::Json<Vec<i32>>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let album_id = path.0;
  let picture_ids = data.0;

  PictureAlbumInsert::insert_mul(
    &picture_ids
      .into_iter()
      .map(|picture_id| PictureAlbumInsert {
        picture_id,
        album_id,
      })
      .collect(),
    &mut db,
  )?;

  Ok(HttpResponse::Ok().finish())
}

pub fn album_routes() -> Scope {
  web::scope("/albums")
    .service(albums_handler)
    .service(album_handler)
    .service(album_add_pictures_handler)
}
