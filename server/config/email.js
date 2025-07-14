import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    }
  });
};

export const sendInvitationEmail = async (email, token, inviterName) => {
  const transporter = createTransporter();
  const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Onboarding Management System - Complete Your Registration',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Onboarding Management System ( OMS )!</h1>
            <p>You've been invited to join our onboarding management system</p>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p><strong>OMS Portal</strong> has invited you to join the OnboardPro employee onboarding system.</p>
            <p>Click the button below to complete your registration and get started:</p>
            <div style="text-align: center;">
              <a href="${registrationLink}" class="button">Complete Registration</a>
            </div>
            <p><strong>Important:</strong> This invitation link will expire in 24 hours.</p>
            <p>If you have any questions, please contact your administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Onboarding Management System - OMS</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

export const sendRegistrationConfirmation = async (email, userName, adminEmail) => {
  const transporter = createTransporter();

  // Send confirmation to admin
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'New Employee Registration Completed',
    html: `
      <h3>Registration Notification</h3>
      <p><strong>${userName}</strong> has successfully completed their registration.</p>
      <p>Email: ${email}</p>
      <p>You can now manage their onboarding process in the admin panel.</p>
    `
  });
};