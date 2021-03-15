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
    id serial primary key,
    tvshow integer not null,
    genre text not null,
    constraint tvshow foreign key (tvshow) references tvshows(id),
    constraint genre foreign key (genre) references genres(name)
);

create table seasons
(
    id serial primary key,
    name text not null,
    "number" integer check ("number" > 0),
    airDate date,
    overview text,
    poster text not null, -- URL
    serieId integer not null,
    constraint serieId foreign key (serieId) references tvshows(id)
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
    constraint season foreign key (season) references seasons(id)
);

create table users
(
    id serial primary key,
    username text unique,
    email text unique,
    password text check (length(password) >= 10),
    admin boolean default false
);

create type status as ENUM('Langar að horfa', 'Er að horfa', 'Hef horft');

create table users_tvshows
(
    id serial primary key,
    tvshow integer not null,
    users integer not null,
    constraint tvshow foreign key (tvshow) references tvshows(id),
    constraint "user" foreign key (users) references users(id),
    view_status status,
    rating integer check (rating >= 0 and rating <= 5)
);
