const tagData = require('./tag_data.json')
const restaurantData = require('./restaurant_data.json')
const mongoose = require('mongoose');

const db = mongoose.connect('mongodb://127.0.0.1:27017/restaurant');

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  placeId: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  priceLevel: { type: Number, default: 0, min: 0, max: 4 },
  phoneNumber: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  tags: [{ type: 'ObjectId', ref: 'Tag' }],
});

const TagSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const restaurant = mongoose.model('Restaurant', RestaurantSchema);
const tag = mongoose.model('Tag', TagSchema);

function insertTag() {
  tagData.forEach(element => {
    tag.create({text: element});
  });
}

// insertTag();

function insertRestaurant(){
  restaurantData.forEach(r => {
    r.map(_r => ({
      name: _r.name,
      priceLevel: _r['價格($,$$,$$$,$$$$)'],
      lat: _r.geometry
    }))
  })
}
