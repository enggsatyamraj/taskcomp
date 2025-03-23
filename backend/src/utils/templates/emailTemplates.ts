import { EmailType } from "../enums";

interface EmailTemplates {
    [key: string]: {
        subject: string;
        html: string;
        text?: string;
    }
}

export const EMAIL_TEMPLATES = (payload: { [key: string]: any }, key: EmailType) => {
    const values: EmailTemplates = {
        [EmailType.WELCOME]: {
            subject: 'Welcome to Task Manager!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Task Manager!</h2>
                    <p>Hello ${payload.name},</p>
                    <p>Thank you for signing up with Task Manager. We're excited to have you on board!</p>
                    <p>With our app, you can:</p>
                    <ul>
                        <li>Create and organize tasks</li>
                        <li>Track your progress</li>
                        <li>Set priorities and deadlines</li>
                        <li>Stay productive on the go</li>
                    </ul>
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    <p>Best regards,<br>The Task Manager Team</p>
                </div>
            `,
            text: `
                Welcome to Task Manager!
                
                Hello ${payload.name},
                
                Thank you for signing up with Task Manager. We're excited to have you on board!
                
                With our app, you can:
                - Create and organize tasks
                - Track your progress
                - Set priorities and deadlines
                - Stay productive on the go
                
                If you have any questions or need assistance, please don't hesitate to contact our support team.
                
                Best regards,
                The Task Manager Team
            `
        },
        [EmailType.RESET_PASSWORD]: {
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>Hello ${payload.name},</p>
                    <p>We received a request to reset your password. To proceed with the password reset, please click the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${payload.resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
                    <p>Best regards,<br>The Task Manager Team</p>
                </div>
            `,
            text: `
                Reset Your Password
                
                Hello ${payload.name},
                
                We received a request to reset your password. To proceed with the password reset, please visit the following link:
                
                ${payload.resetUrl}
                
                This link will expire in 1 hour for security reasons.
                
                If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
                
                Best regards,
                The Task Manager Team
            `
        },
        [EmailType.PASSWORD_RESET_SUCCESS]: {
            subject: 'Password Reset Successful',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Successful</h2>
                    <p>Hello ${payload.name},</p>
                    <p>Your password has been successfully reset.</p>
                    <p>You can now log in to your account with your new password.</p>
                    <p>If you did not request this change, please contact our support team immediately.</p>
                    <p>Best regards,<br>The Task Manager Team</p>
                </div>
            `,
            text: `
                Password Reset Successful
                
                Hello ${payload.name},
                
                Your password has been successfully reset.
                
                You can now log in to your account with your new password.
                
                If you did not request this change, please contact our support team immediately.
                
                Best regards,
                The Task Manager Team
            `
        },
        [EmailType.PASSWORD_CHANGED]: {
            subject: 'Password Change Notification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Change Notification</h2>
                    <p>Hello ${payload.name},</p>
                    <p>Your password has been successfully changed.</p>
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    <p>Best regards,<br>The Task Manager Team</p>
                </div>
            `,
            text: `
                Password Change Notification
                
                Hello ${payload.name},
                
                Your password has been successfully changed.
                
                If you did not make this change, please contact our support team immediately.
                
                Best regards,
                The Task Manager Team
            `
        }
    };

    return values[key];
};

/**
 * Helper function to get email template content and subject
 * @param templateType Email template type
 * @param payload Data for template
 * @returns Email template content
 */
export const getEmailTemplate = (templateType: EmailType, payload: any) => {
    const template = EMAIL_TEMPLATES(payload, templateType);

    if (!template) {
        throw new Error(`Email template not found for type: ${templateType}`);
    }

    return {
        htmlContent: template.html,
        textContent: template.text || '',
        emailSubject: template.subject
    };
};