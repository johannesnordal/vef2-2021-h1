create table tvshows
(
    id serial primary key,
    name text not null,
    airDate date,
    inproduction boolean,
    tagline text,
    poster text not null, -- URL
    description text,
    language text,
    network text,
    website text
);

create table genres
(
    id serial primary key,
    name text not null
);

create table tvshows_genres
(
    id serial primary key,
    tvshow integer not null,
    genre integer not null,
    constraint tvshow foreign key (tvshow) references tvshows(id),
    constraint genre foreign key (genre) references genres(id)
);

create table seasons
(
    id serial primary key,
    name text not null,
    "number" integer check ("number" > 0),
    airDate date,
    description text,
    poster text not null, -- URL
    tvshow integer not null,
    constraint tvshow foreign key (tvshow) references tvshows(id)
);

create table episodes
(
    id serial primary key,
    name text not null,
    "number" integer check ("number" > 0),
    airDate date,
    season integer not null,
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
