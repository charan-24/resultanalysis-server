const exp = require('express');
const router = exp.Router();
const scoreController = require('../controllers/scoreController');

router.get('/cc/:username',scoreController.getCodechefScore);
router.get('/lc/:username', scoreController.getLeetcodeScore);
router.get('/cf/:username', scoreController.getCodeforcesScore);
router.get('/spoj/:username', scoreController.getSpojScore);
router.get('/hr/:username', scoreController.getHackerRankScore);
router.get('/ib/:username', scoreController.getInterviewBitScore);

module.exports = router;
