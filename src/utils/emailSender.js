// const nodemailer = require('nodemailer')
// const fs = require('fs')
// const { convert } = require('html-to-text')
// const ejs = require('ejs')
// const juice = require('juice')

// require("dotenv").config();

// const devTransport = {
//     host: 'localhost',
//     port: 1025,
//     ignoreTLS: true
// }

// const prodTransport = {
//     host: process.env.MAIL_HOST,
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD,
//     },
//     // ignoreTLS: true,
//     // tls: {
//     //     rejectUnauthorized: false
//     // }
// }

// const emailSender = async (mailOptions, templateName, data) => {
//     try {
//         const transporter = nodemailer.createTransport(process.env.NODE_ENV === 'local' ? devTransport : prodTransport)

//         // TEST SMTP ICI !
//         transporter.verify((err, success) => {
//             console.log("=== TEST SMTP ===");
//             if (err) {
//                 console.log("❌ Problème de connexion SMTP :", err);
//             } else {
//                 console.log("✅ Connexion SMTP OK !");
//             }
//             console.log("=================");
//         });

//         const templatePath = `views/emails/${templateName}.ejs`

//         console.log(templateName, fs.existsSync(templatePath))

//         if (templateName && fs.existsSync(templatePath)) {
//             const template = fs.readFileSync(templatePath, "utf-8")
//             let html = ejs.render(template, data)
//             const text = convert(html)
//             const withInlineStyle = juice(html)

//             return await transporter.sendMail({
//                 from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
//                 html: withInlineStyle,
//                 text,
//                 ...mailOptions
//             })
//         } else {

//             return await transporter.sendMail({
//                 from: `"${process.env.APP_NAME}" <${process.env.MAIL_FROM}>`,
//                 ...mailOptions
//             })


//         }
//     } catch (error) {
//         throw error
//     }
// }

// module.exports = emailSender


const Brevo = require('@getbrevo/brevo');
const fs = require('fs');
const ejs = require('ejs');
const juice = require('juice');
const { convert } = require('html-to-text');

require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const emailSender = async (mailOptions, templateName, data) => {
    try {
        let html = null;
        let text = null;

        if (templateName) {
            const templatePath = `views/emails/${templateName}.ejs`;

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template introuvable : ${templatePath}`);
            }

            const rawTemplate = fs.readFileSync(templatePath, "utf-8");
            html = ejs.render(rawTemplate, data);
            html = juice(html);
            text = convert(html);
        }

        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: process.env.APP_NAME,
            email: process.env.MAIL_FROM
        };

        sendSmtpEmail.to = [{ email: mailOptions.to }];

        sendSmtpEmail.subject = mailOptions.subject;
        sendSmtpEmail.htmlContent = html || mailOptions.html;
        sendSmtpEmail.textContent = text || mailOptions.text;

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("Email envoyé via Brevo ✔️");
        return response;

    } catch (error) {
        console.error("Erreur Brevo :", error.response?.body || error);
        throw error;
    }
};

module.exports = emailSender;
