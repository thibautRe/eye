use actix_web::{http::header::AUTHORIZATION, HttpRequest};
use jsonwebtoken::{
  decode, encode, errors, Algorithm, DecodingKey, EncodingKey, TokenData, Validation,
};

use crate::errors::{ServiceError, ServiceResult};

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq)]
pub enum Role {
  #[serde(rename = "admin")]
  Admin,
  #[serde(rename = "user")]
  User,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Claims {
  pub exp: usize,

  pub user_id: i32,
  pub role: Role,
}

impl Claims {
  /// Generate a new Claim for a given user and role. The claims expires 6 months after this call.
  pub fn generate_new(user_id: i32, role: Role) -> Self {
    let expiration = chrono::Utc::now() + chrono::Duration::days(30 * 6);
    Self {
      user_id,
      role,
      exp: expiration.timestamp() as usize,
    }
  }

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
    if self.role == Role::Admin {
      return Ok(self);
    }
    Err(ServiceError::Unauthorized)
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
