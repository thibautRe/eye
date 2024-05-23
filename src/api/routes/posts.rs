use crate::{
  api::{
    pagination::{Paginate, PaginatedApi},
    utils::{complete_post, complete_posts},
    RouteResult,
  },
  database::{db_connection, Pool},
  errors::ServiceError,
  jwt::{Claims, JwtKey},
  models::{
    post_includes::{delete_post_include_pictures, PostIncludeInsert},
    posts::{Post, PostContent, PostInsert},
  },
};
use actix_web::{get, post, put, web, HttpRequest, HttpResponse, Scope};
use diesel::{Connection, RunQueryDsl};

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
  title: String,
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
  let post =
    PostInsert::new(data.0.slug, data.0.title, data.0.content, claims.user_id).insert(&mut db)?;
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
  title: String,
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
  let picture_ids = data.content.extract_picture_ids();
  let post = db.transaction::<_, ServiceError, _>(|db| {
    let post = Post::update(&path.0, &data.title, &data.content, db)?;
    let inserts = PostIncludeInsert::from_picture_ids(post.id, picture_ids);
    delete_post_include_pictures(post.id, db)?;
    PostIncludeInsert::insert_mul(inserts, db)?;
    Ok(post)
  })?;

  Ok(HttpResponse::Ok().json(complete_post(post, &mut db, Some(claims))?))
}

pub fn posts_routes() -> Scope {
  web::scope("/posts")
    .service(posts_handler)
    .service(post_create_handler)
    .service(post_handler)
    .service(post_update_handler)
}
