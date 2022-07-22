use crate::errors::{ServiceError, ServiceResult};
use diesel::r2d2;

type ConnectionManager = r2d2::ConnectionManager<diesel::pg::PgConnection>;
pub type Pool = r2d2::Pool<ConnectionManager>;
pub type PooledConnection = r2d2::PooledConnection<ConnectionManager>;

pub fn create_pool(database_url: &str) -> Pool {
  Pool::builder()
    .build(ConnectionManager::new(database_url))
    .expect("Failed to create pool")
}

pub fn db_connection(pool: &Pool) -> ServiceResult<PooledConnection> {
  Ok(pool.get().map_err(|_| ServiceError::UnableToConnectToDb)?)
}
