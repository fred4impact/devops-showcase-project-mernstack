"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sgMail = require("@sendgrid/mail");
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    }
    async sendTicketConfirmation(email, orderId, ticketUrls) {
        const msg = {
            to: email,
            from: this.configService.get('SENDGRID_FROM_EMAIL', 'noreply@ticketnow.app'),
            subject: 'Your TicketNow Tickets',
            html: `
        <h2>Thank you for your purchase!</h2>
        <p>Your order #${orderId} has been confirmed.</p>
        <p>Your tickets are attached below:</p>
        <ul>
          ${ticketUrls.map(url => `<li><a href="${url}">Download Ticket</a></li>`).join('')}
        </ul>
        <p>Please bring your tickets to the event.</p>
      `,
        };
        await sgMail.send(msg);
    }
    async sendTicketRefund(email, orderId, refundAmount) {
        const msg = {
            to: email,
            from: this.configService.get('SENDGRID_FROM_EMAIL', 'noreply@ticketnow.app'),
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
    async sendTicketTransferNotification(recipientEmail, ticket, message) {
        const msg = {
            to: recipientEmail,
            from: this.configService.get('SENDGRID_FROM_EMAIL', 'noreply@ticketnow.app'),
            subject: 'You\'ve Received a Ticket Transfer',
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
    async sendRefundRequestNotification(organizerEmail, ticket, refundRequest) {
        const msg = {
            to: organizerEmail,
            from: this.configService.get('SENDGRID_FROM_EMAIL', 'noreply@ticketnow.app'),
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map