import nodeMailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };
  try {
    await transporter.sendMail(options);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export async function notifyOnUpload({ creatorEmail, editorEmail, videoUrl, by }, res) {
  const isCreator = by === 'creator';
  const to       = isCreator ? editorEmail : creatorEmail;
  const subject  = isCreator
    ? 'New Video Ready for Editing 🎬'
    : 'Your Edited Video Is Ready 🎬';
  const message     = isCreator
    ? generateRawUploadTemplate(videoUrl, creatorEmail)
    : generateEditedUploadTemplate(videoUrl, editorEmail);

  try {
    await sendEmail({ email: to, subject, message });
    console.log(`Notification sent to ${to}`);
  } catch (err) {
    console.error("Failed to send notification to", to, err);
  }
}

function generateRawUploadTemplate(videoUrl, creatorEmail) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;
                background:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;">
      <h2 style="text-align:center;color:#333;">New Video Ready for Editing</h2>
      <p>Hello,</p>
      <p>The creator (<strong>${creatorEmail}</strong>) has just uploaded a new raw video. Please click below to start editing:</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${videoUrl}" style="display:inline-block;padding:12px 24px;
           background:#4CAF50;color:#fff;border-radius:5px;text-decoration:none;">
          Check Video
        </a>
      </div>
      <p style="font-size:14px;color:#666;">Thanks,<br/>The YT Manager Team</p>
    </div>
  `;
}

function generateEditedUploadTemplate(videoUrl, editorEmail) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;
                background:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;">
      <h2 style="text-align:center;color:#333;">Your Edited Video Is Ready</h2>
      <p>Hello,</p>
      <p>Your editor (<strong>${editorEmail}</strong>) has finished the video. Click below to view:</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${videoUrl}" style="display:inline-block;padding:12px 24px;
           background:#4CAF50;color:#fff;border-radius:5px;text-decoration:none;">
          Watch Video
        </a>
      </div>
      <p style="font-size:14px;color:#666;">Thanks,<br/>The YT Manager Team</p>
    </div>
  `;
}
