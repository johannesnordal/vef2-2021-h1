# Hópverkefni 1

Í hópunum eru 

+ Jóhannes Nordal (jon8@hi.is).

+ Magnús Þór (mtv3@hi.is)

## Uppsetning á verkefni

1. Búa til gagnagrunn, t.d. `createdb vef2-2021-h1`
2. Búa til Cloudinary aðgang

### Nokkur orð um Cloudinary

Okkur tókst ekki að nota `CLOUDINARY_URL` locally þó að það hafi
gengið á 
[Heroku](https://vef2-2021-h1-jon8-mtv3.herokuapp.com/).
Þarf að leiðandi þarf að nota eftirfarandi 
umhverfisbreytur í `.env`:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Þær má finna á Dashboard á Cloudinary eins og fram kemur
[hér](https://cloudinary.com/documentation/node_integration#configuration).
Við notuðum nöfnin á myndunum í `data/img` með endingu (`.jpg`) fyrir `public_id`
þannig ef sá aðili sem fer yfir verkefnið er nú þegar með myndinarnar inni á
Cloudinary og notar sama fyrirkomulag þá ætti `npm setup` ekki að taka
langan tíma. En ef sú er ekki raunin gæti það tekið nokkrar mínútur :cry:

```
npm install
npm run setup
npm start
```
## Tilbúnir notendur

Admin:

+ username: `admin`
+ email: `admin@admin.is`
+ password: `adminadmin`

Venjulegur notandi:

+ username: `user`
+ email: `user@user.is`
+ password: `1234567890`

## Dæmi um köll á vefþjónustu

Til að hlaða upp mynd með á `tv/:id` eða `tv/:id/season` þarf að gefa upp
absolute path. Í þessu tilviku notar Cloudinary ekki nafnið á myndinni sem
`public_id` eins og með myndirnar í `data/img` heldur random streng.

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
