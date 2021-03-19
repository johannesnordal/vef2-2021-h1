create table tvshows
(
    id serial primary key,
    name text not null,
    airDate date,
    inProduction boolean,
    tagline text,
    image text not null, -- URL
    description text,
    language text,
    network text,
    homepage text
);

create table genres
(
    name text not null unique
);

create table tvshows_genres
(
    tvshow integer not null,
    genre text not null,
    constraint tvshow foreign key (tvshow) references tvshows(id) on delete cascade,
    constraint genre foreign key (genre) references genres(name) on delete cascade
);

create table seasons
(
    id serial primary key,
    name text not null,
    "number" integer check ("number" > 0),
    airDate date,
    overview text,
    image text not null, -- URL
    serieId integer not null,
    constraint serieId foreign key (serieId) references tvshows(id) on delete cascade
);

create table episodes
(
    id serial primary key,
    name text not null,
    "number" integer check ("number" > 0),
    airDate date,
    overview text,
    season integer not null,
    seasonId integer not null,
    constraint season foreign key (season) references seasons(id) on delete cascade
);

create table users
(
    id serial primary key,
    username text unique,
    email text unique,
    password text check (length(password) >= 10),
    admin boolean default false
);

create table users_tvshows
(
    tvshowId integer not null,
    userId integer not null,
    constraint tvshowId foreign key (tvshowId) references tvshows(id) on delete cascade,
    constraint userId foreign key (userId) references users(id) on delete cascade,
    state text,
    rating integer check (rating >= 0 and rating <= 5),
    unique(tvshowId, userId)
);
