const nodemailer = require('nodemailer')
const fs = require('fs')
const { convert } = require('html-to-text')
const ejs = require('ejs')
const juice = require('juice')

require("dotenv").config();

transporter.verify();

const transporter = nodemailer.createTransport(
    process.env.NODE_ENV === 'local' 
        ? devTransport 
        : prodTransport
);

// AJOUTE CE TEST :
transporter.verify((err, success) => {
    if (err) {
        console.log("❌ Problème de connexion SMTP :", err);
    } else {
        console.log("✅ Connexion SMTP OK !");
    }
});


const devTransport = {
    host: 'localhost',
    port: 1025,
    ignoreTLS: true
}

const prodTransport = {
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
    ignoreTLS: true,
    tls: {
        rejectUnauthorized: false
    }
}

const emailSender = async (mailOptions, templateName, data) => {
    try {
        const transporter = nodemailer.createTransport(process.env.NODE_ENV === 'local' ? devTransport : prodTransport)

        const templatePath = `views/emails/${templateName}.ejs`

        console.log(templateName, fs.existsSync(templatePath))

        if (templateName && fs.existsSync(templatePath)) {
            const template = fs.readFileSync(templatePath, "utf-8")
            let html = ejs.render(template, data)
            const text = convert(html)
            const withInlineStyle = juice(html)

            return await transporter.sendMail({
                from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
                html: withInlineStyle,
                text,
                ...mailOptions
            })
        } else {

            return await transporter.sendMail({
                from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
                ...mailOptions
            })


        }
    } catch (error) {
        throw error
    }
}

module.exports = emailSender