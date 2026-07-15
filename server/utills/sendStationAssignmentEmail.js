import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendStationAssignmentEmail = (email, firstname, lastname, newStation) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER || 'janmarkking@gmail.com',
        to: email,
        subject: 'POS Terminal Assignment Updated - Suelto POS',
        html: `
            <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800; tracking-tight: -0.025em;">SUELTO POS</h2>
                    <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Retail Workstation Terminal</p>
                </div>
                <div style="border-top: 2px solid #0d9488; padding-top: 20px; color: #334155;">
                    <p style="font-size: 14px; line-height: 1.6;">Hello <strong>${firstname} ${lastname}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.6;">Your assigned register terminal has been updated by the store administrator.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin: 20px 0; text-align: center;">
                        <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 5px; tracking-wider: 0.05em;">New Workstation Assignment</span>
                        <strong style="font-size: 24px; color: #0d9488; font-family: monospace;">${newStation === 'Unassigned' ? 'STANDBY / UNASSIGNED' : newStation}</strong>
                    </div>

                    <p style="font-size: 13px; line-height: 1.6; color: #64748b;">
                        Please verify this assignment at the login workstation screen. If this is a mistake, contact your shift manager or technical support immediately.
                    </p>
                </div>
                <div style="border-top: 1px solid #f1f5f9; margin-top: 25px; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 11px;">
                    Suelto POS Systems, Inc. • Automated Register Alerts
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending station assignment email:', error);
        } else {
            console.log('Station assignment email sent: ' + info.response);
        }
    });
};

export default sendStationAssignmentEmail;
