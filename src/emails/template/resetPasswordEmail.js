import { baseTemplate } from './baseTemplate.js';

export const resetPasswordEmailTemplate = ({ username, resetUrl }) => {
  return baseTemplate({
    title: 'Reset Password',

    heading: 'Reset Your Password 🔐',

    content: `

<p>

Hello ${username},

</p>

<p>

We received a request to reset your password.

</p>

<p>

Click below to create a new password.

</p>

<p>

This link expires in 15 minutes.

</p>

`,

    buttonText: 'Reset Password',

    buttonUrl: resetUrl,

    footer: `
If you didn't request a password reset, ignore this email.
`,
  });
};
