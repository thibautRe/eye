use actix_web::{web, Scope};

mod albums;
mod pictures;
mod posts;
mod users;

pub fn api_routes() -> Scope {
  web::scope("/api")
    .service(albums::album_routes())
    .service(pictures::pictures_routes())
    .service(posts::posts_routes())
    .service(users::user_routes())
}
