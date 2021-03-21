# Hópverkefni 1

### Magnús Þór (mtv3@hi.is)

### Jóhannes Nordal (jon8@hi.is)

### Uppsetning á verkefni

```

npm install
npm run setup
npm start

```

## Dæmi um köll á vefþjónustu

```

POST á /tv
{
    "name": "Ævintýri Magga og Jóa",
    "airdate": "2021-01-15",
    "inproduction": "true",
    "tagline": "Experience a new vision of reality.",
    "image": "absolute/path/to/image",
    "description": "Á ferð og flugi um dularfulla tölvuheiminn.",
    "language": "en",
    "network": "ÍNN"
}

```

```

PATCH 'a /tv/:id
{
    "name": "Ævintýri Magnúsar og Jóhannes",
    "airdate": "2021-01-15",
    "inproduction": "true",
    "tagline": "Experience a new vision of reality.",
    "image": "absolute/path/to/image",
    "description": "Góðir þætti fyrir alla fjölskylduna",
    "language": "en",
    "network": "Disney+"
}
```

```

POST á /tv:id/season
{
    "name": "Season 1",
    "number": 1,
    "airdate": "2025-12-16",
    "overview": "Alvöru sería hér á ferð",
    "image": "absolute/path/to/image",
    "serieid": 18
}

```

```
POST á /tv/:id/season/:id/episode
{
    "name": "Jói og dulafulla readMe skjalið",
    "number": 555,
    "airdate": null,
    "overview": "Við fyrstu sýn var þetta bara venjulegt skjal."
}
```
```
POST á /users/register
{
    "username": "Simmi",
    "password": "1234567890",
    "email": "simmi@binni.is"
}
```

```

POST á /users/login
{
    "username": "Simmi",
    "password": "1234567890"
}

```

```

PATCH á /users/me
{
    "email": "binni@simmi.is",
    "password": "1234567890"
}

```

```

PATCH á /user/:id
{
    "admin":true
}

```

## Tilbúnir notendur

Admin:

+ Username: admin
+ Email: admin@admin
+ Password: adminadmin

Venulegur notandi:

+ Username: user
+ Email: user@user
+ Password: 1234567890
