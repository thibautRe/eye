use actix_web::{web, Scope};

use self::{albums::album_routes, pictures::pictures_routes, users::user_routes};

mod albums;
mod pictures;
mod users;

pub fn api_routes() -> Scope {
  web::scope("/api")
    .service(album_routes())
    .service(pictures_routes())
    .service(user_routes())
}
