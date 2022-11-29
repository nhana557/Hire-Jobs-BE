const express = require('express')
const {recruiterController} = require('../controller/recruiter')
const Router = express.Router()

Router
    .get('/', recruiterController.getRecruiterByFilter)
    .get('/:id', recruiterController.getRecruiterByWork)

module.exports = Router