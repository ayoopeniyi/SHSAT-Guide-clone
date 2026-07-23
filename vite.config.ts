import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 8080,
		hmr: {
			overlay: false, // Disables the HMR warning overlay
		},
	},
	plugins: [react(), mode === "development" && componentTagger()].filter(
		Boolean
	),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	// Suppress Vite import analysis warnings
	logLevel: "error", // Only show errors, suppress warnings

	build: {
		rollupOptions: {
			onwarn(warning, warn) {
				// Suppress specific warnings about dynamic imports
				if (warning.code === "DYNAMIC_IMPORT_ASSERTIONS") return;
				if (warning.message.includes("dynamic import cannot be analyzed"))
					return;
				warn(warning);
			},
		},
	},
}));
