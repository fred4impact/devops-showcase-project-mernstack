import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendTicketConfirmation(
    email: string,
    orderId: string,
    ticketUrls: string[],
  ): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.get(
        'SENDGRID_FROM_EMAIL',
        'noreply@ticketnow.app',
      ),
      subject: 'Your TicketNow Tickets',
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your order #${orderId} has been confirmed.</p>
        <p>Your tickets are attached below:</p>
        <ul>
          ${ticketUrls.map((url) => `<li><a href="${url}">Download Ticket</a></li>`).join('')}
        </ul>
        <p>Please bring your tickets to the event.</p>
      `,
    };

    await sgMail.send(msg);
  }

  async sendTicketRefund(
    email: string,
    orderId: string,
    refundAmount: number,
  ): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.get(
        'SENDGRID_FROM_EMAIL',
        'noreply@ticketnow.app',
      ),
      subject: 'TicketNow Refund Confirmation',
      html: `
        <h2>Refund Processed</h2>
        <p>Your order #${orderId} has been refunded.</p>
        <p>Refund amount: $${(refundAmount / 100).toFixed(2)}</p>
        <p>The refund will appear on your original payment method within 5-10 business days.</p>
      `,
    };

    await sgMail.send(msg);
  }

  async sendTicketTransferNotification(
    recipientEmail: string,
    ticket: any,
    message?: string,
  ): Promise<void> {
    const msg = {
      to: recipientEmail,
      from: this.configService.get(
        'SENDGRID_FROM_EMAIL',
        'noreply@ticketnow.app',
      ),
      subject: "You've Received a Ticket Transfer",
      html: `
        <h2>Ticket Transfer</h2>
        <p>You've received a ticket transfer!</p>
        <p><strong>Event:</strong> ${ticket.eventId?.title || 'Event'}</p>
        <p><strong>Ticket Type:</strong> ${ticket.ticketTypeId?.name || 'Ticket'}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <p>You can view your ticket in your TicketNow account.</p>
      `,
    };

    await sgMail.send(msg);
  }

  async sendRefundRequestNotification(
    organizerEmail: string,
    ticket: any,
    refundRequest: any,
  ): Promise<void> {
    const msg = {
      to: organizerEmail,
      from: this.configService.get(
        'SENDGRID_FROM_EMAIL',
        'noreply@ticketnow.app',
      ),
      subject: 'New Refund Request',
      html: `
        <h2>New Refund Request</h2>
        <p>A customer has requested a refund for their ticket.</p>
        <p><strong>Event:</strong> ${ticket.eventId?.title || 'Event'}</p>
        <p><strong>Ticket Type:</strong> ${ticket.ticketTypeId?.name || 'Ticket'}</p>
        <p><strong>Reason:</strong> ${refundRequest.reason}</p>
        ${refundRequest.description ? `<p><strong>Description:</strong> ${refundRequest.description}</p>` : ''}
        <p>Please review this request in your organizer dashboard.</p>
      `,
    };

    await sgMail.send(msg);
  }
}
