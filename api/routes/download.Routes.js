const express = require('express');
const router = express.Router();
const { handleLargeCsvFile } = require('../controllers/mainController');
const { verifyIdentifier } = require('../controllers/verifyIdentifierController.js');

router.get('/download', handleLargeCsvFile);
router.post('/verify', verifyIdentifier);

module.exports = router;
