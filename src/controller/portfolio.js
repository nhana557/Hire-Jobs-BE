const portfolioModel = require('../models/portfolio')
const createError = require('http-errors')
const { v4 : uuid4 } = require('uuid')
const commonHelper = require('../helper/common')
const jwt = require('jsonwebtoken')
const uploadGoogleDrive = require('../utils/uploadGoogleDrive')
const deleteFile = require('../utils/delete')
const deleteGoogleDrive = require('../utils/deleteGoogleDrive')
const { getPortfolio, insert, update, deletePortfolio, countPortfolio, getPortfolioByID, getIDportfolio } = portfolioModel
const portfolioController = {
    getPortfolio: (req, res, next) =>{
        getPortfolio()
        .then((result, err) =>{
            console.log(result)
            commonHelper.response(res, result, 'get Data Portofolio Success', 200)
        })
        .catch((err) =>{
            console.log(err)
            // next(createError)
        })
    },
    getPortfolioBy: (req, res, next) => {
        const id_worker = req.params.id 
          getPortfolioByID(id_worker)
          .then((result) => {
            commonHelper.response(res, result, 'get data portfolio', 200)
          })
          .catch((error) => {
            console.log(error)
            // next(createError)
          })
      },
      getID: (req, res, next) =>{
        const id = req.params.id || ''
        getIDportfolio(id)
        .then(result =>{
            commonHelper.response(res, result, 'success data porfolio byId', 200)
        })
        .catch(err => console.log(err))
      },
    createPortofolio: async(req, res, next) =>{
        try {
            const urls = []
            const files = req.files.image
            console.log(files)
            for(let file of files){
                const result = await uploadGoogleDrive(file)
                console.log(result)
                await deleteFile(file.path)
                console.log(file.path)
                urls.push(result)
            }
            console.log("ini url", urls)
            const token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            // console.log(decoded)
            const id_worker = decoded.id;
            console.log("ini decoded",decoded)
            // console.log(count.total)
            const id = uuid4();
            const { name_app, repository, type} = req.body
            const data = {
                id,
                name_app,
                repository,
                type,
                image: urls.map((url) => `https://drive.google.com/thumbnail?id=${url.id}&sz=s1080`),
                id_worker
            }
            // console.log(data)
            insert(data)
            .then(() =>{
                commonHelper.response(res, data, 'Added Portfolio', 200)
            })
            delete files.path
        } catch (error) {
            console.log(error)
            // next(createError)
        }
    },
    updatePortfolio: async(req, res, next) =>{
        try {
            const id = req.params.id;
            const urls = []
            const files = req.files.image
            const portfolio = await getIDportfolio(id)
            console.log(portfolio[0].image)
            console.log(files)
            if(files){
                if(portfolio[0].image){
                    for(item of portfolio[0].image){
                        let id_drive = item.split('id=')[1].split("&sz")[0]
                        await deleteGoogleDrive(id_drive)
                    }
                }
                for(let file of files){
                    const result = await uploadGoogleDrive(file)
                    console.log(result)
                    await deleteFile(file.path)
                    console.log(file.path)
                    urls.push(result)
                }
            }
            const { name_app, repository, type} = req.body
            console.log(req.decoded)
            const id_worker = req.decoded.id;
            console.log(urls)
            const data = {
                name_app,
                repository,
                type,
                image: urls.map((url) => `https://drive.google.com/thumbnail?id=${url.id}&sz=s1080`),
                id_worker
            }
            update(data, id)
            .then(() => {
                commonHelper.response(res, data, 'Updated Portfolio', 200)
            })
            .catch((error) =>{
                console.log('hallo', error.message)
                if (error && error.name === 'JsonWebTokenError') {
                    next(new createError(400, 'Token Auth Invalid'))
                  } else if (error && error.name === 'TokenExpiredError') {
                    next(new createError(400, 'Token Auth Expired'))
                  } else {
                    next(new createError(400, 'Token Auth Not Active'))
                  }
                // next(createError())
            })
        } catch (error) {
            console.log(error)
            // next(createError(error))
        }
    },
    deletePortfolio: async(req, res, next) =>{
        try {
            const id = req.params.id
            const portfolio = await getIDportfolio(id)
            console.log(portfolio)
            if(portfolio[0].image){
                for(let item of portfolio[0].image){
                    let link_drive = item.split('id=')[1].split("&sz")[0]
                    await deleteGoogleDrive(link_drive)
                }
            }
            deletePortfolio(id)
            commonHelper.response(res, id, 'succes deleted', 200)
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = portfolioController