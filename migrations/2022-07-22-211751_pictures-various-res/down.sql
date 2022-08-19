ALTER TABLE
  pictures DROP COLUMN IF EXISTS original_height,
  DROP COLUMN IF EXISTS original_width,
  DROP COLUMN IF EXISTS thumbnail_base64,
  DROP COLUMN IF EXISTS blurhash,
  DROP COLUMN IF EXISTS original_file_path,
  DROP COLUMN IF EXISTS alt;

DROP TABLE IF EXISTS picture_sizes;