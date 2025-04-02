// config/session.js
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require("dotenv");
dotenv.config();

const sessionConfig = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
      }),
      cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      }
    })
  );
};

module.exports = sessionConfig;