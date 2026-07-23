import axios from 'axios';
import { Product, isSinglePricing } from '../types/types';
import { useCartStore } from "../stores/cartStore";
import { getStripe } from './stripeConfig';
// import { useAuthStore } from '@/components/store/authStore';

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface CheckoutSessionResponse {
  status: string;
  checkout_url: string;
  session_id: string;
  amount: number;
  currency: string;
  message: string;
}

export const handlePayment = async (product: Product, bundleName?: string) => {
  try {
    // const { user } = useAuthStore.getState();
    // console.log('User from auth store:', user);
    
    let amount = 0;
    let productName = product.name;
    
    if (bundleName && !isSinglePricing(product.pricing)) {
      const bundlePricing = product.pricing[bundleName];
      amount = Math.round(parseFloat(bundlePricing.discount_price) * 100);
      productName = `${product.name} - ${bundleName}`;
    } else if (isSinglePricing(product.pricing)) {
      amount = Math.round(parseFloat(product.pricing.discount_price) * 100);
    } else {
      const firstKey = Object.keys(product.pricing)[0];
      amount = Math.round(parseFloat(product.pricing[firstKey].discount_price) * 100);
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    if (amount === 0) {
      await handleFreeProduct(product);
      return;
    }

    const response = await axios.post<CheckoutSessionResponse>(
      `${apiUrl}/api/create-checkout-session`,
      {
        productId: product.id,
        productName,
        amount,
        currency: 'usd',
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancel',
        // name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest',
        // email: user?.email || '',
      },
      { headers: getAuthHeaders() }
    );

    /* console.log('Session response:', response.data); */
    const sessionData = response.data;

    if (sessionData.status === 'success' && sessionData.checkout_url) {
      window.location.href = sessionData.checkout_url;
      return;
    }
    
    const stripe = await getStripe();

    if (!stripe) {
      alert('Payment service unavailable. Please refresh the page');
      return;
    }
        
    const { error: stripeError } = await stripe.redirectToCheckout({ 
      sessionId: sessionData.session_id 
    });

    if (stripeError) {
      console.error('Stripe redirect error:', stripeError);
      alert('Payment failed: ' + stripeError.message);
    }

  } catch (error: any) {
    console.error('Error:', error);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
      alert('Server error: ' + (error.response.data.detail || 'Unknown error'));
    } else if (error.request) {
      alert('Network error. Please check your connection.');
    } else {
      alert('An error occurred. Please try again.');
    }
  }
};

export const handleCartPayment = async () => {
  try {
    // // const { user } = useAuthStore.getState();
    // const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
    // const userEmail = user?.email || '';
    
    const { items, getTotal } = useCartStore.getState();
    const amount = Math.round(getTotal() * 100);

    if (amount === 0) {
      alert('Your cart is empty!');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.discountPrice * 100),
      },
      quantity: item.quantity,
    }));

    const response = await axios.post<CheckoutSessionResponse>(
      `${apiUrl}/api/create-cart-checkout-session`,
      {
        lineItems,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancel',
        // name: userName,
        // email: userEmail,
      },
      { headers: getAuthHeaders() }
    );

    const sessionData = response.data;

    if (sessionData.status === 'success' && sessionData.checkout_url) {
      window.location.href = sessionData.checkout_url;
      return;
    }

    const stripe = await getStripe();

    if (stripe) {
      const { error: stripeError } = await stripe.redirectToCheckout({ 
        sessionId: sessionData.session_id 
      });
      
      if (stripeError) {
        console.error('Error:', stripeError);
        alert('Payment failed. Please try again.');
      }
    }
  } catch (error: any) {
    console.error('Error:', error);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
      alert('Server error: ' + (error.response.data.detail || 'Unknown error'));
    } else if (error.request) {
      alert('Network error. Please check your connection.');
    } else {
      alert('An error occurred. Please try again.');
    }
  }
};

export const handleFreeProduct = async (product: Product) => {
  try {
    // const { user } = useAuthStore.getState();
    // const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
    // const userEmail = user?.email || '';
    
    const apiUrl = import.meta.env.VITE_API_URL;

    const response = await axios.post(
      `${apiUrl}/api/create-checkout-session`,
      {
        productId: product.id,
        productName: product.name,
        amount: 0,
        currency: 'usd',
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancel',
        // name: userName,
        // email: userEmail,
      },
      { headers: getAuthHeaders() }
    );

    alert(response.data.message || `Thank you for claiming your free ${product.name}!`);
  } catch (error: any) {
    console.error('Error claiming free product:', error);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
      alert('Failed to claim free product: ' + (error.response.data.detail || 'Unknown error'));
    } else {
      alert('Failed to claim free product. Please try again.');
    }
  }
};