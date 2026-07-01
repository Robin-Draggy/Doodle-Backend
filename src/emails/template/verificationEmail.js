import { baseTemplate } from './baseTemplate.js';

export const verificationEmailTemplate = ({ username, verificationUrl }) => {
  return baseTemplate({
    title: 'Verify your email',

    heading: `Welcome, ${username}! 👋`,

    content: `
<p>
Thank you for creating your Doodle account.
</p>

<p>
To keep your account secure, please verify your email address before logging in.
</p>

<p>
This verification link will expire in <strong>1 hour</strong>.
</p>
`,

    buttonText: 'Verify Email',

    buttonUrl: verificationUrl,

    footer: `
© ${new Date().getFullYear()} Doodle

<br><br>

If you didn't create this account, you can safely ignore this email.
`,
  });
};
