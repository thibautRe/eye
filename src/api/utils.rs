use std::collections::HashMap;

use diesel::RunQueryDsl;

use crate::{
  api::pagination::Paginate,
  database::PooledConnection,
  errors::ServiceResult,
  jwt::Claims,
  models::{
    album::{Album, AlbumApi},
    camera_lenses::CameraLens,
    picture::{Picture, PictureApi},
    picture_size::PictureSize,
    posts::{Post, PostApi},
  },
};

pub fn complete_picture(picture: Picture, db: &mut PooledConnection) -> ServiceResult<PictureApi> {
  let picture_sizes: Vec<PictureSize> = PictureSize::get_by_picture_id(picture.id).load(db)?;
  let lens: Option<CameraLens> = picture
    .shot_by_camera_lens_id
    .map(|id| CameraLens::get_by_id(id).first(db))
    .transpose()?;
  Ok(picture.into_api_full(picture_sizes, lens))
}

pub fn complete_pictures(
  pictures: Vec<Picture>,
  db: &mut PooledConnection,
) -> ServiceResult<Vec<PictureApi>> {
  let picture_ids: Vec<i32> = pictures.iter().map(|p| p.id).collect();
  let picture_sizes: Vec<PictureSize> =
    PictureSize::get_by_picture_ids(picture_ids.clone()).load(db)?;
  let lenses: Vec<CameraLens> = CameraLens::get_by_ids(picture_ids).load(db)?;
  let lenses_by_id: HashMap<i32, CameraLens> = lenses.into_iter().map(|l| (l.id, l)).collect();
  Ok(
    pictures
      .into_iter()
      .map(|p| {
        let picture_id = p.id;
        let shot_by_camera_lens_id = p.shot_by_camera_lens_id;
        p.into_api_full(
          picture_sizes
            .iter()
            .filter(|&s| s.picture_id == picture_id)
            .map(|s| s.clone())
            .collect(),
          shot_by_camera_lens_id
            .map(|id| lenses_by_id.get(&id).map(|l| l.clone()))
            .flatten(),
        )
      })
      .collect(),
  )
}

pub fn complete_album(
  album: Album,
  db: &mut PooledConnection,
  claims: Option<Claims>,
) -> ServiceResult<AlbumApi> {
  let album_id = album.id;
  let (pictures_excerpt, info) = Picture::get_filters(claims, None, Some(album_id), None)
    .paginate_first_page()
    .per_page_fixed(5)
    .load_and_count_pages::<Picture>(db)?;
  Ok(album.into_api(complete_pictures(pictures_excerpt, db)?, info.total_count))
}

// TODO perf - this can be improved by changing the db querying strategy to instead
// query everything upfront instead of calling `complete_album` for each album.
// Similar to how `complete_pictures` doesn't call `complete_picture`.
pub fn complete_albums(
  albums: Vec<Album>,
  db: &mut PooledConnection,
  claims: Option<Claims>,
) -> ServiceResult<Vec<AlbumApi>> {
  albums
    .into_iter()
    .map(|a| complete_album(a, db, claims))
    .collect()
}

pub fn complete_post(
  post: Post,
  db: &mut PooledConnection,
  claims: Option<Claims>,
) -> ServiceResult<PostApi> {
  let included_pictures =
    Picture::get_by_included_in_post_id(post.id, claims).load::<Picture>(db)?;
  let included_pictures = complete_pictures(included_pictures, db)?;
  Ok(post.into_api(included_pictures))
}

// TODO perf - this can be improved by querying everything upfront, similar to
// how `complete_pictures` doesn't call `complete_picture`
pub fn complete_posts(
  posts: Vec<Post>,
  db: &mut PooledConnection,
  claims: Option<Claims>,
) -> ServiceResult<Vec<PostApi>> {
  posts
    .into_iter()
    .map(|p| complete_post(p, db, claims))
    .collect()
}
