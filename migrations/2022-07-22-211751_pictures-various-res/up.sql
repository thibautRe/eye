ALTER TABLE
  pictures
ADD
  COLUMN original_width INT NOT NULL,
ADD
  COLUMN original_height INT NOT NULL,
ADD
  COLUMN thumbnail_base64 TEXT NOT NULL,
ADD
  COLUMN original_file_path TEXT NOT NULL,
ADD
  COLUMN alt TEXT NOT NULL,
ADD
  CONSTRAINT original_file_path_unq UNIQUE (original_file_path);

CREATE TABLE picture_sizes (
  id SERIAL NOT NULL PRIMARY KEY,
  picture_id INT NOT NULL REFERENCES pictures(id),
  file_path TEXT NOT NULL,
  height INT NOT NULL,
  width INT NOT NULL
);