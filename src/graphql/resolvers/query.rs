use crate::{
  errors::ServiceResult,
  graphql::model::Context,
  user::{model::User, service as user}, models::camera_body::CameraBody,
};

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
