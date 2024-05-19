use crate::{
  api::{
    pagination::{Paginate, PaginatedApi},
    utils::{complete_post, complete_posts},
    RouteResult,
  },
  database::{db_connection, Pool},
  jwt::{Claims, JwtKey},
  models::posts::{Post, PostContent, PostInsert},
};
use actix_web::{get, post, put, web, HttpRequest, HttpResponse, Scope};
use diesel::RunQueryDsl;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PostsRequest {
  page: Option<i64>,
  limit: Option<i64>,
}
#[get("/")]
async fn posts_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  query: web::Query<PostsRequest>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();

  let mut db = db_connection(&pool)?;

  let (posts, info) = Post::get_filters(claims, None)
    .paginate_option(query.page)
    .per_page(query.limit, 50)
    .load_and_count_pages::<Post>(&mut db)?;

  Ok(HttpResponse::Ok().json(PaginatedApi {
    items: complete_posts(posts, &mut db, claims)?,
    info,
  }))
}

#[derive(Deserialize)]
struct PostCreate {
  slug: String,
  content: Option<PostContent>,
}
#[post("/")]
async fn post_create_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  data: web::Json<PostCreate>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  let post = PostInsert::new(data.0.slug, data.0.content, claims.user_id).insert(&mut db)?;
  Ok(HttpResponse::Ok().json(complete_post(post, &mut db, Some(claims))?))
}

#[get("/{slug}/")]
async fn post_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(String,)>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key).ok();

  let mut db = db_connection(&pool)?;
  let post: Post = Post::get_filters(claims, Some(path.0.clone())).first(&mut db)?;
  Ok(HttpResponse::Ok().json(complete_post(post, &mut db, claims)?))
}

#[derive(Deserialize)]
struct PostUpdate {
  content: PostContent,
}
#[put("/{slug}/")]
async fn post_update_handler(
  jwt_key: web::Data<JwtKey>,
  req: HttpRequest,
  pool: web::Data<Pool>,
  path: web::Path<(String,)>,
  data: web::Json<PostUpdate>,
) -> RouteResult {
  let claims = Claims::from_request(&req, &jwt_key)?.assert_admin()?;
  let mut db = db_connection(&pool)?;
  // TODO update DB

  let post: Post = Post::update_content(path.0.clone(), &data.content, &mut db)?;
  Ok(HttpResponse::Ok().json(complete_post(post, &mut db, Some(claims))?))
}

pub fn posts_routes() -> Scope {
  web::scope("/posts")
    .service(posts_handler)
    .service(post_create_handler)
    .service(post_handler)
    .service(post_update_handler)
}
