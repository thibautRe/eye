CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE camera_bodies (
    id SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE camera_lenses (
    id SERIAL NOT NULL PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE pictures (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NULL,
    shot_at TIMESTAMP NULL,
    shot_by_user_id INT NULL REFERENCES users(id),
    shot_by_camera_body_id INT NULL REFERENCES camera_bodies(id),
    shot_by_camera_lens_id INT NULL REFERENCES camera_lenses(id),

    shot_with_aperture VARCHAR NULL,
    shot_with_focal_length INT NULL,
    shot_with_exposure_time VARCHAR NULL,
    shot_with_iso INT NULL,

    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
