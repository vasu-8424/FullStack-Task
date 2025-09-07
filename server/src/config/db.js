const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase(overrideUri) {
  if (isConnected) return;
  const mongoUri = overrideUri || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  isConnected = true;
}

module.exports = { connectToDatabase };


