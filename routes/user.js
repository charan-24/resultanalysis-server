const exp = require('express');
const router = exp.Router();
const userController = require('../controllers/userController');

router.get('/fetchUserDetails/:rollno',userController.fetchUserDetails);
router.post('/changeAhandle',userController.changeAhandle);
router.post('/changeAPersonalDetail',userController.changeAPersonalDetail);

module.exports = router;