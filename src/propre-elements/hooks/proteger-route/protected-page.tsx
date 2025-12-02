import useStateUser from "@/propre-elements/contexts/LoginHook";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedTotalPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { User, chargement } = useStateUser();
  const route = useRouter();

  useEffect(() => {
    if (!User && !chargement) {
      route.push("/");
    }
  }, [User, chargement]);

  if (chargement) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Vérification de la session...
      </div>
    );
  }

  if (!User) {
    return null;
  }

  return <section>{children}</section>;
}
