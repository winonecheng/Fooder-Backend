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
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      },
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

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);

  const cursorIndex = results.findIndex(
    item => item.id === cursor
  );

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1
      ? []
      : results.slice(
        cursorIndex + 1,
        Math.min(results.length, cursorIndex + 1 + pageSize),
      )
    : results.slice(0, pageSize);
};
