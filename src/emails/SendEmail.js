import { Resend } from 'resend';
import { ApiError } from '../utils/ApiError.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      throw new ApiError(500, error.message);
    }

    return data;
  } catch (error) {
    console.error('Email Error:', error);

    throw error instanceof ApiError ? error : new ApiError(500, 'Failed to send email.');
  }
};
