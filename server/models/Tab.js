const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let TabModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();
const setURL = (url) => _.escape(url).trim();
const setArtist = (artist) => _.escape(artist).trim();

const TabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  artist: {
    type: String,
    required: true,
    trim: true,
    set: setArtist,
  },

  url: {
    type: String,
    required: true,
    trim: true,
    set: setURL,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
});

TabSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  url: doc.url,
});

TabSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return TabModel.find(search).select('name artist url').exec(callback);
};

TabModel = mongoose.model('Tab', TabSchema);

module.exports.TabModel = TabModel;
module.exports.TabSchema = TabSchema;
