use crate::user::model::LoggedUser;
use actix_web::dev::Payload;
use actix_web::{Error, FromRequest, HttpRequest};

impl FromRequest for LoggedUser {
  type Error = Error;
  type Future = futures::future::Ready<Result<Self, Self::Error>>;

  fn from_request(_req: &HttpRequest, _: &mut Payload) -> Self::Future {
    futures::future::ready(Ok(LoggedUser(None)))
    // let identity = req.get_identity();

    // let slim_user = if let Some(identity) = identity {
    //     match serde_json::from_str::<SlimUser>(&identity) {
    //         Err(e) => return futures::future::err(e.into()),
    //         Ok(y) => Ok(Some(y)),
    //     }
    // } else {
    //     Ok(None)
    // };

    // futures::future::ready(slim_user.map(LoggedUser))
  }
}
