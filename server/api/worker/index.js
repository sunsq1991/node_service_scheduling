'use strict';

var express = require('express');
var controller = require('./worker.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/vacation/:id', controller.createVacation);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.put('/vacation/delete/:id', controller.deleteVacation);

module.exports = router;