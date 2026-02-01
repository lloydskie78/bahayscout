import React from 'react'

// Simple HTML email templates (can be enhanced with @react-email/components later)

interface InquiryEmailProps {
  listingTitle: string
  listingUrl: string
  inquirerName: string
  inquirerEmail: string
  inquirerPhone?: string
  message: string
}

export function InquiryEmailToLister({
  listingTitle,
  listingUrl,
  inquirerName,
  inquirerEmail,
  inquirerPhone,
  message,
}: InquiryEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>New Inquiry for {listingTitle}</h2>
      <p>You have received a new inquiry for your property listing.</p>
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px', margin: '20px 0' }}>
        <p><strong>From:</strong> {inquirerName}</p>
        <p><strong>Email:</strong> {inquirerEmail}</p>
        {inquirerPhone && <p><strong>Phone:</strong> {inquirerPhone}</p>}
        <p><strong>Message:</strong></p>
        <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
      </div>
      <p>
        <a href={listingUrl} style={{ color: '#007bff', textDecoration: 'none' }}>
          View Listing →
        </a>
      </p>
      <p style={{ color: '#666', fontSize: '12px', marginTop: '30px' }}>
        This inquiry was sent through BahayScout.ph
      </p>
    </div>
  )
}

export function InquiryConfirmationEmail({
  listingTitle,
  listingUrl,
}: {
  listingTitle: string
  listingUrl: string
}) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#333' }}>Inquiry Sent Successfully</h2>
      <p>Thank you for your interest in <strong>{listingTitle}</strong>.</p>
      <p>We have sent your message to the property owner/agent. They should get back to you soon.</p>
      <p>
        <a href={listingUrl} style={{ color: '#007bff', textDecoration: 'none' }}>
          View Listing →
        </a>
      </p>
      <p style={{ color: '#666', fontSize: '12px', marginTop: '30px' }}>
        BahayScout.ph - Hanap-bahay, mabilis.
      </p>
    </div>
  )
}
