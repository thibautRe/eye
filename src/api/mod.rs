use actix_web::{get, web, HttpRequest, HttpResponse};
use diesel::RunQueryDsl;

use crate::{
  database::{db_connection, Pool},
  errors::ServiceResult,
  jwt::{Claims, JwtKey, Role},
  models::user::User,
};

#[get("/api/admin/jwt_gen")]
async fn admin_jwt_gen_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
) -> ServiceResult<HttpResponse> {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let claim = Claims {
    id: "1".into(),
    name: "Thibaut".into(),
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
) -> ServiceResult<HttpResponse> {
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
