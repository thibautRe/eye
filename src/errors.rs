use actix_web::{error::ResponseError, HttpResponse};
use diesel::result::Error as DBError;
use std::convert::From;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
pub enum ServiceError {
  #[error("Internal Server Error")]
  InternalServerError(String),

  #[error("BadRequest: {0}")]
  BadRequest(String),

  #[error("Unauthorized")]
  Unauthorized,

  #[error("Not Found")]
  NotFound,

  #[error("Unable to connect to DB")]
  UnableToConnectToDb,
}

// impl ResponseError trait allows to convert our errors into http responses with appropriate data
impl ResponseError for ServiceError {
  fn error_response(&self) -> HttpResponse {
    match self {
      ServiceError::InternalServerError(_) => {
        HttpResponse::InternalServerError().json("Internal Server Error, Please try later")
      }
      ServiceError::UnableToConnectToDb => {
        HttpResponse::InternalServerError().json("Unable to connect to DB, Please try later")
      }
      ServiceError::NotFound => HttpResponse::NotFound().json("Not Found"),
      ServiceError::BadRequest(ref message) => HttpResponse::BadRequest().json(message),
      ServiceError::Unauthorized => HttpResponse::Unauthorized().json("Unauthorized"),
    }
  }
}

impl From<jsonwebtoken::errors::Error> for ServiceError {
  fn from(err: jsonwebtoken::errors::Error) -> ServiceError {
    ServiceError::InternalServerError(err.to_string())
  }
}

impl From<DBError> for ServiceError {
  fn from(error: DBError) -> ServiceError {
    match error {
      DBError::NotFound => ServiceError::NotFound,
      DBError::DatabaseError(_kind, info) => {
        let message = info.details().unwrap_or_else(|| info.message()).to_string();
        ServiceError::BadRequest(message)
      }
      _ => ServiceError::UnableToConnectToDb,
    }
  }
}

pub type ServiceResult<V> = std::result::Result<V, crate::errors::ServiceError>;
