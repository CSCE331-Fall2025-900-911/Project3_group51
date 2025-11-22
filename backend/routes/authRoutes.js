const express = require('express');
const passport = require('passport');
const router = express.Router();

const CLIENT_URL = process.env.NODE_ENV === 'production'
  ? 'https://project3-group51-frontend.onrender.com'
  : 'http://localhost:5173';

router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' 
  })
);


router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: `${CLIENT_URL}/login?error=true`, 
  }),
  (req, res) => {
    const role = req.user.role.trim().toLowerCase();
    
    if (role === 'manager') {
      res.redirect(`${CLIENT_URL}/management`);
    } else if (role === 'employee') {
      res.redirect(`${CLIENT_URL}/cashier`);
    } else {
      res.redirect(CLIENT_URL); 
    }
  }
);


router.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user }); 
  } else {
    res.json({ user: null });
  }
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      
      res.clearCookie('connect.sid'); 
      
      res.redirect(`${CLIENT_URL}/login`);
    });
  });
});

module.exports = router;