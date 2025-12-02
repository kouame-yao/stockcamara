"use client";

import useGetMdp from "@/propre-elements/hooks/get-mdp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const [code, setCode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // ✅ nouvel état
  const mdp = useGetMdp();
  const router = useRouter();

  // 🔹 Attendre que mdp soit chargé
  useEffect(() => {
    if (mdp !== undefined) {
      if (String(mdp) === "") {
        setAuthorized(true); // pas de mot de passe, accès autorisé
      }
      setLoading(false); // on a fini de charger
    }
  }, [mdp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mdp) return;

    if (code === String(mdp)) {
      setAuthorized(true);
    } else {
      setError("Code incorrect !");
      setCode("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    ); // 🔹 afficher un loader jusqu'à ce que mdp soit chargé
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Accès Protégé</h1>
          <p className="mb-6 text-gray-600 text-center">
            Entrez le code pour accéder à cette page
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code"
              className="border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Valider
            </button>
          </form>
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full text-center text-gray-700 hover:text-gray-900 underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
