const mongoose = require('mongoose');

module.exports.connectDB = () => {
  const db = mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

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
    photoUrls: [String],
  });

  const TagSchema = new mongoose.Schema({
    text: { type: String, required: true },
  });

  const restaurant = mongoose.model('Restaurant', RestaurantSchema);
  const tag = mongoose.model('Tag', TagSchema);
  return { restaurant, tag };
};

module.exports.calDistance = (lat1, lng1, lat2, lng2) => {
  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  if (lat1 === lat2 && lng1 === lng2) return 0;
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lng2 - lng1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
