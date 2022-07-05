use crate::errors::ServiceError;
use crate::user::model::{LoggedUser, SlimUser};
use actix_identity::{Identity, RequestIdentity};
use actix_web::dev::Payload;
use actix_web::{Error, FromRequest, HttpRequest, HttpResponse};

impl FromRequest for LoggedUser {
    type Error = Error;
    type Future = futures::future::Ready<Result<Self, Self::Error>>;
    type Config = ();

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let identity = req.get_identity();

        let slim_user = if let Some(identity) = identity {
            match serde_json::from_str::<SlimUser>(&identity) {
                Err(e) => return futures::future::err(e.into()),
                Ok(y) => Ok(Some(y)),
            }
        } else {
            Ok(None)
        };

        futures::future::ready(slim_user.map(LoggedUser))
    }
}

#[derive(Debug, Deserialize)]
pub(super) struct LoginQuery {
    pub email: String,
    pub password: String,
}

pub fn me(logged_user: LoggedUser) -> HttpResponse {
    match logged_user.0 {
        None => HttpResponse::Unauthorized().json(ServiceError::Unauthorized),
        Some(user) => HttpResponse::Ok().json(user),
    }
}

pub fn logout(id: Identity) -> HttpResponse {
    id.forget();
    HttpResponse::Ok().finish()
}
