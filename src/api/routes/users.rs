use actix_web::{get, post, web, HttpRequest, HttpResponse, Scope};
use diesel::RunQueryDsl;

use crate::{
  api::RouteResult,
  cli_args::ServeArgs,
  database::{db_connection, Pool},
  jwt::{Claims, JwtKey, Role},
  models::user::{User, UserInsert},
};

#[get("/")]
async fn users_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let users: Vec<User> = User::get_all().load(&mut db)?;
  Ok(HttpResponse::Ok().json(users))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateUserRequest {
  pub email: String,
  pub name: String,
}

#[post("/")]
async fn create_user_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  data: web::Json<CreateUserRequest>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let now = chrono::Local::now().naive_local();
  let insert = UserInsert {
    email: data.0.email,
    name: data.0.name,
    created_at: now,
    updated_at: now,
  };
  let user = insert.insert(&mut db)?;
  Ok(HttpResponse::Ok().json(user))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct JwtGenRequest {
  pub with_admin_role: bool,
}
#[get("/{id}/jwt")]
async fn user_jwt_handler(
  jwt_key: web::Data<JwtKey>,
  options: web::Data<ServeArgs>,
  req: HttpRequest,
  path: web::Path<(i32,)>,
  query: web::Query<JwtGenRequest>,
) -> RouteResult {
  if !options.unsafe_no_jwt_checks {
    Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  }
  let user_id = path.0;
  let role = match query.with_admin_role {
    true => Role::Admin,
    false => Role::User,
  };
  let claims = Claims::generate_new(user_id, role);
  Ok(HttpResponse::Ok().body(claims.encode(&jwt_key)?))
}

pub fn user_routes() -> Scope {
  web::scope("/users")
    .service(users_handler)
    .service(user_jwt_handler)
    .service(create_user_handler)
}
