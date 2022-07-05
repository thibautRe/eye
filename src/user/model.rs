use crate::schema::*;
use chrono::*;
use shrinkwraprs::Shrinkwrap;

#[derive(Debug, Serialize, Deserialize, Queryable, juniper::GraphQLObject)]
pub struct User {
  pub id: i32,
  pub email: String,
  pub name: String,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

#[derive(Debug, Insertable)]
#[table_name = "users"]
pub struct InsertableUser {
  pub email: String,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
  pub name: String,
}

#[derive(Debug, Deserialize, juniper::GraphQLInputObject)]
pub struct UserData {
  pub name: String,
  pub email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, juniper::GraphQLObject)]
pub struct SlimUser {
  pub id: i32,
  pub email: String,
}

#[derive(Shrinkwrap, Clone, Default)]
pub struct LoggedUser(pub Option<SlimUser>);

impl From<SlimUser> for LoggedUser {
  fn from(slim_user: SlimUser) -> Self {
    LoggedUser(Some(slim_user))
  }
}

impl From<UserData> for InsertableUser {
  fn from(user_data: UserData) -> Self {
    let UserData { name, email, .. } = user_data;

    let now = chrono::Local::now().naive_local();
    Self {
      email,
      name,
      created_at: now,
      updated_at: now,
    }
  }
}
impl From<User> for SlimUser {
  fn from(user: User) -> Self {
    let User { id, email, .. } = user;

    Self { id, email }
  }
}
