// @generated automatically by Diesel CLI.

pub mod sql_types {
    #[derive(diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "access_type"))]
    pub struct AccessType;

    #[derive(diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "post_include_target_kind"))]
    pub struct PostIncludeTargetKind;
}

diesel::table! {
    albums (id) {
        id -> Int4,
        name -> Text,
        created_at -> Timestamp,
        edited_at -> Timestamp,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    camera_bodies (id) {
        id -> Int4,
        name -> Varchar,
    }
}

diesel::table! {
    camera_lenses (id) {
        id -> Int4,
        name -> Varchar,
    }
}

diesel::table! {
    picture_albums (id) {
        id -> Int8,
        picture_id -> Int4,
        album_id -> Int4,
    }
}

diesel::table! {
    picture_sizes (id) {
        id -> Int4,
        picture_id -> Int4,
        file_path -> Text,
        height -> Int4,
        width -> Int4,
    }
}

diesel::table! {
    picture_tags (id) {
        id -> Int4,
        picture_id -> Int4,
        tag_id -> Int4,
    }
}

diesel::table! {
    picture_user_access (id) {
        id -> Int4,
        user_id -> Int4,
        picture_id -> Int4,
    }
}

diesel::table! {
    pictures (id) {
        id -> Int4,
        name -> Nullable<Text>,
        shot_at -> Nullable<Timestamp>,
        shot_by_user_id -> Nullable<Int4>,
        shot_by_camera_body_id -> Nullable<Int4>,
        shot_by_camera_lens_id -> Nullable<Int4>,
        shot_with_aperture -> Nullable<Varchar>,
        shot_with_focal_length -> Nullable<Int4>,
        shot_with_exposure_time -> Nullable<Varchar>,
        shot_with_iso -> Nullable<Int4>,
        uploaded_at -> Timestamp,
        original_width -> Int4,
        original_height -> Int4,
        blurhash -> Text,
        original_file_path -> Text,
        alt -> Text,
        access_type -> Text,
        extract_version -> Int4,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::PostIncludeTargetKind;

    post_includes (post_id, target_kind, target_id) {
        post_id -> Int4,
        target_kind -> PostIncludeTargetKind,
        target_id -> Int4,
    }
}

diesel::table! {
    post_user_access (user_id, post_id) {
        user_id -> Int4,
        post_id -> Int4,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::AccessType;

    posts (id) {
        id -> Int4,
        slug -> Text,
        content -> Jsonb,
        access_type -> AccessType,
        created_at -> Timestamptz,
        created_by -> Int4,
        updated_at -> Timestamptz,
        updated_by -> Int4,
        deleted_at -> Nullable<Timestamptz>,
        deleted_by -> Nullable<Int4>,
    }
}

diesel::table! {
    tags (id) {
        id -> Int4,
        name -> Text,
        slug -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        #[max_length = 120]
        email -> Varchar,
        name -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(picture_albums -> albums (album_id));
diesel::joinable!(picture_albums -> pictures (picture_id));
diesel::joinable!(picture_sizes -> pictures (picture_id));
diesel::joinable!(picture_tags -> pictures (picture_id));
diesel::joinable!(picture_tags -> tags (tag_id));
diesel::joinable!(picture_user_access -> pictures (picture_id));
diesel::joinable!(picture_user_access -> users (user_id));
diesel::joinable!(pictures -> camera_bodies (shot_by_camera_body_id));
diesel::joinable!(pictures -> camera_lenses (shot_by_camera_lens_id));
diesel::joinable!(pictures -> users (shot_by_user_id));
diesel::joinable!(post_includes -> posts (post_id));
diesel::joinable!(post_user_access -> posts (post_id));
diesel::joinable!(post_user_access -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    albums,
    camera_bodies,
    camera_lenses,
    picture_albums,
    picture_sizes,
    picture_tags,
    picture_user_access,
    pictures,
    post_includes,
    post_user_access,
    posts,
    tags,
    users,
);
