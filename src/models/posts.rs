use super::{
  picture::PictureApi,
  post_user_access::{GetPostIdByUserId, PostUserAccess},
  AccessType,
};
use crate::{
  database::PooledConnection,
  jwt::{Claims, Role},
  schema::posts,
};
use chrono::NaiveDateTime;
use diesel::{dsl::*, pg::Pg, prelude::*};

mod content;
pub type PostContent = content::Root;

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
  pub content: PostContent,

  pub included_pictures: Vec<PictureApi>,

  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
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

  pub fn update_content(
    slug: String,
    content: &PostContent,
    db: &mut PooledConnection,
  ) -> Result<Post, diesel::result::Error> {
    update(posts::table.filter(posts::slug.eq(slug)))
      .set((
        posts::content.eq(serde_json::to_value(content).expect("Invalid JSON")),
        posts::updated_at.eq(chrono::Local::now().naive_local()),
      ))
      .get_result::<Post>(db)
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
      content: serde_json::from_value(self.content).unwrap(),
      included_pictures,
      created_at: self.created_at,
      updated_at: self.updated_at,
    }
  }
}

impl PostInsert {
  pub fn new(slug: String, content: Option<PostContent>, by_user_id: i32) -> Self {
    let n = chrono::Local::now().naive_local();
    Self {
      slug,
      content: serde_json::to_value(content.unwrap_or(PostContent::empty())).expect("Invalid JSON"),
      access_type: AccessType::Private,
      created_at: n,
      created_by: by_user_id,
      updated_at: n,
      updated_by: by_user_id,
    }
  }

  pub fn insert(&self, db: &mut PooledConnection) -> Result<Post, diesel::result::Error> {
    use self::posts::dsl::*;
    insert_into(posts).values(self).get_result::<Post>(db)
  }
}
