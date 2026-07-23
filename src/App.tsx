import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SegmentProvider } from "./lib/segment-context";
import { SessionRecordingProvider } from "./components/SessionRecordingProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorTrackingProvider } from "./components/ErrorTrackingProvider";
import { ProductsProvider } from "./contexts/ProductsContext";
import Index from "./pages/Index";
// import BuyWorkbook from "./pages/BuyWorkbook";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
// import ComingSoon from "./pages/ComingSoon";
import CorsTest from "./CorsTest";
import StartPage from "./pages/StartPage";
import QuizPage from "./pages/QuizPage";
import ThankYouPage from "./pages/ThankYouPage";
import EmailCollectionPage from "./pages/EmailCollectionPage";
import ResultsPage from "./pages/ResultsPage";
import Questions from "./pages/Questions";
import { ChapterDetailsPage } from "./pages/ChapterDetailsPage";
import { TeacherPage } from "./pages/TeacherPage";
import QuestionBank from "./pages/QuestionBank";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TestPackDetail from "./pages/TestPackDetail";
import TestPacks from "./pages/TestPacks";
import TestPack from "./pages/TestPack";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useAuthStore } from "./stores/authStore";
import PostHogDebug from "./components/PostHogDebug";
import PostHogTest from "./components/PostHogTest";
import { SessionRecordingDemo } from "./components/SessionRecordingDemo";
import { ErrorTrackingExample } from "./components/ErrorTrackingExample";
import FeatureFlagTestPage from "./pages/FeatureFlagTestPage";
import WhiteLabelPage from "./pages/WhiteLabelPage";
import PartnershipPage from "./pages/PartnerShipPage";
import Partnership_callPage from "./pages/Partnership_callPage";
import Consultation_callPage from "./pages/Consultation_callPage";
import ProductsPage from "./pages/ProductsPage";
import ProductModal from "./components/product-modal/ProductModal";
import AdminProductsPage from "./pages/AdminProductsPage";
import ManageTestsPage from "./pages/ManageTestsPage";
// import ParentGuide from "components/ParentGude";
// import ParentguidePdf from "./components/ParentguidePdf";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
});

function App() {
	const [isAppReady, setIsAppReady] = useState(false);
	const checkAuth = useAuthStore((state) => state.checkAuth);

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				// Simple auth check without session validation
				await checkAuth();
			} catch (error) {
				console.warn('Auth initialization failed:', error);
			} finally {
				setIsAppReady(true);
			}
		};

		initializeAuth();
	}, []); // Empty dependency array - only run once on mount

	if (!isAppReady) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin h-12 w-12 border-b-2 border-gray-900 rounded-full" />
			</div>
		);
	}

	return (
		<ErrorBoundary> 
			<ErrorTrackingProvider>
				<QueryClientProvider client={queryClient}>
					<TooltipProvider>
						<SegmentProvider>
							<SessionRecordingProvider>
								<ProductsProvider>
									<Toaster />
									<Sonner />
									<BrowserRouter>
									<div className="min-h-screen  bg-gray-50">
										{/* <main className="container w-full mx-auto px-4 py-8"> */}
										<main className="w-full px-0 py-0">
											<Routes>
												<Route path="/" element={<Index />} />
												{/* <Route path="/send-pdf" element={<ParentguidePdf/>} /> */}

												{/* Auth Routes */}
												<Route path="/login" element={<Login />} />
												<Route path="/signup" element={<Signup />} />

												{/* Protected Teacher Routes */}
												<Route
													path="/teachers"
													element={
														<ProtectedRoute>
															<TeacherPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/question-bank"
													element={
														<ProtectedRoute>
															<QuestionBank />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/test-pack"
													element={
														<ProtectedRoute>
															<TestPack />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/test-packs"
													element={
														<ProtectedRoute>
															<TestPacks />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/test-packs/:id"
													element={
														<ProtectedRoute>
															<TestPackDetail />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/chapters/:chapterNumber"
													element={
														<ProtectedRoute>
															<ChapterDetailsPage />
														</ProtectedRoute>
													}
												/>
												<Route path="/apply" element={<WhiteLabelPage />} />
												<Route
													path="partnership"
													element={<PartnershipPage />}
												/>
												<Route
													path="/consultation-call"
													element={<Consultation_callPage />}
												/>
												<Route
													path="/partnership-call"
													element={<Partnership_callPage />}
												/>
												<Route path="/products" element={<ProductsPage />} />
												<Route path="/product/:id" element={<ProductModal/>} />
												
												{/* Admin Routes */}
												<Route
													path="/admin/products"
													element={
														<ProtectedRoute requireAdmin={true}>
															<AdminProductsPage />
														</ProtectedRoute>
													}
												/>
												<Route
													path="/manage-tests"
													element={
														<ProtectedRoute requireAdmin={true}>
															<ManageTestsPage />
														</ProtectedRoute>
													}
												/>

												{/* Public Routes */}
												<Route path="/shsat-info-center" element={<Index />} />
												<Route
													path="/students"
													element={<Index segmentType="student" />}
												/>
												<Route
													path="/parents"
													element={<Index segmentType="parent" />}
												/>
												<Route
													path="/educators"
													element={<Index segmentType="educator" />}
												/>
												<Route
													path="/tutors"
													element={<Index segmentType="tutor" />}
												/>
												{/* <Route path="/buy-workbook" element={<BuyWorkbook />} /> */}
												<Route
													path="/checkout-success"
													element={<CheckoutSuccess />}
												/>
												<Route
													path="/checkout-cancel"
													element={<CheckoutCancel />}
												/>
												<Route path="/cors-test" element={<CorsTest />} />
												<Route
													path="/posthog-debug"
													element={<PostHogDebug />}
												/>
												<Route path="/posthog-test" element={<PostHogTest />} />
												<Route
													path="/feature-flag-test"
													element={<FeatureFlagTestPage />}
												/>
												<Route
													path="/session-recording-demo"
													element={<SessionRecordingDemo />}
												/>
												<Route
													path="/error-tracking-demo"
													element={<ErrorTrackingExample />}
												/>

												{/* Quiz Routes */}
												<Route path="/start" element={<StartPage />} />
												<Route path="/quiz" element={<QuizPage />} />
												<Route path="/thankyou" element={<ThankYouPage />} />

												{/* Email Collection Routes */}
												<Route
													path="/email"
													element={<EmailCollectionPage />}
												/>
												<Route path="/results" element={<ResultsPage />} />

												{/* Questions Route */}
												<Route path="/questions" element={<Questions />} />
											</Routes>
										</main>
									</div>
									</BrowserRouter>
								</ProductsProvider>
							</SessionRecordingProvider>
						</SegmentProvider>
					</TooltipProvider>
				</QueryClientProvider>
			</ErrorTrackingProvider>
		</ErrorBoundary>
	);
}

export default App;
