use actix_web::{get, web, HttpRequest, HttpResponse, Scope};
use diesel::RunQueryDsl;

use crate::{
  api::{
    pagination::{Paginate, PaginatedApi},
    utils::{complete_picture, complete_pictures},
    RouteResult,
  },
  database::{db_connection, Pool},
  jwt::{Claims, JwtKey},
  models::picture::Picture,
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

pub fn pictures_routes() -> Scope {
  web::scope("/pictures")
    .service(pictures_handler)
    .service(picture_handler)
}
