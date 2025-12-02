"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Profil() {
  const router = useRouter();
  return (
    <div className="flex  flex-col h-screen items-center justify-center">
      Profil indisponible
      <Button onClick={() => router.back()}>Retour</Button>
    </div>
  );
}
