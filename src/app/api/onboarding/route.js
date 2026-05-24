// API route: POST /api/onboarding
//
// Receives the client onboarding form data and sends a summary email via Resend.
//
// Requirements (same as /api/contact):
//   1. RESEND_API_KEY in .env.local
//   2. CONTACT_EMAIL in .env.local
//   3. koykodesign.com verified as a sending domain in Resend

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Simple email format check — prevents malformed replyTo headers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration: API key missing.' }, { status: 500 });
    }
    if (!process.env.CONTACT_EMAIL) {
      console.error('CONTACT_EMAIL environment variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration: recipient address missing.' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const {
      name, restaurant, email,
      tier, goal,
      photos, domain,
      hosting,
      payment,
      timeline, other,
      website, // honeypot
    } = await request.json();

    // Honeypot: if the hidden field is filled it's a bot — return a fake 200
    if (website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Required fields
    if (!name || !email || !restaurant) {
      return NextResponse.json(
        { error: 'Name, email, and restaurant name are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Cap lengths to prevent oversized payloads
    const fields = [name, restaurant, email, tier, goal, photos, domain, hosting, timeline, other];
    if (fields.some(f => f && f.length > 500)) {
      return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
    }

    const { error: resendError } = await resend.emails.send({
      from: 'Koyko Design <hello@koykodesign.com>',
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `New onboarding — ${name} (${restaurant})`,
      text: [
        '--- 01 About You ---',
        `Name:             ${name}`,
        `Restaurant:       ${restaurant}`,
        `Email:            ${email}`,
        '',
        '--- 02 The Project ---',
        `Tier:             ${tier || 'Not selected'}`,
        `Goal:             ${goal || 'Not provided'}`,
        '',
        '--- 03 Assets & Content ---',
        `Photos ready:     ${photos || 'Not answered'}`,
        `Has domain:       ${domain || 'Not answered'}`,
        '',
        '--- 04 Hosting ---',
        `Hosting:          ${hosting || 'Not selected'}`,
        '',
        '--- 05 Payment ---',
        `Payment plan:     ${payment ? `${payment} instalment${payment !== '1' ? 's' : ''}` : 'Not selected'}`,
        '',
        '--- 06 Timeline ---',
        `Go-live target:   ${timeline || 'Not provided'}`,
        `Other notes:      ${other || 'None'}`,
      ].join('\n'),
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Onboarding form error:', error);
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
