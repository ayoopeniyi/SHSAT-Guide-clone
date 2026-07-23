// API configuration
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://eznnseebbi.execute-api.ap-southeast-2.amazonaws.com/dev";

interface UserData {
  name: string;
  email: string;
  phone_number?: string;
}

interface CheckoutRequest {
  user_data: UserData;
  product_id: string; // ✅ This is required
  product_name: string;
  product_description: string;
  unit_amount: number;
  currency?: string;
  product_image?: string[];
  success_url?: string;
  cancel_url?: string;
  address_id?: string; // ✅ Make this optional with ?
}

interface CheckoutResponse {
  status: string;
  is_free_product?: boolean;
  checkout_url?: string;
  session_id?: string;
  amount?: number;
  currency?: string;
  transaction_id?: string;
  user_id?: string;
  redirect_url?: string; // Add this for free products
  message?: string;
  address_id?: string; // Echo back the address_id if provided
 
}

interface CheckoutSessionResponse {
  status: string;
  session: {
    id: string;
    payment_status: string;
    amount_total: number;
    currency: string;
    customer_email: string;
  };
}

interface TransactionResponse {
  transaction_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  product_name: string;
  product_id: string;
  price: number;
  status: "pending" | "completed" | "failed";
  stripe_session_id?: string;
  address_id: string;
  created_at: string;
  updated_at: string;
}
interface VerifyCheckoutResponse {
  status: string;
  session: {
    id: string;
    payment_status: string;
    amount_total: number;
    currency: string;
    customer_email: string;
  };
  transaction: {
    transaction_id: string; 
    user_id: string;
    user_name: string;
    user_email: string;
    product_name: string;
    price: number;
    status: string;
    stripe_session_id?: string;
    address_id: string;
    created_at: string;
    updated_at: string;
  };
  webhook_processed?: boolean;
  message?: string;
}

// Enhanced error handling helper with PostHog tracking
const handleApiError = async (response: Response, endpoint: string, method: string) => {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    let errorData: any = {};
    
    try {
      errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the JSON, use the status text
      errorMessage = response.statusText;
    }
    
    // Create error for tracking
    const error = new Error(errorMessage);
    
    // Track API error with PostHog if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      const { user } = await import('../stores/authStore').then(m => m.useAuthStore.getState());
      
      const errorProperties = {
        error_type: 'api_error',
        error_message: errorMessage,
        error_stack: error.stack,
        error_severity: response.status >= 500 ? 'high' : response.status >= 400 ? 'medium' : 'low',
        
        // API context
        api_endpoint: endpoint,
        request_method: method,
        response_status: response.status,
        response_status_text: response.statusText,
        error_data: errorData,
        
        // User context
        user_email: user?.email || 'anonymous',
        user_name: user?.name || 'anonymous',
        user_role: user?.role || 'unknown',
        
        // Request context
        page_url: window.location.href,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        
        // Additional context
        error_source: 'api_request',
        request_headers: Object.fromEntries(response.headers.entries()),
      };
      
      posthog.capture('$exception', errorProperties);
      posthog.capture('api_error_occurred', errorProperties);
      
      console.error('PostHog: API Error tracked:', {
        endpoint,
        method,
        status: response.status,
        message: errorMessage,
        user: user?.email || 'anonymous',
      });
    }
    
    throw error;
  }
  return response;
};


/**
 * Create a checkout session
 */
export const createCheckoutSession = async (
  checkoutData: CheckoutRequest  // ✅ Changed from userData: UserData
): Promise<CheckoutResponse> => {
  const endpoint = `${API_URL}/api/checkout/create-checkout-session`;
  
  try {
    //console.log('Sending checkout request:', checkoutData); // Debug log
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData), // ✅ Changed from userData
    });

    await handleApiError(response, endpoint, "POST");
    const result = await response.json();
    //console.log('Checkout response:', result); // Debug log
    return result;
  } catch (error) {
    //console.error("Error creating checkout session:", error);
    
    // Track network/request errors
    if (typeof window !== 'undefined' && (window as any).posthog) {
      const posthog = (window as any).posthog;
      const { user } = await import('../stores/authStore').then(m => m.useAuthStore.getState());
      
      const errorProperties = {
        error_type: 'network_error',
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : undefined,
        error_severity: 'high',
        
        // Request context
        api_endpoint: endpoint,
        request_method: "POST",
        request_data: { 
          hasCheckoutData: !!checkoutData, 
          product_id: checkoutData.product_id, 
          product_name: checkoutData.product_name
        },
        
        // User context
        user_email: user?.email || 'anonymous',
        user_name: user?.name || 'anonymous',
        user_role: user?.role || 'unknown',
        
        // Page context
        page_url: window.location.href,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        
        // Additional context
        error_source: 'fetch_request',
        network_status: navigator.onLine ? 'online' : 'offline',
      };
      
      posthog.capture('$exception', errorProperties);
      posthog.capture('network_error_occurred', errorProperties);
    }
    
    throw error;
  }
};

/**
 * Get checkout session details directly from the backend
 */
export const getCheckoutSession = async (
  sessionId: string,
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/checkout/session/${sessionId}`,
    );

    await handleApiError(response, `${API_URL}/api/checkout/session/${sessionId}`, "GET");
    return response.json();
  } catch (error) {
    console.error("Error getting checkout session:", error);
    throw error;
  }
};

/**
 * Get transaction details by ID
 */
export const getTransaction = async (transactionId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_URL}/api/transactions/${transactionId}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};
/**
 * Get transaction details by session ID
 */
export const getTransactionBySessionId = async (
  sessionId: string,
): Promise<TransactionResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/transactions/session/${sessionId}`,
    );

    await handleApiError(response, `${API_URL}/api/transactions/session/${sessionId}`, "GET");
    return response.json();
  } catch (error) {
    console.error("Error fetching transaction by session ID:", error);
    throw error;
  }
};

/**
 * Verify checkout success
 */
export const verifyCheckoutSuccess = async (
  sessionId: string,
): Promise<VerifyCheckoutResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/checkout/verify-success?session_id=${sessionId}`,
    );

    await handleApiError(response, `${API_URL}/api/checkout/verify-success?session_id=${sessionId}`, "GET");
    return response.json();
  } catch (error) {
    console.error("Error verifying checkout success:", error);
    throw error;
  }
};

/**
 * Download the parent guide PDF
 */
export const downloadParentGuide = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/downloads/parent-guide`);
    await handleApiError(response, `${API_URL}/api/downloads/parent-guide`, "GET");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SHSAT-Parent-Guide.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading parent guide:", error);
    throw error;
  }
};
 