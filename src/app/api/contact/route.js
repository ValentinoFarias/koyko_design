// API route: POST /api/contact
//
// Receives the contact form data and sends an email to hello@koykodesign.com
// using Resend (https://resend.com).
//
// Requirements:
//   1. Create a free account at resend.com
//   2. Add your API key to .env.local → RESEND_API_KEY=re_xxxx
//   3. Verify your sending domain in Resend (or use their onboarding@resend.dev
//      address while testing)

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Resend client — reads the API key from environment variables so it's never
// hardcoded in the source code
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Parse the JSON body sent by the contact form
    const { name, email, project, message } = await request.json();

    // Basic server-side validation — reject empty required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Send the email via Resend — returns { data, error }
    const { error: resendError } = await resend.emails.send({
      from: 'Koyko Contact Form <onboarding@resend.dev>', // change to your verified domain later
      to: 'valentinofariascarrion@gmail.com',
      replyTo: email,                    // clicking Reply in the inbox goes to the visitor
      subject: `New enquiry from ${name} — ${project || 'General'}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Project type: ${project || 'Not specified'}`,
        ``,
        `Message:`,
        message,
      ].join('\n'),
    });

    // If Resend returned an error object, log it and tell the client
    if (resendError) {
      console.error('Resend error:', resendError);
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
