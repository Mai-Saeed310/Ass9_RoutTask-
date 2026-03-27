import nodemailer from 'nodemailer'; 
import { EMAIL, PASSWORD } from '../../../config/config.service.js';


export const sendEmail = async ({ to, subject, html, attachments }) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"SarahaApp" <${EMAIL}>`,
    to,
    subject: subject || "Hello",
    html: html || "<b>Hello world</b>",
    // attachments: attachments || [
    //   {
    //     filename: "test.txt",
    //     content: "Hello world"
    //   }
    // ]
  });

  console.log("Message sent:", info.messageId);

  return info.accepted.length > 0 ? true : false;

}

export const generateOtp = async () => {
  return Math.floor(Math.random() * 900000 + 100000);
}