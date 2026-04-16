import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
  manifest: {
    name: "Easy WebsiteGPT",
    description: "Chat with any webpage using multiple AI providers",
    version: "1.0.0",
    permissions: ["activeTab", "storage", "scripting"],
    action: {
      default_title: "Easy WebsiteGPT",
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
