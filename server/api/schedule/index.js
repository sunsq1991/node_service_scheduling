'use strict';

var express = require('express');
var controller = require('./schedule.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:date', controller.show);
router.post('/:date', controller.create);
router.put('/:date', controller.update);
router.put('/jobs/:date', controller.updateJobs);
router.patch('/:date', controller.update);
router.put('/delete/:date', controller.destroy);

module.exports = router;