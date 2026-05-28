import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  // Handle CORS if needed
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests for sending emails
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST instead." });
  }

  const { to, subject, html, text, gmailUser, gmailAppPassword, attachments } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: "Missing recipient (to) or subject." });
  }

  const senderEmail = gmailUser || process.env.GMAIL_USER || "dopesaccommodationagency@gmail.com";
  const appPassword = gmailAppPassword || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (!appPassword) {
    console.warn("Gmail App Password not configured.");
    return res.status(200).json({ 
      success: true, 
      simulated: true,
      message: "No App Password. Email simulated successfully inside Vercel Serverless Function." 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword,
      },
    });

    const mailOptions: any = {
      from: `"Dopes Accommodation Agency" <${senderEmail}>`,
      to,
      subject,
      html: html || undefined,
      text,
    };

    if (attachments && Array.isArray(attachments)) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email successfully dispatched via Vercel to:", to, "ID:", info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Nodemailer dispatch failure on Vercel:", error);
    
    const errMsg = error instanceof Error ? error.message : String(error);
    const isAuthFailure = errMsg.includes("535") || errMsg.toLowerCase().includes("invalid login") || errMsg.toLowerCase().includes("auth");

    return res.status(200).json({ 
      success: false, 
      warning: isAuthFailure ? "SMTP authentication failed. Your Gmail App Password was rejected by Google." : "SMTP dispatch failed.", 
      details: errMsg,
      suggestion: "Please configure your 16-character Google App Password (excluding spaces) and verify your Gmail User matches your account."
    });
  }
}
