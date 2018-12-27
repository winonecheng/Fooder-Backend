const tagData = require('./tag_data.json')
const restaurantData = require('./restaurant_data.json')
const mongoose = require('mongoose');
const fetch = require("node-fetch");
const ObjectId = mongoose.Types.ObjectId;

const db_url = process.env.NODE_ENV === 'production' ?
  process.env.MONGODB_URI :
  'mongodb://127.0.0.1:27017/restaurant'
const db = mongoose.connect(db_url, { useNewUrlParser: true });

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  placeId: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  priceLevel: String,
  phoneNumber: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  occasions: [{ type: 'ObjectId', ref: 'Tag' }],
  tags: [{ type: 'ObjectId', ref: 'Tag' }],
  openingHours: [String],
  reviewCount: Number,
  photoUrls: [String]
});

const TagSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const restaurant = mongoose.model('Restaurant', RestaurantSchema);
const tag = mongoose.model('Tag', TagSchema);

function insertTag() {
  tagData.forEach(element => {
    tag.create({ text: element });
  });
}

async function retrieveTags() {
  var tags;
  await tag.find({}, function (_, docs) {
    tags = docs
  });
  return tags;
}

function formatPrice(priceText) {
  if (priceText === '$$$$') return '300↑';
  const priceSymbol = { '$': 100, '$$': 200, '$$$': 300, '$$$$': 400 };
  var result = priceText.replace(/\$+/g, m => priceSymbol[m]);
  return result.includes('-') ? result : (parseInt(result) - 100).toString().concat('-', result);
}

function insertRestaurant(tags) {
  restaurantData.forEach(r => {
    if (r.price == '' || r.geometry === '') return;

    var occasion = r.occasion.split("/").filter(Boolean);
    var cuisine = r.cuisine.split("/");
    var feature = r.feature.split("/").concat(cuisine).filter(Boolean);

    r = {
      name: r.name,
      placeId: r.place_id,
      rating: r.rating,
      priceLevel: formatPrice(r.price),
      phoneNumber: r.formatted_phone_number,
      location: {
        lat: JSON.parse(r.geometry.replace(/'/g, '"')).location.lat,
        lng: JSON.parse(r.geometry.replace(/'/g, '"')).location.lng,
        address: r.formatted_address,
      },
      occasions: occasion.map(o => ObjectId(tags.find(_tag => _tag.text === o)._id)),
      tags: feature.map(f => ObjectId(tags.find(_tag => _tag.text === f)._id)),
      openingHours: r.opening_hours === '' ? [''] :
        JSON.parse(r.opening_hours.replace(/'/g, '"')).weekday_text,
      reviewCount: r.reviewCount || 0,
      photoUrls: r.photoUrls,
    };

    restaurant.create(r, function (err, docs) {
      if (err) throw err;
      console.log(docs);
    });
  });
}

async function main() {
  var tags = await retrieveTags();
  insertRestaurant(tags);
}

function countFreq() {
  var count = {}
  tagData.forEach(t => {
    var _count = 0;
    restaurantData.forEach(r => {
      if (r.cuisine.includes(t))
        _count += 1;
      if (r.feature.includes(t))
        _count += 1;
    })
    count[t] = _count;
  })

  var sortable = [];
  for (var tag in count) {
    sortable.push([tag, count[tag]]);
  }

  sortable.sort(function (a, b) {
    return a[1] - b[1];
  });

  console.log(sortable);
}

async function getReviews(mapsUrl) {

  return await fetch(mapsUrl)
    .then(res => res.text())
    .then(body => body.match(/(\d+) 篇評論/))
    .catch(err => console.error(err));
}

async function reviewsNumberCrawler() {
  await Promise.all(restaurantData.map(async (r, idx, _arr) => {
    if (r.url === '' || r.reviewCount !== undefined) return;
    var reviewMatch = await getReviews(r.url.replace('https', 'http'));
    if (reviewMatch) {
      _arr[idx]['reviewCount'] = reviewMatch[1]
      console.log(_arr[idx].index);
    }
  }));

  const fs = require('fs');
  fs.writeFile('./restaurant_data.json', JSON.stringify(restaurantData), 'utf8', function () { console.log('success!'); });
}

async function getPhotoUrls(placeid) {
  const baseURL = 'https://maps.googleapis.com/maps/api/place';
  const key = 'AIzaSyAdXyt70-ESrNFLKhduncw6C-TJv4oXUdo'
  const photos = await fetch(
    `${baseURL}/details/json?placeid=${placeid}&key=${key}&language=zh-TW&fields=photo`
  ).then(res => res.json()
  ).then(res => res.result ? res.result.photos : null
  ).catch(err => console.error(err));

  return photos ?
    await Promise.all(photos.map(async photo => await fetch(
      `${baseURL}/photo?maxwidth=500&maxheight=285&key=${key}&photoreference=${photo.photo_reference}`
    ).then(res => res.url).catch(err => console.error(err))
    )) : [];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const f = async () => {
  const fs = require('fs');
  await Promise.all(restaurantData.slice(0, 2000).map(async (r, idx, _arr) => {
    // if (r.place_id === '' || r.photoUrls !== undefined ) return;
    // const photoUrls = await getPhotoUrls(r.place_id);
    // console.log(photoUrls);
    // if (photoUrls.length !== 0) {
    //   _arr[idx]['photoUrls'] = photoUrls;
    //   console.log(_arr[idx].name);
    //   console.log(_arr[idx].photoUrls.length)
    //   await fs.writeFile('./restaurant_data.json', JSON.stringify(restaurantData), 'utf8', function () { console.log('success!'); });
    // }
    // await sleep(3000);
    if (r.price !== '' && r.photoUrls && r.photoUrls.includes(null)) {
      const photoUrls = await getPhotoUrls(r.place_id);
      console.log(photoUrls);
      if (photoUrls.length !== 0) {
        _arr[idx]['photoUrls'] = photoUrls;
        console.log(_arr[idx].name);
        console.log(_arr[idx].photoUrls.length)
        await fs.writeFile('./restaurant_data.json', JSON.stringify(restaurantData), 'utf8', function () { console.log('success!'); });
      }
      // await sleep(3000);

    }
  }));

  fs.writeFile('./restaurant_data.json', JSON.stringify(restaurantData), 'utf8', function () { console.log('success!'); });
};

// f()
main()