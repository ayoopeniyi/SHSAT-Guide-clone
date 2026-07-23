import { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowRight,
    CheckCircle,
    Circle,
    ShoppingCart,
    X,
    Search,
    Loader2,
    Trash2,
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    type: "course" | "testpack" | "question_bank";
}

interface CartItem extends Product {
    quantity: number;
}

export default function LmsProducts() {
    const backendUrl = import.meta.env.VITE_API_URL;


    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [checkoutStatus, setCheckoutStatus] =
        useState<"idle" | "success" | "cancel" | "processing">("idle");

    // Load products
    useEffect(() => {
        async function load() {
            try {
                const res = await axios.get(`${backendUrl}/api/ecommerce/products`);
                const api = res.data || {};
                const formatted: Product[] = [];

                Object.keys(api).forEach((groupKey) => {
                    const groupItems = api[groupKey];

                    if (!Array.isArray(groupItems) || groupItems.length === 0) return;

                    const validProducts = groupItems.filter((item: any) => {
                        return (
                            item.id &&
                            (item.title || item.name) &&
                            (item.cost !== undefined || item.price !== undefined)
                        );
                    });

                    if (validProducts.length === 0) return;

                    validProducts.forEach((item: any) => {
                        // Map the type correctly to match backend enum
                        let productType: "course" | "testpack" | "question_bank";

                        if (groupKey === "courses") {
                            productType = "course";
                        } else if (groupKey === "testpacks" || groupKey === "testpack") {
                            productType = "testpack";
                        } else if (groupKey === "questionBanks" || groupKey === "questionBank") {
                            productType = "question_bank";
                        } else {
                            productType = "course";
                        }

                        formatted.push({
                            id: item.id,
                            name: item.title || item.name,
                            description: item.description || "",
                            price: parseFloat(item.price || item.cost),
                            image_url: item.logo || item.image || null,
                            type: productType,
                        });
                    });
                });

                setProducts(formatted);
                setFilteredProducts(formatted);
            } catch (err) {
                setError("Failed to load products");
                console.error("Error loading products:", err);
            } finally {
                setLoadingProducts(false);
            }
        }

        load();
    }, []);


    // Check if product is in cart
    const isProductInCart = (productId: string) => {
        return cart.some(item => item.id === productId);
    };

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });

        if (!checkoutOpen) {
            setCheckoutOpen(true);
        }
    };

    // // Remove product from cart
    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };



    // Calculate cart total
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Calculate cart items count
    const cartItemsCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const handleCheckout = async () => {
        if (!email || cart.length === 0) return;

        setCheckoutStatus("processing");

        try {
            // Prepare checkout payload exactly as backend expects
            const checkoutProducts = cart.map(item => ({
                type: item.type,
                id: item.id,
                quantity: item.quantity
            }));

            /* console.log("Checkout payload:", {
                email,
                products: checkoutProducts
            }); */

            const res = await axios.post(`${backendUrl}/api/checkout`, {
                email,
                products: checkoutProducts
            });

            if (res.data.url) {
                window.open(res.data.url, "_blank");
            }

            setCheckoutStatus("success");
            // Clear cart on successful checkout
            setCart([]);
            setEmail("");
        } catch (error: any) {
            console.error("Checkout error:", error);
            setCheckoutStatus("cancel");

            // Show detailed error message
            if (error.response?.data?.detail) {
                try {
                    const errorDetail = JSON.parse(error.response.data.detail);
                    setError(`Checkout failed: ${errorDetail.details?.[0]?.message || errorDetail.message || "Unknown error"}`);
                } catch {
                    setError("Checkout failed. Please try again.");
                }
            } else {
                setError("Checkout failed. Please try again.");
            }
        }
    };

    const getProductIcon = (type: "course" | "testpack" | "question_bank") => {
        switch (type) {
            case "course":
                return "📘";
            case "testpack":
                return "📝";
            case "question_bank":
                return "❓";
            default:
                return "📚";
        }
    };

    const getProductTypeLabel = (type: "course" | "testpack" | "question_bank") => {
        switch (type) {
            case "course":
                return "Course";
            case "testpack":
                return "Test Pack";
            case "question_bank":
                return "Question Bank";
            default:
                return "Product";
        }
    };

    if (loadingProducts) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-[#1d99c6] mx-auto mb-4 animate-spin" />
                        <h3 className="text-xl font-medium text-gray-500">Loading LMS products...</h3>
                        <p className="text-gray-400 mt-2">Please wait while we fetch the latest products</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-red-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-red-500">Error loading products</h3>
                        <p className="text-red-400 mt-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-[#1d99c6] text-white rounded-lg hover:bg-[#176781] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            <div className="container mx-auto px-4 py-12">


                {/* SUCCESS OR FAILED MESSAGES */}
                {checkoutStatus === "success" && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-700">
                        Payment Successful! Check your email for confirmation.
                    </div>
                )}

                {checkoutStatus === "cancel" && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
                        Checkout Failed. Please check the product types and try again.
                    </div>
                )}

                {/* Cart Summary Banner */}
                {cart.length > 0 && (
                    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ShoppingCart className="w-5 h-5 text-[#1d99c6] mr-2" />
                                <span className="font-medium">
                                    {cartItemsCount()} {cartItemsCount() === 1 ? 'item' : 'items'} in cart • Total: ${calculateTotal().toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => setCheckoutOpen(true)}
                                className="px-4 py-2 bg-[#1d99c6] text-white rounded-lg hover:bg-[#176781] transition-colors"
                            >
                                Review Cart & Checkout
                            </button>
                        </div>
                    </div>
                )}

                {/* PRODUCT GRID */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-500">No products found</h3>
                        <p className="text-gray-400 mt-2">Try different search terms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => {
                            const inCart = isProductInCart(product.id);
                            // const quantity = getProductQuantity(product.id);
                            const isFree = product.price === 0;

                            return (
                                <div
                                    key={product.id}
                                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                                >
                                    {/* Decorative elements */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-blue-100/30 group-hover:bg-blue-200/40 transition-colors duration-500"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 -ml-12 -mb-12 rounded-full bg-purple-100/30 group-hover:bg-purple-200/40 transition-colors duration-500"></div>

                                    <div className="relative p-8 z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="p-3 bg-gradient-to-r from-[#1d99c6] to-[#176781] rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                                                <span className="text-2xl">{getProductIcon(product.type)}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                    {getProductTypeLabel(product.type)}
                                                </span>
                                                {isFree && (
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                                                        FREE
                                                    </div>
                                                )}
                                                {inCart ? (
                                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                                            {product.name}
                                        </h3>

                                        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                                            {product.description || "No description available"}
                                        </p>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex flex-col">
                                                {!isFree && (
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                )}
                                                {isFree && (
                                                    <span className="text-2xl font-bold text-green-600">FREE</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {inCart ? (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFromCart(product.id);
                                                            }}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addToCart(product);
                                                        }}
                                                        className="flex items-center text-white bg-gradient-to-r from-[#1d99c6] to-[#176781] px-4 py-2 rounded-lg hover:from-[#176781] hover:to-[#135166] transition-all"
                                                    >
                                                        <span className="text-sm">Add to Checkout</span>
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CHECKOUT SIDEBAR */}
                {checkoutOpen && (
                    <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setCheckoutOpen(false)}>
                        <div
                            className="
                                absolute right-0 top-0 h-full w-96 bg-white shadow-xl 
                                p-8 transition-all border-l border-gray-200 flex flex-col
                            "
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Your Cart</h2>
                                <X
                                    className="w-6 h-6 cursor-pointer"
                                    onClick={() => setCheckoutOpen(false)}
                                />
                            </div>

                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                    <ShoppingCart className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Your checkout is empty</p>
                                    <p className="text-sm mt-2">Add products to get started</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto mb-6">
                                        {cart.map((item) => (
                                            <div key={item.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                                                {getProductTypeLabel(item.type)}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                Type: {item.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ${item.price.toFixed(2)} each
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-700">Subtotal:</span>
                                            <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1d99c6] focus:border-transparent transition"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <button
                                                className="
                                                    w-full bg-gradient-to-r from-[#1d99c6] to-[#176781] text-white 
                                                    px-5 py-3 rounded-xl text-lg font-medium transition-all 
                                                    hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                                                    hover:from-[#176781] hover:to-[#135166]
                                                "
                                                disabled={!email || checkoutStatus === "processing" || cart.length === 0}
                                                onClick={handleCheckout}
                                            >
                                                {checkoutStatus === "processing" ? (
                                                    <span className="flex items-center justify-center">
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    `Checkout ($${calculateTotal().toFixed(2)})`
                                                )}
                                            </button>

                                            <div className="text-center text-sm text-gray-500">
                                                You will be redirected to a secure payment page
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Shopping Cart Button */}
                {cart.length > 0 && (
                    <button
                        onClick={() => setCheckoutOpen(true)}
                        className="
                            fixed bottom-10 right-10 bg-gradient-to-r from-[#1d99c6] to-[#176781] 
                            text-white p-4 rounded-full shadow-2xl hover:shadow-3xl 
                            transition-all z-50 hover:scale-110 group
                        "
                    >
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                                {cartItemsCount()}
                            </div>
                        </div>
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                            View Cart ({cartItemsCount()} items)
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}