interface WebhookEvent {
  paymentId: string;
  status: string;
  processedAt?: number;
}

class WebhookHandler {
  private processedEvents = new Map<string, WebhookEvent>();

  handlePaymentEvent(event: WebhookEvent): { status: 'PROCESSED' | 'IGNORED_DUPLICATE'; licenseActive: boolean } {
    // Idempotência baseada no paymentId
    if (this.processedEvents.has(event.paymentId)) {
      return {
        status: 'IGNORED_DUPLICATE',
        licenseActive: true,
      };
    }

    this.processedEvents.set(event.paymentId, {
      ...event,
      processedAt: Date.now(),
    });

    return {
      status: 'PROCESSED',
      licenseActive: event.status === 'approved',
    };
  }
}

describe('Mercado Pago Webhook Idempotency', () => {
  it('processes payment event once and safely ignores subsequent duplicate deliveries', () => {
    const handler = new WebhookHandler();
    const event: WebhookEvent = {
      paymentId: 'mp_pay_987654321',
      status: 'approved',
    };

    // 1ª entrega
    const res1 = handler.handlePaymentEvent(event);
    expect(res1.status).toBe('PROCESSED');
    expect(res1.licenseActive).toBe(true);

    // 2ª entrega repetida (retry do Mercado Pago)
    const res2 = handler.handlePaymentEvent(event);
    expect(res2.status).toBe('IGNORED_DUPLICATE');
    expect(res2.licenseActive).toBe(true);

    // 3ª entrega repetida
    const res3 = handler.handlePaymentEvent(event);
    expect(res3.status).toBe('IGNORED_DUPLICATE');
  });
});
