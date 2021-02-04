# Vefforritun 2, 2021, hópverkefni 1

_Fyrsta útgáfa_, ekki er búið að fullskilgreina vefþjónustuskil eða útbúa gögn í byrjun, stefnt á að verði komið 7.–8. febrúar. Nota skal tíma þangað til, til þess að finna hóp, skipta með sér verkum, ákveða samskipti, og skilgreina tímalínu fyrir vinnu á verkefninu.

[Yfirferð í fyrirlestri 4](https://youtu.be/gQEFFKGumG0)

---

Útfæra skal vefþjónustur fyrir sjónvarpsþáttavef:

* Gefin eru/verða gögn fyrir sjónvarpsþætti, season og staka þætti sem flytja þarf inn í gagnagrunn
* Hægt er að skoða öll gögn um sjónvarpsþætti án innskráningar
* Notendaumsjón
  * Stjórnendur sem geta breytt, bætt við, og eytt sjónvarpsþáttum, seasons og stökum þáttum
  * Notendum sem geta skráð sína „stöðu“ fyrir sjónvarpsþátt, season og staka þætti
* Vörum
  * Eftir flokkum
  * Eftir leit
* Gervivörum útbúnum með faker

## Notendaumsjón

Notendaumsjón skiptist í þrennt: óauðkenndur notandi, notendur og stjórnendur.

* Óauðkenndur notandi getur skoðað öll gögn.
* Notendum sem geta skráð sína „stöðu“ fyrir sjónvarpsþátt, season og staka þætti. Stöður eru:
  * `Langar að horfa`
  * `Er að horfa`
  * `Hef horft`
* Stjórnendur geta breytt, bætt við, og eytt sjónvarpsþáttum, seasons og stökum þáttum.
  * Stjórnendur geta gert aðra notendur að stjórnendum.

Nota skal JWT með passport og geyma notendur i gagnagrunni. Útfæra þarf auðkenningu, nýskráningu notanda og middleware sem passar upp á heimildir stjórnenda og notenda.

Útbúa skal í byrjun:

* Einn stjórnanda með notandanafn `admin` og þekkt lykilorð, skrá skal lykilorð í `README` verkefnis.
* Einn almennan notanda sem hefur vistaðar stöður á einhverjum af gefnum þáttum, season, þáttum, skrá skal upplýsingar um notanda í `README`
  * Þessi notandi er til þess að einfalda yfirferð á verkefni.

## Töflur

TBD

Töflur skulu hafa auðkenni og nota [_foreign keys_](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK) þegar vísað er í aðrar töflur.

Nota þarf _join_ til að sameina gögn notanda við sjónvarpsþáttagögn. Sjá dæmi í fyrirlestri 5.

## Gögn

Þegar verkefni er sett upp skal færa inn gögn sem gefin eru:

TBD

## Myndir

Gefnar eru myndir fyrir sjónvarpsþætti í `img/`.

Allar myndir skal geyma í [Cloudinary](https://cloudinary.com/), bæði þær sem settar eru upp í byrjun og þær sem sendar eru inn gegnum vefþjónustu. Við notum Cloudinary þar sem boðið er upp á ókeypis aðgang, án kreditkorts.

Aðeins ætti að leyfa myndir af eftirfarandi tegund (`mime type`):

* jpg, `image/jpeg`
* png, `image/png`
* gif, `image/gif`

[Þó svo að Cloudinary styðji fleiri tegundir](https://cloudinary.com/documentation/image_transformations#supported_image_formats), þá er hægt að staðfesta að við höfum mynd _áður_ en uploadað á Cloudinary.

## Vefþjónustur

Útfæra skal vefþjónustur til að útfæra alla virkni. Nota skal `JSON` í öllum samskiptum.

GET á `/` skal skila lista af slóðum í mögulegar aðgerðir.

Skilgreiningar TBD.

## Annað

Allar niðurstöður sem geta skilað mörgum færslum (fleiri en 10) skulu skila _síðum_.

Ekki þarf að útfæra „týnt lykilorð“ virkni.

Lausn skal keyra á Heroku.

## Hópavinna

Verkefnið skal unnið í hóp, helst með þremur einstaklingum. Hópar með tveim eða fjórum einstaklingum eru einnig í lagi, ekki er dregið úr kröfum fyrir færri í hóp en gerðar eru auknar kröfur ef fleiri en þrír einstaklingar eru í hóp.

Hægt er að auglýsa eftir hóp á slack á rásinni #vef2-2021-hópur.

Hafið samband við kennara ef ekki tekst eða ekki er mögulegt að vinna í hóp.

## README

Í rót verkefnis skal vera `README.md` skjal sem tilgreinir:

* Upplýsingar um hvernig setja skuli upp verkefnið
* Dæmi um köll í vefþjónustu
* Innskráning fyrir `admin` stjórnanda ásamt lykilorði
* Innskráning fyrir almennan notanda ásamt lykilorði
* Nöfn og notendanöfn allra í hóp

## Mat

TBD

## Sett fyrir

Verkefni sett fyrir í fyrirlestri fimmtudaginn 4. febrúar 2021.

## Skil

Á Canvas eru skilgreindir 40 hópar (People > Hópverkefni 1) sem hópur þarf að skrá sig í. Fyrsti nemandi sem skráir sig er sjálfgefið hópstjóri.

Hópstjóri skilar fyrir hönd hóps á Canvas, í seinasta lagi fyrir lok dags sunnudaginn 7. mars 2021.

Skilaboð skulu innihalda slóð á GitHub repo fyrir verkefni, og dæmatímakennurum skal hafa verið boðið í repo ([sjá leiðbeiningar](https://docs.github.com/en/free-pro-team@latest/github/setting-up-and-managing-your-github-user-account/inviting-collaborators-to-a-personal-repository)) ásamt slóð á verkefnið keyrandi á Heroku. Notendanöfn þeirra eru:

* `jonnigs`
* `mimiqkz`
* `Steinalicious`
* `zurgur`

Athugið að skilum fyrir verkefni lokar kl. 23:59 sunnudaginn 7. mars 2021.

## Einkunn

Sett verða fyrir 6 minni verkefni þar sem 5 bestu gilda 8% hvert, samtals 40% af lokaeinkunn.

Sett verða fyrir tvö hópverkefni þar sem hvort um sig gildir 10%, samtals 20% af lokaeinkunn.

---

> Útgáfa 0.1
