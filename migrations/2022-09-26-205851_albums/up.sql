CREATE TABLE albums (
  id SERIAL NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  edited_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE picture_albums (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  picture_id INT NOT NULL REFERENCES pictures(id),
  album_id INT NOT NULL REFERENCES albums(id),
  UNIQUE(picture_id, album_id)
);