const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const session = require('../utils/session');

const router = express.Router();
const secretKey = 'BD984276059190AA109522DBD7C4F374E68DA8AD32B39F79366EE6F798B16093';

router.post('/register', async (req, res) => {
  const { email, name } = req.body;

  try {
    // Check if the email is unique
    let user = await User.findOne({ where: { email } });

    if (user) {
      // If the email exists, update the name
      await user.update({ name });
    } else {
      // If the email is unique, create a new user
      user = await User.create({ email, name });
    }

    // Issue an authentication token
    const token = jwt.sign({ email, name }, secretKey);

    // Store the JWT in the in-memory store
    session.storeToken(token, { email, name });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
