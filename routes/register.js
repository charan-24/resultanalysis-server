const exp = require('express');
const router = exp.Router();
const registerController = require('../controllers/registerController');
router.post('/handleRegister',registerController.handleRegister);
router.post('/adminRegister',registerController.adminRegister)

module.exports = router;