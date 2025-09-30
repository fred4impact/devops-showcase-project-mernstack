import { Injectable, Logger } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';
import { OrdersService } from '../orders/orders.service';
import { TicketsService } from '../tickets/tickets.service';
import { OrderStatus } from '../schemas/order.schema';
import Stripe from 'stripe';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly ticketsService: TicketsService,
  ) {}

  async handleStripeWebhook(event: Stripe.Event) {
    this.logger.log(`Processing webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.dispute.created':
        await this.handleChargeDispute(event.data.object as Stripe.Dispute);
        break;
      
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
      
      // Find and confirm the order
      const order = await this.ordersService.confirmPayment(paymentIntent.id);
      
      // Generate tickets for the order
      await this.ticketsService.generateTicketsForOrder((order as any)._id.toString());
      
      this.logger.log(`Order ${(order as any)._id} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing payment succeeded: ${error.message}`, error.stack);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Payment failed: ${paymentIntent.id}`);
      
      // Find the order and mark it as failed
      const order = await this.ordersService.findByPaymentIntentId(paymentIntent.id);
      if (order) {
        await this.ordersService.updateStatus((order as any)._id.toString(), OrderStatus.FAILED);
        this.logger.log(`Order ${(order as any)._id} marked as failed`);
      }
    } catch (error) {
      this.logger.error(`Error processing payment failed: ${error.message}`, error.stack);
    }
  }

  private async handleChargeDispute(dispute: Stripe.Dispute) {
    try {
      this.logger.log(`Charge dispute created: ${dispute.id}`);
      
      // Handle dispute logic here
      // This would typically involve notifying the organizer
      // and potentially freezing funds
    } catch (error) {
      this.logger.error(`Error processing dispute: ${error.message}`, error.stack);
    }
  }
}
