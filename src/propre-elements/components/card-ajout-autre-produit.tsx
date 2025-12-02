"use client";
import { InputDemo } from "@/components/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeftCircle,
  CheckCircle,
  Edit,
  PlusCircle,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { PropsDataClient } from "../hooks/add-client";
import { useGetlisteclient } from "../hooks/get-liste-client";
import { RadioGroupDemo } from "./radio-groupe";
import { SelectDemo } from "./select";
interface PropsDataVenteSable {
  type: string;
  client: PropsDataClient | object;
  clientID: string;
  createdAt: Date | null;
  totalGlobale: number | string;
  status: string;
  updatedAt?: Date | null;
  ventes: PropsObjetvente[];
}
const produit = [{ id: 1, name: "Sable" }];
export interface PropsObjetvente {
  produitName: string;
  prix: number | string;
  produitID: string;
  quantite: number | string;
  total: number | string;
  uniteName: string;
  chargeur: string | number;
  carriere: string | number;
}

interface PropsDataProduitEdite {
  mod: "eddit" | "add";
  initialData?: PropsDataVenteSable;
  onsubmit: (data: PropsDataVenteSable) => Promise<void>;
}

export default function CardAjoutAutreProduit({
  mod,
  initialData,
  onsubmit,
}: PropsDataProduitEdite) {
  const [radio, setRadio] = useState("payé");
  const [ResetKey, setResetKey] = useState(0);
  const [TotalGlobale, setTotaleGlobale] = useState(0);
  const [indexEnCoursDeModification, setIndexEnCoursDeModification] = useState<
    number | null
  >(null);
  const [modeEditionLigne, setModeEditionLigne] = useState(false);
  const [table, setTable] = useState<PropsObjetvente[]>([]);
  const [value, setvalue] = useState<PropsObjetvente>({
    produitName: "",
    prix: "",
    produitID: "",
    quantite: "",
    total: "",
    uniteName: "",
    chargeur: "",
    carriere: "",
  });
  const [data, setData] = useState<PropsDataVenteSable>({
    type: "Autre",
    client: {},
    clientID: "",
    createdAt: new Date(),
    totalGlobale: "",
    status: "",
    ventes: [],
  });
  const client = useGetlisteclient();
  const status = [
    { id: "1", value: "payé", label: "Payé" },
    { id: "2", value: "impayé", label: "Impayé" },
  ];
  const TP = [
    { name: "baine 6 roues", prix: 40000, chargeur: 5000, carriere: 4000 },
    { name: "baine 10 roues", prix: 80000, chargeur: 10000, carriere: 8000 },
  ];
  useEffect(() => {
    if (mod === "eddit" && client && client.length > 0) {
      setTable(initialData?.ventes || []);

      const clientInitial = client.find(
        (doc) => doc.id === initialData?.clientID
      );
      setData((prev) => ({
        ...prev,
        client: clientInitial || initialData?.client || {},
        clientID: String(clientInitial?.id),
      }));

      setRadio(String(initialData?.status) || "");
    }
  }, [initialData, client, mod]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setvalue((prev) => ({ ...prev, [name]: value }));
  };

  const ResutTotal = useMemo(() => {
    return Number(value.quantite) * Number(value.prix);
  }, [value.quantite, value.prix]);

  function Verification() {
    if (!data.client || data.clientID === "") {
      toast.info("veillez saisir le client");
      return false;
    }
    if (!value.produitName) {
      toast.info("veillez saisir le produit");
      return false;
    }

    if (!value.uniteName) {
      toast.info("veillez saisir le chargement");
      return false;
    }
    if (!value.quantite) {
      toast.info("veillez saisir la quantite");
      return false;
    }
    if (isNaN(Number(value.quantite))) {
      toast.info("veillez saisir une quantite correct");
      return false;
    }

    if (!value.prix) {
      toast.info("veillez saisir le prix");
      return false;
    }

    if (isNaN(Number(value.prix))) {
      toast.info("veillez saisir un prix correct");
      return false;
    }

    return true;
  }

  useEffect(() => {
    const TG = table?.reduce((acc, items) => {
      return acc + Number(items?.total);
    }, 0);
    setTotaleGlobale(TG);

    setvalue((prev) => ({ ...prev, total: ResutTotal }));
  }, [ResutTotal, table]);

  // AJOUTER LA VENTE

  const EnregistrerLaVente = async () => {
    if (table.length === 0) {
      toast.info("Veillez ajoutez une vente");
      return;
    }
    const newData: PropsDataVenteSable = {
      ...data,
      totalGlobale: TotalGlobale,
      status: radio,
      ventes: table,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: mod === "eddit" ? new Date() : null,
    };

    await onsubmit(newData);
    if (mod === "add") {
      Renitialiser();
    }
  };

  const pushElement = () => {
    if (!Verification()) {
      return;
    }
    setTable([...table, value]);

    setvalue({
      produitName: "",
      prix: "",
      produitID: "",
      quantite: "",
      total: "",
      uniteName: "",
      chargeur: "",
      carriere: "",
    });

    setResetKey((prev) => prev + 1);
  };

  const deletedElement = (index: number) => {
    const newTable = table.filter((_, i) => i !== index);
    setTable(newTable);

    if (table.length === 1) {
      setData({
        type: "Autre",
        client: {},
        clientID: "",
        createdAt: new Date(),
        totalGlobale: "",
        status: "",
        ventes: [],
      });
    }
  };

  const ChargerLaligneAModifier = (index: number) => {
    // RECUPERATION DE L'OBJECT PAR SON INDEX
    const ligne = table[index];

    // COMPARER L OBJECT PASSER AFIN DE RECUPER LES DONNER EXACTE DANS LE TABLEAU TP
    const quantiteCorespondant = TP.find((doc) => doc.name === ligne.uniteName);

    // RENITIALISATION DES DONNEES DANS LE STATE SETVALUE
    setvalue((prev) => ({
      ...prev,
      produitName: ligne.produitName,
      prix: Number(quantiteCorespondant?.prix),
      produitID: ligne.produitID,
      quantite: ligne.quantite,
      total: ligne.total,
      uniteName: String(quantiteCorespondant?.name),
      chargeur: Number(quantiteCorespondant?.chargeur),
      carriere: Number(quantiteCorespondant?.carriere),
    }));

    // AJOUTER L INDEX DANS LE STATTE SETINDEX...
    setIndexEnCoursDeModification(index);
    // AJOUTER TRUE POUR SAVOIR QUE JE SUIS EN MODE EDDITED
    setModeEditionLigne(true);
  };

  const MettreAjourLaligne = () => {
    const LigneModifier: PropsObjetvente = {
      produitName: value.produitName,
      prix: Number(value?.prix),
      produitID: value.produitID,
      quantite: value.quantite,
      total: value.total,
      uniteName: String(value?.uniteName),
      chargeur: Number(value?.chargeur),
      carriere: Number(value?.carriere),
    };
    setTable((prev) =>
      prev.map((item, i) =>
        i === indexEnCoursDeModification ? LigneModifier : item
      )
    );
  };

  const AnnulerLaModification = () => {
    setvalue({
      produitName: "",
      prix: "",
      produitID: "",
      quantite: "",
      total: "",
      uniteName: "",
      chargeur: "",
      carriere: "",
    });

    setResetKey((prev) => prev + 1);
    setModeEditionLigne(false);
    setIndexEnCoursDeModification(null);
  };

  const Renitialiser = () => {
    setvalue({
      produitName: "",
      prix: "",
      produitID: "",
      quantite: "",
      total: "",
      uniteName: "",
      chargeur: "",
      carriere: "",
    });
    setData({
      type: "Autre",
      client: {},
      clientID: "",
      createdAt: new Date(),
      totalGlobale: "",
      status: "",
      ventes: [],
    });
    setResetKey((prev) => prev + 1);
    setModeEditionLigne(false);
    setIndexEnCoursDeModification(null);
    setTable([]);
  };

  const FormaNumber = (number: number) => {
    return new Intl.NumberFormat("de-DE").format(number);
  };
  return (
    <Card className="p-4">
      <div>
        <h1 className="text-blue-500 font-bold text-lg">
          Vendre plusieurs produits
        </h1>
      </div>

      <div>
        <span>Client</span>

        {table.length > 0 ? (
          <div className="bg-blue-100 text-[15px]  p-2 rounded-md border border-blue-300 text-blue-500">
            <span>{client?.find((i) => i.id === data?.clientID)?.prenom} </span>
            <span>{client?.find((i) => i.id === data?.clientID)?.nom} </span>
            <span className="text-[10px] ">
              {" "}
              (Client verrouillé - Supprimez tous les produits pour changer de
              client)
            </span>
          </div>
        ) : (
          <SelectDemo
            placeholder="choisir client"
            key={`client ${ResetKey}`}
            disabled={table.length > 0}
            data={client}
            labelKey={(items) => `${items.prenom} - ${items.nom}`}
            onChange={(name, value, item) =>
              setData((prev) => ({
                ...prev,
                client: item || {},
                clientID: item?.id || "",
              }))
            }
          />
        )}
      </div>
      <div>
        {modeEditionLigne && (
          <div className="bg-orange-100 text-[15px]  p-2 rounded-md border border-orange-300 text-orange-900">
            {`⚠️ Mode modification de ligne ${
              Number(indexEnCoursDeModification) + 1
            } - Modifiez les valeurs ci-dessous puis cliquez sur "Mettre à jour"`}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Produit */}
        <SelectDemo
          placeholder="choisir produit"
          key={`produit ${ResetKey}`}
          onChange={(name, value, item) =>
            setvalue((prev) => ({
              ...prev,
              produitName: String(item?.name),
              produitID: String(item?.id),
            }))
          }
          labelKey={(item) => item.name}
          // value={value.produitName}
          className="max-w-lg w-full"
          data={produit}
        />
        {/* moyen de transport */}
        <SelectDemo
          placeholder="choisir transport"
          key={`transport ${ResetKey}`}
          labelKey={(items) => items.name}
          onChange={(name, value, item) =>
            setvalue((prev) => ({
              ...prev,
              uniteName: String(item?.name),
              carriere: Number(item?.carriere),
              chargeur: Number(item?.chargeur),
            }))
          }
          className="max-w-lg w-full"
          data={TP}
        />
        {/* quantité */}
        <InputDemo
          placeholder="choisir nombre de chargement"
          onChange={handleChange}
          name="quantite"
          value={value.quantite}
          className="max-w-lg w-full placeholder:text-[10px] "
        />
        {/* prix */}
        <InputDemo
          placeholder="prix unitaire (FCFA) "
          onChange={handleChange}
          name="prix"
          value={value.prix}
          className="max-w-lg w-full"
        />

        {modeEditionLigne ? (
          <div className="flex items-center w-full gap-2">
            <Button onClick={MettreAjourLaligne} className="w-30 bg-amber-500 ">
              {" "}
              <Edit /> Mettre Ajour
            </Button>
            <Button
              onClick={AnnulerLaModification}
              className="w-20 bg-gray-600"
            >
              {" "}
              <ArrowLeftCircle />
            </Button>
          </div>
        ) : (
          <Button onClick={pushElement} className="w-50">
            {" "}
            <PlusCircle /> Ajouter
          </Button>
        )}
      </div>
      <div>
        {/* Tableau */}
        {table.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.map((v, i) => (
                <TableRow
                  className={`${
                    mod === "eddit" && i === indexEnCoursDeModification
                      ? "bg-orange-100"
                      : ""
                  }`}
                  key={i}
                >
                  <TableCell className="font-medium ">{i + 1}</TableCell>
                  <TableCell>{v.produitName}</TableCell>
                  <TableCell>{v.uniteName}</TableCell>
                  <TableCell>{v.quantite}</TableCell>
                  <TableCell>{FormaNumber(Number(v.prix))} FCFA</TableCell>
                  <TableCell className="font-semibold">
                    {FormaNumber(Number(v.total))} FCFA
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* ✅ Bouton Modifier */}
                      <Button
                        className="bg-orange-500 hover:bg-orange-400 text-xs"
                        size="sm"
                        onClick={() => ChargerLaligneAModifier(i)}
                      >
                        <Edit className="mr-1 h-3 w-3" /> Modifier
                      </Button>

                      {/* Bouton Supprimer */}
                      <Button
                        onClick={() => deletedElement(i)}
                        className="bg-red-500 hover:bg-red-400 text-xs"
                        size="sm"
                        disabled={mod === "eddit" && table.length === 1}
                      >
                        <Trash className="mr-1 h-3 w-3" /> Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex justify-between">
        <RadioGroupDemo
          defaultValue={radio}
          options={status}
          onValueChange={setRadio}
          value={radio}
        />
        <div className="border rounded-md p-2 grid items-center justify-center bg-green-50 place-items-center">
          <span className="text-sm text-gray-700">Total à payer</span>
          <span className="text-2xl  font-bold text-green-500">
            {TotalGlobale} FCFA
          </span>
        </div>
      </div>

      <div className="flex gap-4 items-center place-items-center justify-center">
        <Button
          disabled={table.length === 0}
          onClick={EnregistrerLaVente}
          className="bg-green-500"
        >
          {" "}
          <CheckCircle /> Enregistrer la vente(s){" "}
        </Button>
        <Button onClick={Renitialiser} className="bg-gray-500">
          <ArrowLeftCircle /> Rénitialiser(s){" "}
        </Button>
      </div>
    </Card>
  );
}
