const mongoose = require('mongoose');

module.exports.connectDB = () => {
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
  });

  const TagSchema = new mongoose.Schema({
    text: { type: String, required: true },
  });

  const restaurant = mongoose.model('Restaurant', RestaurantSchema);
  const tag = mongoose.model('Tag', TagSchema);
  return { restaurant, tag };
};

module.exports.calDistance = (lat1, lng1, lat2, lng2) => {
  if (lat1 === lat2 && lng1 === lng2) return 0;

  var radlat1 = Math.PI * lat1/180;
  var radlat2 = Math.PI * lat2/180;
  var theta = lng1-lng1;
  var radtheta = Math.PI * theta/180;

  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) dist = 1;
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515 * 1.609344;
  return dist;
}
