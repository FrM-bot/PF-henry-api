import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SECRET,
    pass: process.env.GOOGLE_SECRET
  },
  tls: {
    rejectUnauthorized: false
  }
})

transporter.verify().then(() => {
  console.log('ready for send emails')
})
