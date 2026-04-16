import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import "@/assets/tailwind.css"
import { Toaster } from "@/components/ui/sonner"
import { Options } from "@/features/options/options"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Options />
    <Toaster />
  </StrictMode>
)
