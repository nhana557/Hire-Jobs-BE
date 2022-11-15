require('dotenv').config();

// const { google } = require('googleapis')
const nodemailer = require('nodemailer')


// const oAuth2Client  = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     process.env.REDIRECT_URI,
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN})

const sendEmail = async (dataEmail) =>{
    try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // generated ethereal user
                pass: 'taoeqyuovqivguzd' // generated ethereal password
            }
            })
        transporter
        .sendMail(dataEmail)
        .then((info) =>{
            console.log('Email sended successfully.');
            console.log(info)
        })
        .catch(err => {return err})


    } catch (error) {
        console.log(error)
    }
}

module.exports = sendEmail