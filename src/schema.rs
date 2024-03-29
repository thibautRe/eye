// @generated automatically by Diesel CLI.

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

diesel::allow_tables_to_appear_in_same_query!(
    albums,
    camera_bodies,
    camera_lenses,
    picture_albums,
    picture_sizes,
    picture_tags,
    picture_user_access,
    pictures,
    tags,
    users,
);
