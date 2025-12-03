export interface SmsMessage {
  to: string;
  body: string;
}

export interface ISmsProvider {
  sendSms(message: SmsMessage): Promise<void>;
}


