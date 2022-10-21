use std::collections::HashMap;

use actix_web::{get, post, web, HttpRequest, HttpResponse};
use diesel::RunQueryDsl;

use crate::{
  api::pagination::{Paginate, PaginatedApi},
  cli_args::ServeArgs,
  database::{db_connection, Pool, PooledConnection},
  errors::ServiceResult,
  jwt::{Claims, JwtKey, Role},
  models::{
    album::{Album, AlbumApi},
    camera_lenses::CameraLens,
    picture::{Picture, PictureApi},
    picture_album::PictureAlbumInsert,
    picture_size::PictureSize,
    user::User,
  },
};

mod pagination;

type RouteResult = ServiceResult<HttpResponse>;

fn complete_picture(picture: Picture, db: &mut PooledConnection) -> ServiceResult<PictureApi> {
  let picture_sizes: Vec<PictureSize> = PictureSize::get_by_picture_id(picture.id).load(db)?;
  let lens: Option<CameraLens> = picture
    .shot_by_camera_lens_id
    .map(|id| CameraLens::get_by_id(id).first(db))
    .transpose()?;
  Ok(picture.into_api_full(picture_sizes, lens))
}

fn complete_pictures(
  pictures: Vec<Picture>,
  db: &mut PooledConnection,
) -> ServiceResult<Vec<PictureApi>> {
  let picture_ids: Vec<i32> = pictures.iter().map(|p| p.id).collect();
  let picture_sizes: Vec<PictureSize> =
    PictureSize::get_by_picture_ids(picture_ids.clone()).load(db)?;
  let lenses: Vec<CameraLens> = CameraLens::get_by_ids(picture_ids).load(db)?;
  let lenses_by_id: HashMap<i32, CameraLens> = lenses.into_iter().map(|l| (l.id, l)).collect();
  Ok(
    pictures
      .into_iter()
      .map(|p| {
        let picture_id = p.id;
        let shot_by_camera_lens_id = p.shot_by_camera_lens_id;
        p.into_api_full(
          picture_sizes
            .iter()
            .filter(|&s| s.picture_id == picture_id)
            .map(|s| s.clone())
            .collect(),
          shot_by_camera_lens_id
            .map(|id| lenses_by_id.get(&id).map(|l| l.clone()))
            .flatten(),
        )
      })
      .collect(),
  )
}

fn complete_album(
  album: Album,
  db: &mut PooledConnection,
  claims: Option<Claims>,
) -> ServiceResult<AlbumApi> {
  let album_id = album.id;
  let (pictures_excerpt, info) = Picture::get_filters(claims, None, Some(album_id), None)
    .paginate_first_page()
    .per_page_fixed(5)
    .load_and_count_pages::<Picture>(db)?;
  Ok(album.into_api(complete_pictures(pictures_excerpt, db)?, info.total_count))
}

// TODO perf - this can be improved by changing the db querying strategy to instead
// query everything upfront instead of calling `complete_album` for each album.
// Similar to how `complete_pictures` doesn't call `complete_picture`.
fn complete_albums(
  albums: Vec<Album>,
  db: &mut PooledConnection,
  claims: Option<Claims>,
) -> ServiceResult<Vec<AlbumApi>> {
  albums
    .into_iter()
    .map(|a| complete_album(a, db, claims))
    .collect()
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct JwtGenRequest {
  pub user_id: i32,
  pub with_admin_role: bool,
}
#[get("/api/admin/jwt_gen")]
async fn admin_jwt_gen_handler(
  jwt_key: web::Data<JwtKey>,
  options: web::Data<ServeArgs>,
  req: HttpRequest,
  query: web::Query<JwtGenRequest>,
) -> RouteResult {
  if !options.unsafe_no_jwt_checks {
    Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  }
  let role = match query.with_admin_role {
    true => Role::Admin,
    false => Role::User,
  };
  let claims = Claims::generate_new(query.user_id, role);
  Ok(HttpResponse::Ok().body(claims.encode(&jwt_key)?))
}

#[get("/api/admin/users")]
async fn admin_users_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let users: Vec<User> = User::get_all().load(&mut db)?;
  Ok(HttpResponse::Ok().json(users))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PicturesRequest {
  album_id: Option<i32>,
  not_album_id: Option<i32>,
  page: Option<i64>,
  limit: Option<i64>,
}

#[get("/api/pictures")]
async fn pictures_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  query: web::Query<PicturesRequest>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();
  let mut db = db_connection(&pool)?;

  let (pictures, info) = Picture::get_filters(claims, None, query.album_id, query.not_album_id)
    .paginate_option(query.page)
    .per_page(query.limit, 50)
    .load_and_count_pages::<Picture>(&mut db)?;

  Ok(HttpResponse::Ok().json(PaginatedApi {
    items: complete_pictures(pictures, &mut db)?,
    info,
  }))
}

#[get("/api/picture/{id}")]
async fn picture_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();
  let mut db = db_connection(&pool)?;
  let picture = Picture::get_filters(claims, Some(path.0), None, None).first::<Picture>(&mut db)?;

  Ok(HttpResponse::Ok().json(complete_picture(picture, &mut db)?))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AlbumsRequest {
  page: Option<i64>,
  limit: Option<i64>,
}
#[get("/api/albums")]
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

#[get("/api/album/{id}")]
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

#[post("/api/album/{id}/add_pictures")]
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

pub fn api_service(cfg: &mut web::ServiceConfig) {
  cfg
    .service(admin_jwt_gen_handler)
    .service(admin_users_handler)
    .service(pictures_handler)
    .service(picture_handler)
    .service(album_handler)
    .service(album_add_pictures_handler)
    .service(albums_handler);
}
