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
