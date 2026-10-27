import { Suspense } from "react";
import VerifyEmailForm from "@/components/VerifyEmailForm";

export const metadata = { title: "Verify email | Aurelle Perfumes" };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-6xl px-5 py-10 text-mut">Loading...</p>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
