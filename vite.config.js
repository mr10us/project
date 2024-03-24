import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react()], //splitVendorChunkPlugin(), visualizer()
  esbuild: {
    loader: "jsx",
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (
  //           id.includes("react-pdf") ||
  //           id.includes("pdfjs-dist/build/pdf.js")
  //         ) {
  //           return "react-pdf";
  //         }
  //         if (id.includes("antd")) {
  //           return "ant-design";
  //         }
  //       },
  //     },
  //   },
  // },
});
