import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { StripeService } from '../stripe/stripe.service';
import { Request, Response } from 'express';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('stripe')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.stripeService.constructWebhookEvent(
        req.body,
        signature,
      );

      await this.webhooksService.handleStripeWebhook(event);

      res.status(HttpStatus.OK).send('Webhook processed successfully');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(HttpStatus.BAD_REQUEST).send('Webhook processing failed');
    }
  }
}
