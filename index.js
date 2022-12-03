require("dotenv").config()
const express = require('express')
const app = express()
const helmet = require("helmet")
const cors = require("cors")
const Router = require('./src/routes/index')
const xss = require('xss-clean')
// const worker = require('./src/routes/worker')
const morgan = require('morgan')
const createError = require('http-errors')
// const img = require('./images')


app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(xss())
app.use(helmet())
app.use(morgan('dev'))
app.use('/', Router)
// app.use('/img', express.static(path.join(__dirname, './images')))
app.use('/img', express.static('./images'))

app.all("*", (req, res, next) => {
  next(createError());
});

app.use((err, req, res, next) => {
  const statusCode = err.status;
  if (res.status(statusCode)) {
    res.send(createError(statusCode, err));
  }
  next();
});
// app.all('*', (req, res, next) => {
//     next(new createError.NotFound())
//   })
//   app.use((err,req,res,next)=>{
//     const messageError = err.message || "internal server error"
//     const statusCode = err.status || 500
    
//     res.status(statusCode).json({
//         message : messageError
//     })
//   })
const PORT = process.env.PORT || 6000
app.listen(5500, () =>{
    console.log(`server running at ${PORT}`)
})