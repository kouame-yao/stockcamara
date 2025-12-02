"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  BookCopy,
  LayoutDashboard,
  ShoppingCart,
  Signal,
  Truck,
  UserCheck2,
} from "lucide-react";
import * as React from "react";

// This is sample data.
export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Dashboard",
      logo: LayoutDashboard,
      href: "/dashboard",
    },
  ],
  navMain: [
    {
      title: "Ventes & Produits",
      url: "#",
      icon: ShoppingCart,
      isActive: true,
      items: [
        {
          title: "Liste Produits Vendus",
          url: "/liste-produit-vendu",
        },
        {
          title: "Vendre Produit",
          url: "/vendre-produits",
        },
        {
          title: "Liste Catégories",
          url: "/liste-categories",
        },
        {
          title: "Ajouter Catégories",
          url: "/ajouter-categorie",
        },
        {
          title: "Liste Produits",
          url: "/liste-produits",
        },
        {
          title: "Ajouter Produits",
          url: "/ajouter-produit",
        },
        {
          title: "Rapport Ventes",
          url: "/analyse-ventes",
        },
      ],
    },

    {
      title: "Clients",
      url: "#",
      icon: UserCheck2,
      items: [
        {
          title: "Liste Clients",
          url: "/liste-client",
        },
        {
          title: "Ajouter Client",
          url: "/ajouter-client",
        },
      ],
    },
    {
      title: "Stock",
      url: "#",
      icon: Signal,
      items: [
        {
          title: "Liste Stocks",
          url: "liste-stocks",
        },
        {
          title: "Ajouter Stock",
          url: "/ajouter-stock",
        },
        {
          title: "Liste Commande",
          url: "/liste-commande",
        },
        {
          title: "Ajouter Commande",
          url: "/ajouter-commande",
        },
      ],
    },
    {
      title: "Fournisseur & Livraisons",
      url: "#",
      icon: Truck,
      items: [
        {
          title: "Liste Fournisseur",
          url: "liste-fournisseur",
        },
        {
          title: "Ajouter Fournisseur",
          url: "ajouter-fournisseur",
        },
        {
          title: "Liste Livraison",
          url: "liste-livraison",
        },
        {
          title: "Ajouter Livraison",
          url: "ajouter-livraison",
        },
        {
          title: "Rapport & Analyse",
          url: "rapport-analyse",
        },
      ],
    },
    {
      title: "Devis Matériels",
      url: "#",
      icon: BookCopy,
      items: [
        {
          title: "Liste Dévis",
          url: "liste-devis",
        },
        {
          title: "Ajouter Dévis",
          url: "ajouter-devis",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
