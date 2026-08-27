import { Suspense } from "react";
import VerificarEmailForm from "./VerificarEmailForm";

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><p className="text-muted">Carregando...</p></div>}>
      <VerificarEmailForm />
    </Suspense>
  );
}
