const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/*
const restaurants = [
  {
    name: 'name1',
    placeId: 'ChIJuUOHMpN2bjQRwF_WBUzhJrg',
    rating: 4.5,
    priceLevel: 1,
    phoneNumber: '06 275 8011',
    tags: [
      ObjectId("5c11320e48aff7154ab52b63"),
      ObjectId("5c11320e48aff7154ab52b64"),
    ],
    location: {
      lat: 22.9962436,
      lng: 120.2221719,
      address: '70101台灣台南市東區大學路1號'
    }
  },
  {
    name: 'name2',
    placeId: 'ChIJraKVcpN2bjQR5PWTIKGLq5Q',
    rating: 3.5,
    priceLevel: 2,
    phoneNumber: '06 234 4057',
    tags: [
      ObjectId("5c11320e48aff7154ab52b65"),
      ObjectId("5c11320e48aff7154ab52b64"),
    ],
    location: {
      lat: 22.934436,
      lng: 120.230419,
      address: '70101台灣台南市東區大學路105號'
    }
  }
];
*/

module.exports.connectDB = () => {
  const db_url = process.env.NODE_ENV === 'production' ?
    process.env.MONGODB_URI :
    'mongodb://127.0.0.1:27017/restaurant'
  const db = mongoose.connect(db_url);

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

    // Tag.insertMany([{ text: 'tag1' }, { text: 'tag2' }, { text: 'tag3' }], function (err, docs) {
    //   console.log(docs);
    // })
    // Restaurant.insertMany(restaurants, function(err, docs) {
    //   console.log(docs);
    // })
    // Restaurant.
    //   findOne({name: 'name1'}).
    //   populate('tags').
    //   exec(function(err, r) {
    //     console.log(r.tags);
    //   })
  return { restaurant, tag };
}

// module.exports.createDB = () => {
  // const db = new SQL('database', null, null, {
  //   dialect: 'sqlite',
  //   storage: './db.sqlite',
  // })

  // const restaurants = db.define('Restaurant', {
  //   id: {
  //     type: SQL.INTEGER,
  //     primaryKey: true,
  //     autoIncrement: true,
  //   },
  //   name: {
  //     type: SQL.STRING,
  //     notNull: true,
  //   },
  //   placeId: SQL.STRING,
  //   rating: {
  //     type: SQL.FLOAT,
  //     defaultValue: 0,
  //     validate: { min: 0, max: 5 }
  //   },
  //   priceLevel: {
  //     type: SQL.INTEGER,
  //     defaultValue: 0,
  //     validate: { min: 0, max: 4 }
  //   },
  //   phoneNumber: SQL.STRING,
  //   lat: SQL.FLOAT,
  //   lng: SQL.FLOAT,
  //   address: SQL.STRING,
  //   tagIds: SQL.STRING,
  // });

  // const tags = db.define('Tag', {
  //   id: {
  //     type: SQL.INTEGER,
  //     primaryKey: true,
  //     autoIncrement: true,
  //   },
  //   text: {
  //     type: SQL.STRING,
  //     notNull: true,
  //   },
  // });

  // return { restaurants, tags };
// };
