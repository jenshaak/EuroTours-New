import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  console.log('📧 === DIRECT EMAIL TEST STARTED ===')
  
  try {
    const body = await request.json()
    console.log('📧 Email test request:', JSON.stringify(body, null, 2))
    
    const { to, subject = 'EuroTours Email Test', message = 'This is a test email from EuroTours.' } = body
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address (to) is required' },
        { status: 400 }
      )
    }
    
    console.log('📧 Email configuration check:')
    console.log('📧 - SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET')
    console.log('📧 - SMTP_USER:', process.env.SMTP_USER || 'NOT SET')
    console.log('📧 - SMTP_PASSWORD exists:', !!process.env.SMTP_PASSWORD)
    console.log('📧 - SMTP_FROM:', process.env.SMTP_FROM || 'NOT SET')
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ Missing SMTP configuration')
      return NextResponse.json(
        { 
          error: 'SMTP configuration incomplete',
          missing: {
            SMTP_HOST: !process.env.SMTP_HOST,
            SMTP_USER: !process.env.SMTP_USER,
            SMTP_PASSWORD: !process.env.SMTP_PASSWORD,
            SMTP_FROM: !process.env.SMTP_FROM
          }
        },
        { status: 500 }
      )
    }
    
    console.log('📧 Creating nodemailer transporter...')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    })
    
    console.log('📧 Verifying SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError.message)
      return NextResponse.json(
        { 
          error: 'SMTP connection failed',
          message: verifyError.message,
          details: verifyError
        },
        { status: 500 }
      )
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">EuroTours Email Test</h2>
          <p>${message}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is a test email sent from the EuroTours email system.
          </p>
        </div>
      `
    }
    
    console.log('📧 Sending test email with options:', JSON.stringify({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    }, null, 2))
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response
    })
    
  } catch (error) {
    console.error('❌ === DIRECT EMAIL TEST ERROR ===')
    console.error('❌ Error type:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Email test failed',
        message: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    console.log('🏁 === DIRECT EMAIL TEST COMPLETED ===')
  }
} 