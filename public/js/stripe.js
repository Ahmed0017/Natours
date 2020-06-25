/* eslint-disable */
import axios from 'axios';
const stripe = Stripe('pk_test_yN1o5VqK83jMTSLIH9SWQuOD008MsQdbUO');

import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from the API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form && charge the credit card
    stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
