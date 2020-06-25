const client = require('twilio')(
  process.env.TWILIO_ACCOUNTSID,
  process.env.TWILIO_AUTHTOKEN
);

exports.twilioSendCustom = async (body, from, to) => {
  return await client.messages.create({
    body,
    from,
    to
  });
};

exports.twilioSend = async (fullPhone, locale = 'en') => {
  return await client.verify.services(process.env.TWILIO_SERVICEID).verifications.create({
    to: fullPhone,
    channel: 'sms',
    locale
  });
};

exports.twilioVerify = async (fullPhone, code) => {
  return await client.verify
    .services(process.env.TWILIO_SERVICEID)
    .verificationChecks.create({ to: fullPhone, code });
};
