import nodemailer from 'nodemailer'

// If there are no SMTP settings in .env (normal on our laptops) the email is printed
// in the terminal instead of being sent, so you can still copy the link from there.
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null

export async function sendMail(to, subject, text) {
  if (!transporter) {
    console.log(`\n----- email (not sent, no SMTP set) -----\nTo: ${to}\nSubject: ${subject}\n\n${text}\n-----\n`)
    return
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'LabLoop <no-reply@labloop.test>',
    to,
    subject,
    text,
  })
}

export function sendVerificationEmail(to, name, token) {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`
  const text =
    `Hi ${name},\n\n` +
    `Thanks for signing up to LabLoop. Please confirm your university email by opening this link:\n\n` +
    `${link}\n\n` +
    `The link works for 24 hours. If you did not sign up you can ignore this email.\n\n` +
    `LabLoop`
  return sendMail(to, 'Verify your LabLoop account', text)
}
