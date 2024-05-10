const pug = require("pug");

const nodemailer = require("nodemailer");
// 设置邮件传输对象
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailOptions = {
  from: process.env.EMAIL_USER,
  subject: "ChatHub验证码",
  text: "",
};
//生成随机验证码
function generateOTP() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function templateToHtml(code) {
  return pug.renderFile("./public/template/email.pug", { code: code });
}

function sendToEmail(email, cache, emailOption = emailOptions) {
  let sendOption = emailOption;
  const code = generateOTP();
  cache.set(email, code, process.env.OPT_EXPIRE);
  return new Promise(async (resolve, reject) => {
    const html = templateToHtml(code);
    sendOption.html = html;
    sendOption.to = email;
    try {
      await transporter.sendMail(sendOption);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = {
  sendToEmail,
};
