This directory should contain 3 JSON files:

* coords.json
* thumbs.json
* countryCodes.json

coords.json
-----------

This file contains all the checkpoints of your trip: where you've been to and when. It's a list of places and dates. It should look like this:

```JSON
[
  {
    "day": "2015-03-15",
    "place": "Paris, France",
    "coords": {
      "lon": "2.35",
      "lat": "48.85"
    }
  },
  {
    "day": "2015-03-16",
    "place": "New Delhi, Inde",
    "coords": {
      "lon": "77.22",
      "lat": "28.64"
    }
  },
  {
    "day": "2015-03-17",
    "place": "Sydney, Australie",
    "coords": {
      "lon": "151.21",
      "lat": "-33.87"
    }
  },
  {
    "day": "2015-03-18",
    "place": "Sydney, Australie",
    "coords": {
      "lon": "151.21",
      "lat": "-33.87"
    }
  }
]
```

thumbs.json
-----------

This file contains the list of the pictures you want to display. For each day you have pictures, you should provide the matching list of file names. It should look like this:

```JSON
{
  "2015-05-10": [
    "IMG_8174.jpg"
  ],
  "2015-05-11": [
    "IMG_0393.jpg"
  ],
  "2015-05-14": [
    "IMG_0623.jpg"
  ],
  "2015-05-20": [
    "IMG_9385.jpg",
    "IMG_9410.jpg",
    "IMG_9418.jpg"
  ]
}
```

countryCodes.json
-----------------

This file contains the list of the 2-letters country codes for the countries you have been to. It's used to display the flags near the country name in the description panel. It should look like this:

```JSON
{
	"France": "fr",
	"Inde": "in",
	"Australie": "au",
	"Nouvelle-Zélande": "nz",
	"Hawaï": "us",
	"Etats-Unis": "us",
	"Canada": "ca"
}

```