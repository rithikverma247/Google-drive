const nodemailer = require("nodemailer");
const googleApis = require("googleapis");
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `383101855767-grp2m71cgoio73ks7mhcs4op40t0n6oc.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04sU7U6XJFsrVCgYIARAAGAQSNwF-L9IrX4iVBFmlhHRZTa-eU1TA-L-z5V11z3qCOy3G65SDN7_8zAngFJPakSlEE76z9Vm_k58`;
const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
authClient.setCredentials({
    refresh_token: REFRESH_TOKEN
});
async function mailer(email, userid, token) {
    try {
        const ACCESS_TOKEN = await authClient.getAccessToken();
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "ak1933929@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })

        const details = {
            from: "Asad <ak1933929@gmail.com>",
            to: email,
            subject: "hello Sir/Mam",
            text: "hi",
            html:`<a href="http://127.0.0.1:3000/reset/${userid}/${token}">reset link</a>`
        
        }
        const result = await transport.sendMail(details);
        return result;
    } catch (err) {
        return err;
    }
}
 
module.exports = mailer;