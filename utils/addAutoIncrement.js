const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

module.exports = (schema, model) => {
  autoIncrement.initialize(mongoose.connection);
  schema.plugin(autoIncrement.plugin, {
    model,
    startAt: 1
  });
};
