use crate::errors::{ServiceError, ServiceResult};

pub mod pool;

use diesel::r2d2::PoolError;

type ConnectionManager = diesel::r2d2::ConnectionManager<diesel::pg::PgConnection>;
pub type Pool = diesel::r2d2::Pool<ConnectionManager>;
pub type PooledConnection = diesel::r2d2::PooledConnection<ConnectionManager>;

pub fn db_connection(pool: &Pool) -> ServiceResult<PooledConnection> {
  Ok(pool.get().map_err(|_| ServiceError::UnableToConnectToDb)?)
}
