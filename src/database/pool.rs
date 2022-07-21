use super::{ConnectionManager, Pool};

pub fn establish_connection(database_url: &str) -> Pool {
  Pool::builder()
    .build(ConnectionManager::new(database_url))
    .expect("Failed to create pool")
}
