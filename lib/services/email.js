import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    try {
      // Initialize nodemailer with SMTP settings
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      // Verify connection
      if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        await this.transporter.verify()
        console.log('✅ Email service initialized')
      } else {
        console.warn('⚠️ Email credentials not configured - emails will be logged only')
      }
      
      this.initialized = true
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
      this.initialized = true // Mark as initialized but disabled
    }
  }

  async sendOrderConfirmation(order, route = null) {
    await this.initialize()
    
    const { passenger, id: orderId, totalPrice, currency, paymentMethod } = order
    
    const emailContent = this.generateConfirmationEmail(order, route)
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@eurotours.com',
      to: passenger.email,
      subject: `🎫 Your EuroTours Ticket Confirmation - Order ${orderId}`,
      html: emailContent,
      text: this.generatePlainTextEmail(order, route)
    }

    try {
      if (this.transporter && process.env.SMTP_USER) {
        const info = await this.transporter.sendMail(mailOptions)
        console.log(`✅ Confirmation email sent to ${passenger.email}:`, info.messageId)
        return { success: true, messageId: info.messageId }
      } else {
        // Log email content when SMTP is not configured
        console.log('📧 Email would be sent (SMTP not configured):')
        console.log(`To: ${passenger.email}`)
        console.log(`Subject: ${mailOptions.subject}`)
        console.log('Content:', emailContent)
        return { success: true, messageId: 'logged-only' }
      }
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error)
      throw error
    }
  }

  generateConfirmationEmail(order, route) {
    const { passenger, id: orderId, totalPrice, currency, paymentMethod } = order
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EuroTours Ticket Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .success { color: #16a34a; font-weight: bold; }
            .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎫 EuroTours</h1>
            <h2>Ticket Confirmation</h2>
        </div>
        
        <div class="content">
            <p>Dear ${passenger.fullName},</p>
            
            <p class="success">✅ Your payment has been successfully processed!</p>
            
            <div class="ticket-box">
                <h3>🚌 Your Bus Ticket Details</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Passenger:</strong> ${passenger.fullName}</p>
                <p><strong>Email:</strong> ${passenger.email}</p>
                <p><strong>Phone:</strong> ${passenger.phone}</p>
                
                ${route ? `
                <hr>
                <p><strong>Route:</strong> ${route.fromCity} → ${route.toCity}</p>
                <p><strong>Departure:</strong> ${new Date(route.departureTime).toLocaleString()}</p>
                <p><strong>Arrival:</strong> ${new Date(route.arrivalTime).toLocaleString()}</p>
                <p><strong>Carrier:</strong> ${route.carrier || 'Bus Carrier'}</p>
                ` : ''}
                
                <hr>
                <p><strong>Total Paid:</strong> <span class="amount">${totalPrice} ${currency}</span></p>
                <p><strong>Payment Method:</strong> ${this.formatPaymentMethod(paymentMethod)}</p>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
                <li>Keep this email as your ticket confirmation</li>
                <li>Arrive at the departure location 15 minutes before departure</li>
                <li>Bring a valid photo ID for the journey</li>
                <li>Contact us if you have any questions</li>
            </ul>
            
            <p>Thank you for choosing EuroTours! Have a wonderful journey! 🚌</p>
        </div>
        
        <div class="footer">
            <p>EuroTours - European Bus Ticket Platform</p>
            <p>For support, contact us at info@eurotours.com</p>
        </div>
    </body>
    </html>
    `
  }

  generatePlainTextEmail(order, route) {
    const { passenger, id: orderId, totalPrice, currency, paymentMethod } = order
    
    return `
🎫 EuroTours - Ticket Confirmation

Dear ${passenger.fullName},

✅ Your payment has been successfully processed!

🚌 Your Bus Ticket Details:
Order ID: ${orderId}
Passenger: ${passenger.fullName}
Email: ${passenger.email}
Phone: ${passenger.phone}

${route ? `
Route: ${route.fromCity} → ${route.toCity}
Departure: ${new Date(route.departureTime).toLocaleString()}
Arrival: ${new Date(route.arrivalTime).toLocaleString()}
Carrier: ${route.carrier || 'Bus Carrier'}
` : ''}

Total Paid: ${totalPrice} ${currency}
Payment Method: ${this.formatPaymentMethod(paymentMethod)}

What's next?
• Keep this email as your ticket confirmation
• Arrive at the departure location 15 minutes before departure
• Bring a valid photo ID for the journey
• Contact us if you have any questions

Thank you for choosing EuroTours! Have a wonderful journey! 🚌

---
EuroTours - European Bus Ticket Platform
For support, contact us at info@eurotours.com
    `.trim()
  }

  formatPaymentMethod(method) {
    switch (method) {
      case 'coinbase': return 'Coinbase Commerce (Cryptocurrency)'
      case 'coinremitter': return 'CoinRemitter (Cryptocurrency)'
      case 'onchainkit': return 'OnchainKit (Cryptocurrency)'
      case 'card': return 'Credit/Debit Card'
      default: return method
    }
  }
}

// Create singleton instance
const emailService = new EmailService()

export { emailService } 