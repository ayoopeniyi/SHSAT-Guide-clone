import { loadStripe, Stripe } from '@stripe/stripe-js';

// Environment-based Stripe configuration
export const getStripeConfig = () => {
  const env = import.meta.env.VITE_ENV || 'production';
  
  // Log current environment for debugging
  /* console.log('Stripe Environment:', env); */
  
  let publishableKey: string;
  
  if (env === 'preview') {
    // Use LIVE keys for preview deployments
    publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE || 'pk_live_51RO9zGFdriSefP0keu1Kkzz7LT3rcc5N5K33etGvAdg9rwuQC30mjXnrm7fIuunQ45QVJ0VgUA0eMuq58JNLxQ0100DRty1p7K';
    /* console.log('Using LIVE Stripe keys for preview environment'); */
  } else {
    // Use TEST keys for production deployments
    publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST || 'pk_test_51RO9zeFtLJBuwCQB6sCvLcw4CUwyH3umloStyWXqezVHXOMADRxVoOmh6eISB7IGhJQQ5ovYoDecccBCBXLVr1cV00DQHG9G6D';
    /* console.log('Using TEST Stripe keys for production environment'); */
  }
  
  return {
    publishableKey,
    mode: env === 'preview' ? 'live' : 'test'
  };
};

// Initialize Stripe with dynamic configuration
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const { publishableKey } = getStripeConfig();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Helper function to get current Stripe mode
export const getStripeMode = (): 'live' | 'test' => {
  const env = import.meta.env.VITE_ENV || 'production';
  return env === 'preview' ? 'live' : 'test';
};

// Helper function to check if we're in live mode
export const isLiveMode = (): boolean => {
  return getStripeMode() === 'live';
};
