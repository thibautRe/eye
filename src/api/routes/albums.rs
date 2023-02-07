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
    album::{soft_delete_album, update_album_date, Album, AlbumApi, AlbumInsert},
    picture::update_pictures_access,
    picture_album::{delete_pictures_album, PictureAlbum, PictureAlbumInsert},
    picture_user_access::{delete_pictures_user_access, insert_pictures_user_access},
    AccessType,
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

  // prevent albums from being seen in public
  if claims.is_none() {
    return Ok(HttpResponse::Ok().json(PaginatedApi::<AlbumApi>::empty()));
  };

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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AlbumCreate {
  name: String,
}

#[post("/")]
async fn album_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  data: web::Json<AlbumCreate>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let album = AlbumInsert::new(data.0.name).insert(&mut db)?;
  Ok(HttpResponse::Ok().json(complete_album(album, &mut db, Some(claims))))
}

#[get("/{id}")]
async fn album_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();

  // prevent albums from being seen in public
  if claims.is_none() {
    return Err(ServiceError::NotFound);
  };

  let mut db = db_connection(&pool)?;
  let album_id = path.0;
  let album: Album = Album::get_filters(claims, Some(album_id)).first(&mut db)?;
  Ok(HttpResponse::Ok().json(complete_album(album, &mut db, claims)?))
}

#[delete("/{id}")]
async fn album_delete_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let album_id = path.0;
  soft_delete_album(album_id, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[post("/{id}/pictures/")]
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

#[delete("/{id}/pictures/")]
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

#[post("/{id}/user_access/")]
async fn album_user_access_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
  data: web::Json<Vec<i32>>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;

  let album_id = path.0;
  let user_ids = data.0;
  let picture_ids = PictureAlbum::get_picture_ids_for_album_id(album_id).load::<i32>(&mut db)?;
  insert_pictures_user_access(picture_ids, user_ids, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[delete("/{id}/user_access/")]
async fn album_user_access_delete_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
  data: web::Json<Vec<i32>>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;

  let album_id = path.0;
  let user_ids = data.0;
  let picture_ids = PictureAlbum::get_picture_ids_for_album_id(album_id).load::<i32>(&mut db)?;
  delete_pictures_user_access(picture_ids, user_ids, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[post("/{id}/public_access/")]
async fn album_public_access_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let picture_ids = PictureAlbum::get_picture_ids_for_album_id(path.0).load::<i32>(&mut db)?;
  update_pictures_access(picture_ids, AccessType::Public, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[delete("/{id}/public_access/")]
async fn album_public_access_delete_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let picture_ids = PictureAlbum::get_picture_ids_for_album_id(path.0).load::<i32>(&mut db)?;
  update_pictures_access(picture_ids, AccessType::Private, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

pub fn album_routes() -> Scope {
  web::scope("/albums")
    .service(albums_handler)
    .service(album_create_handler)
    .service(album_delete_handler)
    .service(album_handler)
    .service(album_add_pictures_handler)
    .service(album_delete_picture_handler)
    .service(album_user_access_create_handler)
    .service(album_user_access_delete_handler)
    .service(album_public_access_create_handler)
    .service(album_public_access_delete_handler)
}
