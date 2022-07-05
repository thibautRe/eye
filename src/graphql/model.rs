use crate::database::PooledConnection;
use crate::errors::ServiceResult;
use crate::models::camera_body::CameraBody;
use crate::user::model::{LoggedUser, User};
use crate::user::service as user;
use juniper::Context as JuniperContext;
use std::sync::Arc;

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

pub(crate) struct Query;

#[juniper::object(Context = Context)]
impl Query {
  fn users(context: &Context, limit: Option<i32>, offset: Option<i32>) -> ServiceResult<Vec<User>> {
    let limit: i32 = limit.unwrap_or(100);
    let offset: i32 = offset.unwrap_or(0);

    crate::user::has_role(&context.user, "user")?;

    user::list::find_all_users(&context, limit, offset)
  }

  fn camera_body_by_id(context: &Context, id: i32) -> ServiceResult<Option<CameraBody>> {
    Ok(CameraBody::get_by_id(id, &context.db))
  }
}

pub(crate) struct Mutation;

#[juniper::object(Context = Context)]
impl Mutation {
  pub fn double(number: i32) -> i32 {
    number * 2
  }
}

pub(crate) type Schema = juniper::RootNode<'static, Query, Mutation>;

pub(crate) fn create_schema() -> Schema {
  Schema::new(Query {}, Mutation {})
}
