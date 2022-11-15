require('dotenv').config();

const { google } = require('googleapis')
const nodemailer = require('nodemailer')


const oAuth2Client  = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN})

const sendEmail = async (dataEmail) =>{
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        // const transporter = nodemailer.createTransport({
        //     service: 'smtp.gmail.com',
        //     port: 456,
        //     secure: true, 
        //     auth: {
        //         type: 'OAuth2',
        //         user: process.env.EMAIL_USER,
        //         clientId: process.env.GOOGLE_CLIENT_ID,
        //         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //         refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        //         accessToken,
        //     }
        // })
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // generated ethereal user
                pass: 'asdfgyuiop09876' // generated ethereal password
            }
            })
        transporter
        .sendMail(dataEmail)
        .then((info) =>{
            console.log('Email sended successfully.');
            console.log(info)
        })
        .catch(err => console.log(err))


    } catch (error) {
        console.log(error)
    }
}

module.exports = sendEmail