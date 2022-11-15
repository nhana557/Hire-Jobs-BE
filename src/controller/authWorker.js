require("dotenv").config()
const bcrypt = require('bcryptjs')
const { v4: uuid4 } = require('uuid')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { findByEmail, create, updateProfile, changePassword, getProfile, updatePicture, findByToken, activateEmail } = require('../models/authWorker')
const commonHelper = require('../helper/common')
const authHelper = require("../helper/authWorker")
const uploadGoogleDrive = require('../utils/uploadGoogleDrive')
const deleteGoogleDrive = require('../utils/deleteGoogleDrive')
const deleteFile = require('../utils/delete')
const activateAccountEmail = require('../utils/email/activateAccountEmail')
const sendEmail = require('../utils/email/sendEmail')


const register = async (req, res, next) =>{
    try {
        const {fullname, email, phonenumber, password } = req.body;
        const { rowCount } = await findByEmail(email)
        const salt = bcrypt.genSaltSync(10)
        const passwordHash = bcrypt.hashSync(password, salt)
        const token = crypto.randomBytes(30).toString('hex');

        if(rowCount){
            return commonHelper.response(res, rowCount, 'user sudah terdaftar', 403)
        }
        // else{
          const data = {
              id: uuid4(),
              fullname,
              email,
              phonenumber,
              password: passwordHash,
              role: 'worker',
              token
          }
          console.log(data)
          // }
          
          const templateEmail = {
            from: `"Hire Jobs" <${process.env.EMAIL_FROM}>`,
            to: req.body.email.toLowerCase(),
            subject: 'Activate Your Account!',
            html: activateAccountEmail(`http://localhost:${process.env.PORT}/authWorker/activation/${token}`)
          }
          const emails = await sendEmail(templateEmail);
          console.log(emails)
          if(emails){
            await create(data)
            commonHelper.response(res, null, "Register Success, check email to Activate account", 201)
          }else{
            commonHelper.response(res, null, "Register Success", 201)

          }

    } catch (error) {
        console.log(error)
        // next(createError)
    }
}

const ActivateAccount = async(req, res, next) =>{
    try {
      const { token } = req.params;
      console.log(token)
      const user = await findByToken('token_verify', token)
      console.log(user.rowCount)
      if(!user.rowCount){
        res.send(
          `<div>
            <h1>Activation Failed </h1>
            <h3>Token invalid </h3> 
          </div>`
          )
          return;
      }
      console.log(user.rows[0].id)
      await activateEmail(user.rows[0].id)
      res.send(
        `<div>
            <h1>Activation Success </h1>
            <a href='${process.env.API_FRONTEND}/Login/worker'><button class="btn btn-primary">Login Hire Jobs</button></a> 
          </div>`
      )
    } catch (error) {
      console.log(error)
    }
}

const login = async (req, res, next) => {
    try {
      const { email, password } = req.body
      const {
        rows: [user]
      } = await findByEmail(email)
      // console.log(user)
      // console.log(user.token_verify)
      if (!user) {
        return commonHelper.response(
          res,
          null,
          'email Anda salah',
          403
        )
      }else if(user.token_verify === 'true'){
        const validPassword = bcrypt.compareSync(password, user.password)
        if (!validPassword) {
          return commonHelper.response(
            res,
            null,
            'password Anda salah',
            403
          )
        }
        delete user.password
    
        const payload = {
          fullname: user.fullname,
          email: user.email,
          id: user.id,
          id_portfolio: user.id_portfolio,
          id_experience: user.id_experience
        }
    
        user.token = authHelper.generateToken(payload)
        user.refreshToken = authHelper.generateRefreshToken(payload)
        // console.log(user)
        return commonHelper.response(res, user, 'anda berhasil login', 201)
      }
        return commonHelper.response(res, null, 'please activation Account!', 403)
      
      
    } catch (error) {
      console.log(error)
    //   next(new createError.InternalServerError())
    }
  }
  
const refreshToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken
    const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY)
    const payload = {
      email: decoded.email,
      role: decoded.role
    }
    const result = {
      token: authHelper.generateToken(payload),
      refreshToken: authHelper.generateRefreshToken(payload)
    }
    commonHelper.response(res, result, 'token berhasil', 200)
  }
  
  const updaterImgProfile = async(req, res, next) =>{
    try {

      const email = req.decoded.email;
      console.log(email)
      const user = await findByEmail(email);
      // jika user tidak ditemukan
      if (!user.rowCount) {
        // hapus jika ada upload photo
        if (req.files) {
          if (req.files.image) {
            deleteFile(req.files.image[0].path);
          }
        }

        commonHelper.response(res, null , "update Profile failed", 404);
        return;
      }

      let { image } = user.rows[0];
      console.log(image)
      // console.log(user.rows[0])
      // jika ada upload photo
      console.log(req.files)
      if (req.files) {
        if (req.files.image) {
          // menghapus image sebelumnya di gd jika sebelumnya sudah pernah upload
          console.log(req.files.image)
          if (user.rows[0].image) {
            await deleteGoogleDrive(user.rows[0].image);
          }
          // upload photo baru ke gd
          console.log("ini image", req.files.image[0].path)
          image = await uploadGoogleDrive(req.files.image[0]);
          // menghapus image setelah diupload ke gd
          deleteFile(req.files.image[0].path);
        }
      }
      console.log(image, 'ini id' )
      await updatePicture(user.rows[0].id, image.id);

      commonHelper.response(res, {
        code: 200,
        payload: null,
        message: 'Update User Photo Success',
      }, 'success', 200);
    } catch (error) {
      console.log(error)
      commonHelper.response(res, {
        code: 500,
        payload: error.message,
        message: 'Internal Server Error',
      }, 'error', 500);
    }
  }

  const updateProfileEmployee = async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const id = decoded.id;
      console.log(id)
      // const picture = req.file.filename
      // console.log(req.file)
      // const ress = await cloudinary.uploader.upload(gambars)
      const {
        fullname,
        email,
        phonenumber,
        jobs,
        worker,
        address,
        description,
        skill,
        active,
        id_portfolio,
        instagram,
        github,
        id_experience
      } = req.body
      const data = {
        fullname,
        email,
        phonenumber,
        jobs,
        worker,
        address,
        description,
        skill: skill,
        active,
        id_portfolio,
        instagram,
        github,
        id_experience,
        role: "worker",
      };
      await updateProfile({...data, id})
      console.log(data)
      commonHelper.response(res, data, 'update user success', 201)
    } catch (error) {
      console.log(error)
    }
  }
  
  const changePasswordEmployee = (req, res, next) => {
    const id = req.body.id
    changePassword(id)
      .then(() => {
        res.json({
          message: 'password has been changed'
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }
  
  const getProfil = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
      // console.log(token)
      const decoded = jwt.verify(token, process.env.SECRET_KEY)
      // console.log('ini ',decoded)
      if(!decoded){
        commonHelper.response({message: 'token in valid'})
      }
      const id = decoded.id
      // console.log("ini adalah id", id)
      const result = await getProfile(id)
      // console.log(result)
  
      commonHelper.response(res, result.rows, 'Get profil data success', 200)
    } catch (error) {
      console.log(error)
    //   next(createError)
    }
  }
  module.exports = {
    register,
    login,
    refreshToken,
    updateProfileEmployee,
    changePasswordEmployee,
    getProfil,
    ActivateAccount,
    updaterImgProfile
  }