import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse incoming JSON payloads with a higher limit for base64 documents/attachments
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Email API route utilizing Gmail SMTP
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html, text, gmailUser, gmailAppPassword } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: "Missing recipient (to) or subject." });
    }

    const senderEmail = gmailUser || process.env.GMAIL_USER || "dopesaccommodationagency@gmail.com";
    const appPassword = gmailAppPassword || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

    if (!appPassword) {
      console.warn("Gmail App Password not configured. Processing mock success...");
      return res.json({ 
        success: true, 
        simulated: true,
        message: "No App Password. Email simulated successfully inside Dev server." 
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

      if (req.body.attachments && Array.isArray(req.body.attachments)) {
        mailOptions.attachments = req.body.attachments;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log("Email successfully dispatched to:", to, "ID:", info.messageId);
      return res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("Nodemailer dispatch failure:", error);
      
      const errMsg = error instanceof Error ? error.message : String(error);
      const isAuthFailure = errMsg.includes("535") || errMsg.toLowerCase().includes("invalid login") || errMsg.toLowerCase().includes("auth");
      
      if (isAuthFailure) {
        console.error("================ GMAIL AUTHENTICATION FAILURE (535) INTERCEPTED ================");
        console.error(`Attempted Login User: ${senderEmail}`);
        console.error("Troubleshooting Checklist:");
        console.error("1. Check if you typed your standard Google account account password instead of a 16-character SMTP APP PASSWORD.");
        console.error("   Generate one here: https://myaccount.google.com/apppasswords");
        console.error("2. Ensure they are generated for the EXACT Google account address configured in GMAIL_USER secret.");
        console.error("3. If you do not configure GMAIL_USER, it defaults to 'dopesaccommodationagency@gmail.com'. Please set GMAIL_USER to match the account the password belongs to!");
        console.error("===============================================================================");
      }

      return res.json({ 
        success: false, 
        warning: isAuthFailure ? "SMTP authentication failed. Your Gmail App Password was rejected by Google." : "SMTP dispatch failed.", 
        details: errMsg,
        suggestion: "Please configure your 16-character Google App Password (excluding spaces) and verify your Gmail User matches your account. Generate details at: https://myaccount.google.com/apppasswords"
      });
    }
  });

  // Support health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
