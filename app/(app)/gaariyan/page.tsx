import type { Metadata } from "next"
import { GaariyanView } from "@/components/crud/entities"

export const metadata: Metadata = { title: "گاڑیاں" }

export default function GaariyanPage() {
  return <GaariyanView />
}
