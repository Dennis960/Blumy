export default class SubscriptionEntity {
  constructor(
    public id: number,
    public sensorAddress: number,
    public lastNotification: Date | null,
    public endpoint: string,
    public keys_p256dh: string,
    public keys_auth: string
  ) {}
}
