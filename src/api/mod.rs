use actix_web::HttpResponse;

use crate::errors::ServiceResult;
pub use routes::api_routes;

mod pagination;
mod routes;
mod utils;

type RouteResult = ServiceResult<HttpResponse>;
