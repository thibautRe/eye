use actix_web::{get, web, HttpRequest, HttpResponse};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};

use crate::{
  cli_args::ServeArgs,
  database::{db_connection, Pool},
  errors::ServiceResult,
  jwt::{Claims, JwtKey, Role},
  models::{
    camera_lenses::CameraLens,
    picture::{Picture, PictureApi},
    picture_size::{PictureSize, PictureSizeApi},
    user::User,
    AccessType,
  },
  schema::{camera_lenses, picture_sizes, pictures},
};

type RouteResult = ServiceResult<HttpResponse>;

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
  let pictures_db: Vec<(Picture, Option<CameraLens>, Option<PictureSize>)> = match claim {
    None => Picture::all()
      .filter(pictures::access_type.eq("public"))
      .left_join(camera_lenses::table)
      .left_join(picture_sizes::table)
      .load(&mut db_pool)?,
    Some(_c) => Picture::all()
      .left_join(camera_lenses::table)
      .left_join(picture_sizes::table)
      .load(&mut db_pool)?,
  };

  Ok(HttpResponse::Ok().json(arrange_picture_data(pictures_db)))
}

fn arrange_picture_data(
  pictures_db: Vec<(Picture, Option<CameraLens>, Option<PictureSize>)>,
) -> Vec<PictureApi> {
  let mut pictures_api: Vec<PictureApi> = Vec::new();
  for (picture, lens, size) in pictures_db.into_iter() {
    let prev_index = { pictures_api.len() };
    let prev_pic_api = match prev_index {
      0 => None,
      _ => pictures_api.get_mut(prev_index - 1),
    };

    let size_vec = size.map_or(Vec::new(), |s| vec![s]);
    if let Some(prev_pic) = prev_pic_api {
      if prev_pic.id == picture.id && size_vec.len() == 1 {
        let s = size_vec[0].clone();
        prev_pic.sizes.push(PictureSizeApi::from(s));
      } else {
        pictures_api.push(picture.into_api_full(size_vec, lens));
      }
    } else {
      pictures_api.push(picture.into_api_full(size_vec, lens));
    }
  }
  pictures_api
}

#[get("/api/picture/{id}")]
async fn picture_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(u32,)>,
) -> RouteResult {
  let claim = Claims::from_request(&req, &jwt_key).ok();
  let mut db_pool = db_connection(&pool)?;
  let pictures_db: Vec<(Picture, Option<CameraLens>, Option<PictureSize>)> =
    Picture::get_by_id(path.0 as i32)
      .left_join(camera_lenses::table)
      .left_join(picture_sizes::table)
      .load(&mut db_pool)?;

  // Identity check
  if claim.is_none() {
    let pic = pictures_db.get(0);
    if let Some(p) = pic {
      if p.0.access_type != AccessType::Public {
        return Ok(HttpResponse::Unauthorized().finish());
      }
    }
  }

  let pic_apis = arrange_picture_data(pictures_db);
  let picture_api = pic_apis.get(0);
  match picture_api {
    None => Ok(HttpResponse::NotFound().finish()),
    Some(pic) => Ok(HttpResponse::Ok().json(pic)),
  }
}

pub fn api_service(cfg: &mut web::ServiceConfig) {
  cfg
    .service(admin_jwt_gen_handler)
    .service(admin_users_handler)
    .service(pictures_handler)
    .service(picture_handler);
}
