use actix_web::{get, web, HttpRequest, HttpResponse};
use diesel::RunQueryDsl;

use crate::{
  cli_args::ServeArgs,
  database::{db_connection, Pool},
  errors::ServiceResult,
  jwt::{Claims, JwtKey, Role},
  models::user::User,
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

pub fn api_service(cfg: &mut web::ServiceConfig) {
  cfg
    .service(admin_jwt_gen_handler)
    .service(admin_users_handler);
}
