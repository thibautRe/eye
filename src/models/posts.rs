use super::{
  picture::PictureApi,
  post_user_access::{GetPostIdByUserId, PostUserAccess},
  user::User,
  AccessType,
};
use crate::{
  database::PooledConnection,
  jwt::{Claims, Role},
  schema::posts,
};
use chrono::NaiveDateTime;
use diesel::{dsl::*, pg::Pg, prelude::*};

#[derive(Debug, Queryable)]
pub struct Post {
  pub id: i32,
  pub slug: String,
  pub content: serde_json::Value,
  pub access_type: AccessType,

  pub created_at: NaiveDateTime,
  pub created_by: i32,
  pub updated_at: NaiveDateTime,
  pub updated_by: i32,
  pub deleted_at: Option<NaiveDateTime>,
  pub deleted_by: Option<i32>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = posts)]
pub struct PostInsert {
  pub slug: String,
  pub content: serde_json::Value,
  pub access_type: AccessType,

  pub created_at: NaiveDateTime,
  pub created_by: i32,
  pub updated_at: NaiveDateTime,
  pub updated_by: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PostApi {
  pub id: i32,
  pub slug: String,
  pub content: String,

  pub included_pictures: Vec<PictureApi>,

  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

mod content {
  #[derive(Debug, Serialize, Deserialize)]
  pub struct Root {
    pub children: Vec<Descendant>,
  }
  #[derive(Debug, Serialize, Deserialize)]
  pub struct Text {
    pub text: String,
  }
  #[derive(Debug, Serialize, Deserialize)]
  pub struct Paragraph {
    pub children: Vec<Descendant>,
  }
  #[derive(Debug, Serialize, Deserialize)]
  pub struct Picture {
    pub picture_id: i32,
  }
  #[derive(Debug, Serialize, Deserialize)]
  pub enum Descendant {
    Text(Text),
    Paragraph(Paragraph),
  }
}

type Table = Order<Filter<posts::table, IsNull<posts::deleted_at>>, Desc<posts::created_at>>;
type EqPublic = Eq<posts::access_type, AccessType>;
type EqShared = Or<EqPublic, EqAny<posts::id, GetPostIdByUserId>>;

impl Post {
  fn all() -> Table {
    posts::table
      .filter(posts::deleted_at.is_null())
      .order(posts::created_at.desc())
  }

  pub fn get_filters(
    claims: Option<Claims>,
    slug: Option<String>,
  ) -> IntoBoxed<'static, posts::table, Pg> {
    let mut query = Self::all().into_boxed();

    if let Some(slug) = slug {
      query = query.filter(posts::slug.eq(slug))
    }

    query = match claims {
      None => query.filter(Self::public()),
      Some(claims) => match claims.role {
        Role::Admin => query,
        Role::User => query.filter(Self::shared(claims.user_id)),
      },
    };

    query
  }

  fn public() -> EqPublic {
    posts::access_type.eq(AccessType::Public)
  }
  fn shared(user_id: i32) -> EqShared {
    Self::public().or(posts::id.eq_any(PostUserAccess::get_post_id_by_user_id(user_id)))
  }

  pub fn into_api(self: Self, included_pictures: Vec<PictureApi>) -> PostApi {
    PostApi {
      id: self.id,
      slug: self.slug,
      content: self.content.to_string(),
      included_pictures,
      created_at: self.created_at,
      updated_at: self.updated_at,
    }
  }
}

impl PostInsert {
  pub fn new(slug: String, content: serde_json::Value, by_user: User) -> Self {
    let n = chrono::Local::now().naive_local();
    Self {
      slug,
      content,
      access_type: AccessType::Private,
      created_at: n,
      created_by: by_user.id,
      updated_at: n,
      updated_by: by_user.id,
    }
  }

  pub fn insert(&self, db: &mut PooledConnection) -> Result<Post, diesel::result::Error> {
    use self::posts::dsl::*;
    insert_into(posts).values(self).get_result::<Post>(db)
  }
}
