// API route: POST /api/contact
//
// Receives the contact form data and sends an email via Resend.
//
// Requirements:
//   1. Create a free account at resend.com
//   2. Add your API key to .env.local → RESEND_API_KEY=re_xxxx
//   3. Add recipient address to .env.local → CONTACT_EMAIL=you@example.com
//   4. Verify koykodesign.com as a sending domain in Resend dashboard

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Simple email format check — prevents malformed replyTo headers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    // Guard: fail early with a clear message if env vars are missing
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration: API key missing.' }, { status: 500 });
    }
    if (!process.env.CONTACT_EMAIL) {
      console.error('CONTACT_EMAIL environment variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration: recipient address missing.' }, { status: 500 });
    }

    // Initialise inside the handler so it runs at request time, not build time.
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Parse the JSON body sent by the contact form.
    // `website` is a honeypot field — real users never see or fill it.
    const { name, email, project, message, website } = await request.json();

    // Honeypot check: if the hidden `website` field has a value, this is almost
    // certainly a bot. Return a fake success so the bot doesn't know it was rejected.
    if (website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Basic server-side validation — reject empty required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Validate email format to prevent malformed replyTo headers
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Cap field lengths to prevent oversized payloads from reaching Resend
    if (name.length > 100 || email.length > 254 || message.length > 5000) {
      return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
    }

    // Send the email via Resend — returns { data, error }
    // Requires koykodesign.com to be verified as a sending domain in Resend.
    const { error: resendError } = await resend.emails.send({
      from: 'Koyko Design <hello@koykodesign.com>',
      to: process.env.CONTACT_EMAIL,     // kept out of source code in .env.local
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
    // Log full error and return the real message so we can debug
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
