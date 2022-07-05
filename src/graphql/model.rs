use crate::database::PooledConnection;
use crate::errors::ServiceResult;
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

pub(crate) struct QueryRoot;

#[juniper::object(Context = Context)]
impl QueryRoot {
    pub fn users(
        context: &Context,
        limit: Option<i32>,
        offset: Option<i32>,
    ) -> ServiceResult<Vec<User>> {
        let limit: i32 = limit.unwrap_or(100);
        let offset: i32 = offset.unwrap_or(0);

        crate::user::has_role(&context.user, "user")?;

        user::list::find_all_users(&context, limit, offset)
    }
}

pub(crate) struct Mutation;

#[juniper::object(Context = Context)]
impl Mutation {
    pub fn double(context: &Context, number: i32) -> ServiceResult<i32> {
        Ok(number * 2)
    }
    // pub fn register(context: &Context, data: UserData) -> ServiceResult<SlimUser> {
    //     let conn: &PgConnection = &context.db;

    //     Ok(create_user(data, conn)?)
    // }
}

pub(crate) type Schema = juniper::RootNode<'static, QueryRoot, Mutation>;

pub(crate) fn create_schema() -> Schema {
    Schema::new(QueryRoot {}, Mutation {})
}
