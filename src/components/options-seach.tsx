"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ✅ Ajoute ici les liens correspondant à chaque élément
const countries = [
  {
    continent: "Ventes & Produits",
    items: [
      { value: "liste produit vendu", href: "/liste-produit-vendu" },
      { value: "Ventre produit", href: "/ventes-produit" },
      { value: "liste categories", href: "/liste-categories" },
      { value: "ajouter categorie", href: "/ajouter-categorie" },
      { value: "liste produits", href: "/liste-produits" },
      { value: "ajouter produit", href: "/ajouter-produit" },
    ],
  },
  {
    continent: "Clients",
    items: [
      { value: "liste-client", href: "/liste-client" },
      { value: "ajouter client", href: "/ajouter-client" },
    ],
  },
  {
    continent: "Stock",
    items: [
      { value: "liste stocks", href: "/liste-stocks" },
      { value: "ajouter stock", href: "/ajouter-stock" },
      { value: "liste commande", href: "/liste-commande" },
      { value: "ajouter commande", href: "ajouter-commande" },
    ],
  },
  {
    continent: "Fournisseurs & Livraison",
    items: [
      { value: "liste fournisseur", href: "/liste-fournisseur" },
      { value: "ajouter fournisseur", href: "/ajouter-fournisseur" },
      { value: "liste livraison", href: "/liste-livraison" },
      { value: "ajouter livraison", href: "/ajouter-livraison" },
      { value: "rapport analyse", href: "/rapport-analyse" },
    ],
  },
];

export default function OptionsSeach() {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  return (
    <div className="*:not-first:mt-2 w-lg">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-input bg-background px-3 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-[3px]"
          >
            {value ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-lg leading-none"></span>
                <span className="truncate">{value}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select page</span>
            )}
            <ChevronDownIcon
              size={16}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search Page..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>

              {countries.map((group) => (
                <Fragment key={group.continent}>
                  <CommandGroup heading={group.continent}>
                    {group.items.map((item) => (
                      <Link
                        key={item.value}
                        href={item.href}
                        onClick={() => setOpen(false)} // ferme le menu après clic
                      >
                        <CommandItem
                          value={item.value}
                          onSelect={() => setValue(item.value)}
                        >
                          <span className="text-lg leading-none">
                            {/* {item.flag} */}
                          </span>{" "}
                          {item.value}
                          {value === item.value && (
                            <CheckIcon size={16} className="ml-auto" />
                          )}
                        </CommandItem>
                      </Link>
                    ))}
                  </CommandGroup>
                </Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
