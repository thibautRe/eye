use actix_web::{http::header::AUTHORIZATION, HttpRequest};
use jsonwebtoken::{
  decode, encode, errors, Algorithm, DecodingKey, EncodingKey, TokenData, Validation,
};

use crate::{
  errors::{ServiceError, ServiceResult},
  user::model::Role,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  pub exp: usize,

  pub id: String,
  pub name: String,
  pub role: Role,
}

impl Claims {
  pub fn encode(self, jwt_key: &JwtKey) -> errors::Result<String> {
    encode(&Default::default(), &self, &jwt_key.encoding)
  }

  pub fn decode(token: &str, jwt_key: &JwtKey) -> errors::Result<TokenData<Self>> {
    decode::<Self>(
      &token,
      &jwt_key.decoding,
      &Validation::new(Algorithm::HS256),
    )
  }

  pub fn from_request(req: &HttpRequest, key: &JwtKey) -> ServiceResult<Self> {
    let authorization = req
      .headers()
      .get(AUTHORIZATION)
      .ok_or(ServiceError::Unauthorized)?;
    let decoded = Claims::decode(
      authorization
        .to_str()
        .map_err(|op| ServiceError::InternalServerError(op.to_string()))?,
      &key,
    )?;
    Ok(decoded.claims)
  }

  pub fn assert_admin(self) -> ServiceResult<Self> {
    if self.role != Role::Admin {
      Err(ServiceError::Unauthorized)
    } else {
      Ok(self)
    }
  }
}

#[derive(Clone)]
pub struct JwtKey {
  pub encoding: EncodingKey,
  pub decoding: DecodingKey,
}

impl JwtKey {
  pub fn from_secret(secret: &[u8]) -> Self {
    Self {
      encoding: EncodingKey::from_secret(secret),
      decoding: DecodingKey::from_secret(secret),
    }
  }
}
