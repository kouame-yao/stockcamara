"use client";

import { Auth } from "@/firebase/config/ficher-config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useStateUser() {
  const [User, setUser] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);
  const route = useRouter();
  useEffect(() => {
    const subscribe = onAuthStateChanged(Auth, (current) => {
      setUser(current);
      setChargement(false);
    });

    return () => subscribe();
  }, []);

  async function Logout() {
    await signOut(Auth);
    setUser(null);
    setChargement(false);
    route.push("/");
  }

  return { User, setUser, chargement, Logout };
}
