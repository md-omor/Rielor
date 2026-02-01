import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service is not configured. Please try again later.' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Rielor Contact <contact@rielor.com>',
      to: 'programmeromor@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">New Contact Message</h2>
          
          <div style="margin-bottom: 16px;">
            <strong style="color: #64748b;">From:</strong>
            <p style="margin: 4px 0; color: #0f172a;">${name} (${email})</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong style="color: #64748b;">Subject:</strong>
            <p style="margin: 4px 0; color: #0f172a;">${subject}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <strong style="color: #64748b;">Message:</strong>
            <div style="margin: 4px 0; color: #0f172a; white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 4px; border-left: 4px solid #0f172a;">${message}</div>
          </div>
          
          <div style="margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; pt: 16px;">
            This email was sent from the Rielor contact form.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
