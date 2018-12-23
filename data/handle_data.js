const tagData = require('./tag_data.json')
const restaurantData = require('./restaurant_data.json')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const db = mongoose.connect('mongodb://127.0.0.1:27017/restaurant');

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

function insertRestaurant(tags) {
  restaurantData.forEach(r => {
    if (r.price == '' || r.geometry === '') {
      return;
    }

    var occasion = r.occasion.split("/").filter(Boolean);
    var cuisine = r.cuisine.split("/");
    var feature = r.feature.split("/").concat(cuisine).filter(Boolean);

    r = {
      name: r.name,
      placeId: r.place_id,
      rating: r.rating,
      priceLevel: r.price,
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

// main();

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

countFreq();
