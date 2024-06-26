use actix_multipart::form::{tempfile::TempFile, MultipartForm};
use actix_web::{delete, get, post, web, HttpRequest, HttpResponse, Scope};
use diesel::RunQueryDsl;
use std::path::Path;

use crate::{
  api::{
    pagination::{Paginate, PaginatedApi},
    utils::{complete_picture, complete_pictures},
    RouteResult,
  },
  cli_args::Opt,
  database::{db_connection, Pool},
  errors::ServiceError,
  extract_pictures::extract_pictures,
  jwt::{Claims, JwtKey},
  models::{
    picture::{update_pictures_access, Picture},
    picture_user_access::{delete_pictures_user_access, insert_pictures_user_access},
    user::User,
    AccessTypeOld,
  },
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PicturesRequest {
  album_id: Option<i32>,
  not_album_id: Option<i32>,
  page: Option<i64>,
  limit: Option<i64>,
}
#[get("/")]
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

#[get("/{id}")]
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
struct PictureOriginalRequest {
  b: String,
}
#[get("/{id}/original/")]
async fn picture_original_handler(
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
  query: web::Query<PictureOriginalRequest>,
) -> RouteResult {
  let mut db = db_connection(&pool)?;
  let picture = Picture::get_by_id(path.0).first::<Picture>(&mut db)?;
  if picture.blurhash != query.b {
    return Err(ServiceError::NotFound);
  }
  let file = actix_files::NamedFile::open_async(picture.original_file_path)
    .await
    .unwrap();
  Ok(file.into_response(&req))
}

#[derive(Debug, MultipartForm)]
struct PictureUploadForm {
  files: Vec<TempFile>,
}
#[post("/upload/")]
async fn picture_upload_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  opt: web::Data<Opt>,
  MultipartForm(form): MultipartForm<PictureUploadForm>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  for f in form.files {
    let file_name = format!(
      "{}-{}",
      rand::random::<u32>().to_string(),
      f.file_name.unwrap_or("file.jpg".into())
    );
    let path = Path::new(&opt.extract_from).join(file_name);
    f.file.persist(path).unwrap();
  }
  extract_pictures(opt.as_ref(), &mut db)
    .map_err(|_| ServiceError::InternalServerError("Cannot extract pictures".to_string()))?;

  Ok(HttpResponse::Ok().finish())
}

#[get("/{id}/user_access/")]
async fn picture_user_access_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let picture_id = path.0;
  let users = User::get_by_picture_access(picture_id).load::<User>(&mut db)?;
  Ok(HttpResponse::Ok().json(users))
}

#[post("/{id}/user_access/")]
async fn picture_user_access_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
  data: web::Json<Vec<i32>>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;

  let picture_ids = vec![path.0];
  let user_ids = data.0;
  insert_pictures_user_access(picture_ids, user_ids, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[delete("/{id}/user_access/")]
async fn picture_user_access_delete_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
  data: web::Json<Vec<i32>>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;

  let picture_ids = vec![path.0];
  let user_ids = data.0;
  delete_pictures_user_access(picture_ids, user_ids, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[get("/{id}/public_access/")]
async fn picture_public_access_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let picture = Picture::get_by_id(path.0).first::<Picture>(&mut db)?;
  Ok(HttpResponse::Ok().json(picture.access_type == AccessTypeOld::Public))
}

#[post("/{id}/public_access/")]
async fn picture_public_access_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  update_pictures_access(vec![path.0], AccessTypeOld::Public, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

#[delete("/{id}/public_access/")]
async fn picture_public_access_delete_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(i32,)>,
) -> RouteResult {
  Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  update_pictures_access(vec![path.0], AccessTypeOld::Private, &mut db)?;
  Ok(HttpResponse::Ok().finish())
}

pub fn pictures_routes() -> Scope {
  web::scope("/pictures")
    .service(pictures_handler)
    .service(picture_handler)
    .service(picture_original_handler)
    .service(picture_upload_handler)
    .service(picture_user_access_handler)
    .service(picture_user_access_create_handler)
    .service(picture_user_access_delete_handler)
    .service(picture_public_access_handler)
    .service(picture_public_access_create_handler)
    .service(picture_public_access_delete_handler)
}
