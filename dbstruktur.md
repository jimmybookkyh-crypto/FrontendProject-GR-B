db tabeller:

- Filmer - info om filmer
- Salonger - salongs placeringar
- Visningar - datum, film, tid
- Pris - biljett pris/kampanjer
- Bokningar - bokningsinfo
- Användare - användar info

film tabell:
[
{
"title": "Call me by your name",
"productionCountries": [
"Italien",
"USA"
],
"productionYear": 2017,
"length": 132,
"genre": "Drama",
"distributor": "UIP",
"language": "engelska",
"subtitles": "svenska",
"director": "Luca Guadagnino",
"actors": [
"Armie Hammer",
"Timothée Chalamet",
"Michael Stuhlbarg"
],
"description": "<p>Filmen utspelas i norra Italien sommaren 1983. En ung amerikansk-italienare blir förälskad i en amerikansk student som kommer för att studera och bo hos hans familj.</p><p>Tillsammans upplever de en oförglömlig sommar - full av musik, mat och kärlek - som för evigt kommer att förändra dem.</p>",
"images": [
"call-me-poster1.jpg",
"call-me-poster2.jpg"
],
"youtubeTrailers": [
"Z9AYPxH5NTM"
],

    "current": "true"

      }

]
salonger tabell:
[  
 {
"name": "Stora Salongen",
"seatsPerRow": [
8,
9,
10,
10,
10,
10,
12,
12
]
},
{
"name": "Lilla Salongen",
"seatsPerRow": [
6,
8,
9,
10,
10,
12
]
}
]

Visningar tabell:

[
{
"auditorium": "Stora Salongen",
"film": "Call me by your name",
"date": "2024-10-15",
"time": "18.40"
}
]

Pris tabell:
[
{
"adult_prince": 140,
"child_prince": 80,
"senior_prince": 120,
"discount":
}
]

Bokningar tabell:
[
{
"showing":[] - vilken visning,
"seats":[] - vilken/vilka platser,
"tickets": [] - typ av biljett (vuxen/barn),
"email":
}
]

Användare konto tabell:
[
{
"login": userName69,
"password": 1234,
"email": 69er@gmail.com
}
]
