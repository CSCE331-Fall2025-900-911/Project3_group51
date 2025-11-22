const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db/pool'); 

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" 
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    
    try {
      const result = await pool.query(
        'SELECT * FROM employees WHERE email ILIKE $1',
        [email]
      );

      if (result.rowCount > 0) {
        const user = result.rows[0];
        done(null, user); 
      } else {
        done(null, false, { message: 'Employee not found' });
      }
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.employeeid); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE employeeid = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});