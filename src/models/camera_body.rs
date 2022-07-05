use diesel::{prelude::*, QueryDsl};

use crate::{database::PooledConnection, schema::camera_bodies};

#[derive(Debug, Serialize, Deserialize, Queryable, juniper::GraphQLObject)]
pub struct CameraBody {
  pub id: i32,
  pub name: String,
}

impl CameraBody {
  pub fn get_by_id(id: i32, conn: &PooledConnection) -> Option<Self> {
    camera_bodies::table
      .filter(camera_bodies::id.eq(id))
      .first(conn)
      .ok()
  }
}
