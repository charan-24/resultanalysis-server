const exp = require('express');
const router = exp.Router();
const loginController = require('../controllers/loginController');

router.post('/handleLogin',loginController.handleLogin)
router.post('/adminLogin',loginController.adminLogin)

module.exports = router;