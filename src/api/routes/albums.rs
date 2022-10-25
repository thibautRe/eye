use actix_web::{delete, get, post, web, HttpRequest, HttpResponse, Scope};
use diesel::{Connection, RunQueryDsl};

use crate::{
  api::{
    pagination::{Paginate, PaginatedApi},
    utils::{complete_album, complete_albums},
    RouteResult,
  },
  database::{db_connection, Pool},
  errors::ServiceError,
  jwt::{Claims, JwtKey},
  models::{
    album::{update_album_date, Album},
    picture_album::{delete_pictures_album, PictureAlbumInsert},
  },
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

#[post("/{id}/pictures")]
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
  let items = picture_ids
    .into_iter()
    .map(|picture_id| PictureAlbumInsert {
      picture_id,
      album_id,
    })
    .collect();
  db.transaction::<_, ServiceError, _>(|db| {
    PictureAlbumInsert::insert_mul(&items, db)?;
    update_album_date(album_id, db)?;
    Ok(())
  })?;

  Ok(HttpResponse::Ok().finish())
}

#[delete("/{id}/pictures")]
async fn album_delete_picture_handler(
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

  db.transaction::<_, ServiceError, _>(|db| {
    delete_pictures_album(album_id, picture_ids, db)?;
    update_album_date(album_id, db)?;
    Ok(())
  })?;

  Ok(HttpResponse::Ok().finish())
}

pub fn album_routes() -> Scope {
  web::scope("/albums")
    .service(albums_handler)
    .service(album_handler)
    .service(album_add_pictures_handler)
    .service(album_delete_picture_handler)
}
