use jsonwebtoken::{
  decode, encode, errors::Result, Algorithm, DecodingKey, EncodingKey, TokenData, Validation,
};

use crate::user::model::Role;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
  pub exp: usize,

  pub id: String,
  pub name: String,
  pub role: Role,
}

impl Claims {
  pub fn encode(self, jwt_key: &JwtKey) -> Result<String> {
    encode(&Default::default(), &self, &jwt_key.encoding)
  }

  pub fn decode(token: &str, jwt_key: &JwtKey) -> Result<TokenData<Self>> {
    decode::<Self>(
      &token,
      &jwt_key.decoding,
      &Validation::new(Algorithm::HS256),
    )
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
