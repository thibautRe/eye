#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

mod cli_args;
mod database;
mod errors;
mod jwt;
mod models;
mod schema;
mod user;

use actix_web::http::header::AUTHORIZATION;
use actix_web::middleware::Logger;
use actix_web::web::Data;
use actix_web::{web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use jwt::{Claims, JwtKey};
use user::model::Role;

fn get_jwt(req: &HttpRequest, key: &JwtKey) -> Option<Claims> {
  let authorization = req.headers().get(AUTHORIZATION);
  if authorization.is_none() {
    println!("JWT: No authorization");
    return None;
  }
  let decoded = Claims::decode(authorization.unwrap().to_str().unwrap(), &key);
  if decoded.is_err() {
    println!("JWT: Decoding error: {}", decoded.err().unwrap());
    return None;
  }
  Some(decoded.unwrap().claims)
}

async fn jwt_gen_route(jwt_key: web::Data<JwtKey>, req: HttpRequest) -> impl Responder {
  let jwt = get_jwt(&req, &jwt_key);
  if jwt.is_none() || jwt.unwrap().role != Role::Admin {
    return HttpResponse::Forbidden().finish();
  }
  let claim = Claims {
    id: "1".into(),
    name: "Thibaut".into(),
    role: Role::Admin,
    exp: 1689528095,
  };
  HttpResponse::Ok().body(claim.encode(&jwt_key).unwrap())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  // Gets environment variables from `.env.example`
  dotenv::dotenv().ok();

  // Initiates error logger
  env_logger::init();

  // Sets options to environment variables
  let opt = {
    use structopt::StructOpt;
    cli_args::Opt::from_args()
  };

  // Database
  let pool = database::pool::establish_connection(opt.clone());

  // Server port
  let host = opt.host.clone();
  let port = opt.port;

  let jwt_key = JwtKey::from_secret(opt.jwt_secret.as_ref());

  // Server
  let server = HttpServer::new(move || {
    // prevents double Arc

    App::new()
      // Database
      .app_data(Data::new(pool.clone()))
      // Options
      .app_data(Data::new(opt.clone()))
      .app_data(Data::new(jwt_key.clone()))
      // Error logging
      .wrap(Logger::default())
      .route("/api/jwt_gen", web::get().to(jwt_gen_route))
    // authorization
    // .wrap(IdentityService::new(
    //     CookieIdentityPolicy::new(cookie_secret_key.as_bytes())
    //         .name("auth")
    //         .path("/")
    //         .domain(&domain)
    //         // Time from creation that cookie remains valid
    //         .max_age_time(auth_duration)
    //         // Restricted to https?
    //         .secure(secure_cookie),
    // ))
    // Sets routes via secondary files
    // .configure(user::route)
    // .configure(graphql::route)
  })
  // Running at `format!("{}:{}",port,"0.0.0.0")`
  .bind((host.clone(), port))
  .unwrap()
  // Starts server
  .run();

  eprintln!("Listening on {}:{}", host, port);

  // Awaiting server to exit
  server.await
}
