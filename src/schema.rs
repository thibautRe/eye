table! {
    camera_bodies (id) {
        id -> Int4,
        name -> Varchar,
    }
}

table! {
    camera_lenses (id) {
        id -> Int4,
        name -> Varchar,
    }
}

table! {
    picture_sizes (id) {
        id -> Int4,
        picture_id -> Int4,
        file_path -> Text,
        height -> Int4,
        width -> Int4,
    }
}

table! {
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
    }
}

table! {
    users (id) {
        id -> Int4,
        email -> Varchar,
        name -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

joinable!(picture_sizes -> pictures (picture_id));
joinable!(pictures -> camera_bodies (shot_by_camera_body_id));
joinable!(pictures -> camera_lenses (shot_by_camera_lens_id));
joinable!(pictures -> users (shot_by_user_id));

allow_tables_to_appear_in_same_query!(
    camera_bodies,
    camera_lenses,
    picture_sizes,
    pictures,
    users,
);
