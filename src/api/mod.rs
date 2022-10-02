use std::collections::HashMap;

use actix_web::{get, web, HttpRequest, HttpResponse};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};

use crate::{
  cli_args::ServeArgs,
  database::{db_connection, Pool, PooledConnection},
  errors::{ServiceError, ServiceResult},
  jwt::{Claims, JwtKey, Role},
  models::{
    album::Album,
    camera_lenses::CameraLens,
    picture::{Picture, PictureApi},
    picture_album::PictureAlbum,
    picture_size::PictureSize,
    user::User,
    AccessType,
  },
  schema::{picture_albums, pictures},
};

type RouteResult = ServiceResult<HttpResponse>;

fn complete_picture(picture: Picture, db_pool: &mut PooledConnection) -> ServiceResult<PictureApi> {
  let picture_sizes: Vec<PictureSize> = PictureSize::get_by_picture_id(picture.id).load(db_pool)?;
  let lens: Option<CameraLens> = picture
    .shot_by_camera_lens_id
    .map(|id| CameraLens::get_by_id(id).first(db_pool))
    .transpose()?;
  Ok(picture.into_api_full(picture_sizes, lens))
}

fn complete_pictures(
  pictures: Vec<Picture>,
  db_pool: &mut PooledConnection,
) -> ServiceResult<Vec<PictureApi>> {
  let picture_ids: Vec<i32> = pictures.iter().map(|p| p.id).collect();
  let picture_sizes: Vec<PictureSize> =
    PictureSize::get_by_picture_ids(picture_ids.clone()).load(db_pool)?;
  let lenses: Vec<CameraLens> = CameraLens::get_by_ids(picture_ids).load(db_pool)?;
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

#[get("/api/admin/jwt_gen")]
async fn admin_jwt_gen_handler(
  jwt_key: web::Data<JwtKey>,
  options: web::Data<ServeArgs>,
  req: HttpRequest,
) -> RouteResult {
  if !options.unsafe_no_jwt_checks {
    Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  }
  let claim = Claims {
    user_id: 1,
    role: Role::Admin,
    exp: 1689528095,
  };
  Ok(HttpResponse::Ok().body(claim.encode(&jwt_key)?))
}

#[get("/api/admin/users")]
async fn admin_users_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db_pool = db_connection(&pool)?;
  let users: Vec<User> = User::get_all().load(&mut db_pool)?;
  Ok(HttpResponse::Ok().json(users))
}

#[get("/api/pictures")]
async fn pictures_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
) -> RouteResult {
  let claim = Claims::from_request(&req, &jwt_key).ok();
  let mut db_pool = db_connection(&pool)?;
  let pictures = match claim {
    None => Picture::get_all_public().load::<Picture>(&mut db_pool)?,
    Some(_c) => Picture::all().load::<Picture>(&mut db_pool)?,
  };

  Ok(HttpResponse::Ok().json(complete_pictures(pictures, &mut db_pool)?))
}

#[get("/api/picture/{id}")]
async fn picture_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  let claim = Claims::from_request(&req, &jwt_key).ok();
  let mut db_pool = db_connection(&pool)?;
  let picture = Picture::get_by_id(path.0).first::<Picture>(&mut db_pool)?;

  // Identity check
  if claim.is_none() && picture.access_type != AccessType::Public {
    return Err(ServiceError::Unauthorized);
  }

  Ok(HttpResponse::Ok().json(complete_picture(picture, &mut db_pool)?))
}

// TODO: unstable
#[get("/api/albums")]
async fn albums_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?;
  let mut db_pool = db_connection(&pool)?;
  let albums = Album::all().load::<Album>(&mut db_pool)?;
  let album_ids: Vec<i32> = albums.iter().map(|a| a.id).collect();
  let _res = picture_albums::table
    .filter(picture_albums::album_id.eq_any(album_ids))
    .inner_join(pictures::table)
    .load::<(PictureAlbum, Picture)>(&mut db_pool);
  let _query: Vec<(Album, Option<PictureAlbum>)> = Album::all()
    .left_join(picture_albums::table)
    .load(&mut db_pool)?;
  Ok(HttpResponse::Ok().finish())
}

#[get("/api/album/{id}")]
async fn album_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  // TODO identity check
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db_pool = db_connection(&pool)?;
  let album_db: Album = Album::get_by_id(path.0).first(&mut db_pool)?;
  let pictures = Picture::get_by_album_id(path.0).load::<Picture>(&mut db_pool)?;

  Ok(HttpResponse::Ok().json(album_db.into_api(complete_pictures(pictures, &mut db_pool)?)))
}

pub fn api_service(cfg: &mut web::ServiceConfig) {
  cfg
    .service(admin_jwt_gen_handler)
    .service(admin_users_handler)
    .service(pictures_handler)
    .service(picture_handler)
    .service(album_handler)
    .service(albums_handler);
}
