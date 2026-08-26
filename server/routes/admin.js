const router = require('express').Router();
const {protect, admin} = require('../middleware/auth');

router.get('/dashboard', protect, admin, (req,res) => {
  res.json({message: "Admin API working"});
});

module.exports = router; // <-- ye line important hai