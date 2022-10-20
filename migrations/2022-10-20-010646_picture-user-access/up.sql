CREATE TABLE picture_user_access (
  id SERIAL NOT NULL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  picture_id INT NOT NULL REFERENCES pictures(id)
);