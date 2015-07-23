'use strict';

var express = require('express');
var controller = require('./worker.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/:date', auth.isAuthenticated(),controller.index);
router.get('/', auth.isAuthenticated(),controller.index);
router.get('/:id',auth.isAuthenticated(), controller.show);
router.post('/',auth.hasRole('admin'), controller.create);
router.put('/vacation/:id',auth.hasRole('admin'), controller.createVacation);
router.put('/:id', auth.hasRole('admin'),controller.update);
router.patch('/:id',auth.hasRole('admin'), controller.update);
router.delete('/:id',auth.hasRole('admin'), controller.destroy);
router.put('/vacation/delete/:id',auth.hasRole('admin'), controller.deleteVacation);

module.exports = router;