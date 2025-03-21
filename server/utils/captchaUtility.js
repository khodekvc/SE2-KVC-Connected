const { createCanvas, loadImage } = require("canvas");

function generateCaptcha() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captchaText = "";
    for (let i = 0; i < 6; i++) {
        captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return captchaText;
}

function generateCaptchaImage(text) {
    const width = 150, height = 50;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(text, 25, 35);

    return canvas.toDataURL();
}

module.exports = { generateCaptcha, generateCaptchaImage };