CREATE TABLE posts (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    blurb TEXT NOT NULL,
    access_type TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    created_by INT NOT NULL REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL,
    updated_by INT NOT NULL REFERENCES users(id)
);

CREATE TABLE post_user_access (
    user_id INT NOT NULL REFERENCES users(id),
    post_id BIGINT NOT NULL REFERENCES posts(id),
    PRIMARY KEY(user_id, post_id)
);

CREATE TYPE post_include_target_kind AS ENUM ('picture', 'album');
CREATE TABLE post_includes (
    post_id BIGINT NOT NULL REFERENCES posts(id),
    target_kind post_include_target_kind NOT NULL,
    target_id BIGINT NOT NULL,

    PRIMARY KEY(post_id, target_kind, target_id)
);

CREATE UNIQUE INDEX posts_slug_idx ON posts(slug);

