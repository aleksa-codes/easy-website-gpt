import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import "@/assets/tailwind.css"
import { Toaster } from "@/components/ui/sonner"
import { Popup } from "@/features/popup/popup"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
    <Toaster />
  </StrictMode>
)
