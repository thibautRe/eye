use actix_web::{get, web, HttpRequest, HttpResponse};

use crate::{
  errors::ServiceResult,
  jwt::{Claims, JwtKey},
  user::model::Role,
};

#[get("/api/admin/jwt_gen")]
pub async fn admin_jwt_gen_handler(
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
