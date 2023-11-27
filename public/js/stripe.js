import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51OFXCASCWNJw36ESYAlAyXeOoqvUBZWWmjOumk7Vp2wzujM1PJZKDVPnsjpMMTRsPsuJE09gkZ9dyKkxLWPqqfX6002gaVX3lY'
);

export const bookTour = async tourId => {
  const HOST = 'http://127.0.0.1:3000';

  try {
    const session = await axios.get(
      `${HOST}/api/v1/booking/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }

  console.log(session);
};
