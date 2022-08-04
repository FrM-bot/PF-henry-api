import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'proyectofinalhenryg2@gmail.com',
    pass: 'qvszyokncaknfcoc'
  },
  tls: {
    rejectUnauthorized: false
  }
})
console.log(process.env.EMAIL_SECRET)
transporter.verify().then(() => {
  console.log('ready for send emails')
})
