use actix_web::{get, post, web, HttpRequest, HttpResponse, Scope};
use diesel::RunQueryDsl;

use crate::{
  api::RouteResult,
  cli_args::ServeArgs,
  database::{db_connection, Pool},
  errors::ServiceError,
  jwt::{Claims, JwtKey, Role},
  models::{
    picture_album::PictureAlbum,
    picture_user_access::PictureUserAccessInsert,
    user::{User, UserInsert},
  },
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
async fn user_create_handler(
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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UserPictureAccessCreate {
  user_ids: Vec<i32>,
  picture_ids: Option<Vec<i32>>,
  album_ids: Option<Vec<i32>>,
}

#[post("/picture_access/")]
async fn users_picture_access_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  data: web::Json<UserPictureAccessCreate>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;

  if data.0.picture_ids.is_some() && data.0.album_ids.is_some() {
    return Err(ServiceError::BadRequest(
      "Cannot specify both albumIds and pictureIds".to_string(),
    ));
  }

  let picture_ids: Vec<i32> = {
    if let Some(picture_ids) = data.0.picture_ids {
      Ok(picture_ids)
    } else if let Some(album_ids) = data.0.album_ids {
      PictureAlbum::get_picture_ids_for_album_ids(album_ids).load::<i32>(&mut db)
    } else {
      return Err(ServiceError::BadRequest(
        "Either pictureIds or albumIds need to be specified".to_string(),
      ));
    }
  }?;

  println!("{:?}", picture_ids);
  PictureUserAccessInsert::insert_mul(
    &PictureUserAccessInsert::from_picture_ids(data.0.user_ids, picture_ids),
    &mut db,
  )?;
  Ok(HttpResponse::Ok().finish())
}

pub fn user_routes() -> Scope {
  web::scope("/users")
    .service(users_handler)
    .service(user_jwt_handler)
    .service(user_create_handler)
    .service(users_picture_access_create_handler)
}
