#[macro_use]
extern crate diesel;
#[macro_use]
extern crate serde_derive;

mod cli_args;
mod database;
mod errors;
mod graphql;
// mod jwt;
mod schema;
mod user;

use actix_web::middleware::Logger;
use actix_web::{web, App, HttpServer};

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
    let schema = std::sync::Arc::new(crate::graphql::model::create_schema());

    // Server port
    let host = opt.host.clone();
    let port = opt.port;

    // Server
    let server = HttpServer::new(move || {
        // prevents double Arc
        let schema: web::Data<graphql::model::Schema> = schema.clone().into();

        App::new()
            // Database
            .data(pool.clone())
            .app_data(schema)
            // Options
            .data(opt.clone())
            // Error logging
            .wrap(Logger::default())
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
            .configure(graphql::route)
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
