mod handler;
pub mod model;
pub(crate) mod service;
pub mod util;

use crate::user::handler::{logout, me};
use actix_web::web;

pub fn _route(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .service(web::resource("/logout").route(web::get().to(logout)))
            .service(web::resource("/me").route(web::get().to(me))),
    );
}

pub use util::has_role;
