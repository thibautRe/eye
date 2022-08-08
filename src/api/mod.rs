use actix_web::{get, web, HttpRequest, HttpResponse};
use diesel::{QueryDsl, RunQueryDsl};

use crate::{
  cli_args::ServeArgs,
  database::{db_connection, Pool},
  errors::ServiceResult,
  jwt::{Claims, JwtKey, Role},
  models::{
    picture::{Picture, PictureApiFull},
    picture_size::{PictureSize, PictureSizeApi},
    user::User,
  },
  schema::picture_sizes,
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
  let db_pool = db_connection(&pool)?;
  let users: Vec<User> = User::get_all().load(&db_pool)?;
  Ok(HttpResponse::Ok().json(users))
}

#[get("/api/pictures")]
async fn pictures_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?;
  let db_pool = db_connection(&pool)?;
  let pictures_db: Vec<(Picture, Option<PictureSize>)> = Picture::all()
    .left_join(picture_sizes::table)
    .load(&db_pool)?;

  let mut pictures_api: Vec<PictureApiFull> = Vec::new();
  for (picture, size) in pictures_db.into_iter() {
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
        pictures_api.push(picture.into_api_full(size_vec));
      }
    } else {
      pictures_api.push(picture.into_api_full(size_vec));
    }
  }

  Ok(HttpResponse::Ok().json(pictures_api))
}

pub fn api_service(cfg: &mut web::ServiceConfig) {
  cfg
    .service(admin_jwt_gen_handler)
    .service(admin_users_handler)
    .service(pictures_handler);
}
