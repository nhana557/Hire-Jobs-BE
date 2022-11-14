const express = require('express')
const Router = express.Router()

const { experienceController } = require('../controller/workExperience')
const protect  = require('../middlewares/auth')
const uploadfile = require('../middlewares/uploadfile')

Router
    .post('/',protect, uploadfile, experienceController.createExperience)
    .put('/:id',protect,uploadfile, experienceController.updateExperience)
    .delete('/:id', experienceController.deleteExperience)
    .get('/:id', experienceController.getExperienceBy)
    .get('/', experienceController.selecAllExperience)
    .get('/search', experienceController.searchExperience)


module.exports = Router