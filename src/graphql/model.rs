use crate::database::PooledConnection;
use crate::user::model::LoggedUser;
use juniper::Context as JuniperContext;
use std::sync::Arc;

use super::resolvers::mutation::Mutation;
use super::resolvers::query::Query;

#[derive(Clone)]
pub(crate) struct Context {
  pub db: Arc<PooledConnection>,
  pub user: LoggedUser,
}

impl JuniperContext for Context {}

impl Context {
  pub fn new(user: LoggedUser, pool: PooledConnection) -> Self {
    Self {
      user,
      db: Arc::new(pool),
    }
  }
}

pub(crate) type Schema = juniper::RootNode<'static, Query, Mutation>;

pub(crate) fn create_schema() -> Schema {
  Schema::new(Query {}, Mutation {})
}
