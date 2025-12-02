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
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PropsDataVentes, PropsElementVente } from "../hooks/add-vente";
import { useGetlisteclient } from "../hooks/get-liste-client";
import { useListeProduit } from "../hooks/liste-produit";
import { RadioGroupDemo } from "./radio-groupe";
import { SelectDemo } from "./select";

const option = [
  { id: "1", name: "Payé", value: "payé", label: "Payé" },
  { id: "2", name: "Impayé", value: "impayé", label: "Impayé" },
];

export interface PropsDataVentesSansTable {
  clientID: string;
  produitID: string;
  produitName: string;
  client: object;
  quantite: string | number;
  prix: string | number;
  prixUnitaire: string | number;
  total: string | number;
  status: string;
  createdAt: Date;
}

const Uniter_T = [
  { name: "Bourrette", unite_t: 0.1, chargeur: NaN, transport: NaN },
  { name: "Mototaxi", unite_t: 1.0, chargeur: NaN, transport: 3000 },
  { name: "Baine 6 roues", unite_t: 10.0, chargeur: 8000, transport: 20000 },
  { name: "Baine 10 roues", unite_t: 20.0, chargeur: 18000, transport: 30000 },
];

interface PropsUnite {
  unitekey: number | string;
  name: string;
  chargeur: number | string;
  transport: number | string;
}

interface PropsDataProduitEdite {
  mod: "eddit" | "add";
  initialData?: PropsDataVentes;
  onsubmit: (data: PropsDataVentes) => Promise<void>;
}

function CardVendProduit({
  mod,
  initialData,
  onsubmit,
}: PropsDataProduitEdite) {
  interface PropsDetail {
    newChargeur: number | string;
    newTransport: number | string;
  }
  const [CharDetail, setCharDetail] = useState<PropsDetail>({
    newChargeur: 0 || "",
    newTransport: 0 || "",
  });

  const [radio, setRadio] = useState("payé");
  const [table, setTable] = useState<PropsElementVente[]>([]);
  const [unite, setUnite] = useState<PropsUnite>({
    unitekey: "",
    name: "",
    chargeur: "",
    transport: "",
  });
  const [resetKey, setResetKey] = useState(0);

  // ✅ NOUVEAU : État pour gérer la modification d'une ligne
  const [indexEnCoursDeModification, setIndexEnCoursDeModification] = useState<
    number | null
  >(null);
  const [modeEditionLigne, setModeEditionLigne] = useState(false);

  const [data, setdata] = useState<PropsDataVentesSansTable>({
    clientID: "",
    produitID: "",
    produitName: "",
    client: {},
    quantite: "",
    prix: "",
    prixUnitaire: "",
    total: "",
    status: radio,
    createdAt: new Date(),
  });

  // ✅ Déclaration des hooks AVANT le useEffect
  const Produit = useListeProduit();
  const client = useGetlisteclient();

  // ✅ Charger les données initiales en mode édition
  useEffect(() => {
    if (mod === "eddit" && initialData && client && client.length > 0) {
      setTable(initialData.ventes || []);

      const clientID = String(initialData.clientID || "");
      const clientExiste = client.find((c) => c.id === clientID);

      setdata((prev) => ({
        ...prev,
        clientID: clientID,
        client: clientExiste || initialData.client || {},
      }));

      setRadio(String(initialData.status || "payé"));
    }
  }, [mod, initialData, client]);

  useEffect(() => {
    if (!unite.unitekey || !data.quantite) return;

    const Totalchargeur = Number(unite.chargeur) * Number(data.quantite);
    const TotalTransport = Number(unite.transport) * Number(data.quantite);

    setCharDetail({
      newChargeur: Totalchargeur || "",
      newTransport: TotalTransport || "",
    });

    // ⚠️ Ne pas setter unite ici ! ou calculer un nouvel objet au besoin
    // setUnite((prev) => ({
    //   ...prev,
    //   chargeur: Totalchargeur,
    //   transport: TotalTransport,
    // }));
  }, [unite.chargeur, unite.transport, data.quantite]);
  // ✅ Arrondir à 2 décimales pour éviter les problèmes de précision
  const newQuantite = Number(
    (Number(data.quantite) * Number(unite.unitekey)).toFixed(2)
  );

  useEffect(() => {
    if (
      data.produitID &&
      Number(newQuantite) >
        Number(Produit?.find((p) => p.id === data.produitID)?.quantite ?? 0)
    ) {
      toast.error("Quantité trop élevée, veuillez alimenter le stock");
    }
  }, [newQuantite, data.produitID, Produit]);

  if (!Produit || !client) {
    return <div className="h-screen w-full bg-white">Chargement...</div>;
  }

  // ✅ NOUVEAU : Fonction pour charger une ligne dans le formulaire
  const chargerLignePourModification = (index: number) => {
    const ligne = table[index];

    // Trouver l'unité correspondante
    const uniteCorrespondante = Uniter_T.find(
      (u) => u.name === ligne.uniteName
    );

    // Calculer la quantité originale (avant conversion) et arrondir
    const quantiteOriginale = uniteCorrespondante
      ? Number(
          (
            Number(ligne.quantite) / Number(uniteCorrespondante.unite_t)
          ).toFixed(2)
        )
      : Number(ligne.quantite);

    setdata((prev) => ({
      ...prev,
      produitID: ligne.produitID,
      produitName: ligne.produitName,
      quantite: quantiteOriginale,
      prix: Number(ligne.prix),
      prixUnitaire: Number(ligne.prix),
      total: Number(ligne.total),
    }));

    if (uniteCorrespondante) {
      setUnite({
        name: uniteCorrespondante.name,
        unitekey: uniteCorrespondante.unite_t,
        transport: Number(uniteCorrespondante.transport),
        chargeur: Number(uniteCorrespondante.chargeur),
      });
    }

    setIndexEnCoursDeModification(index);
    setModeEditionLigne(true);
    setResetKey((prev) => prev + 1);

    toast.info("Modifiez les valeurs et cliquez sur 'Mettre à jour'");
  };

  // ✅ NOUVEAU : Fonction pour mettre à jour une ligne existante
  const mettreAJourLigne = () => {
    if (!data.produitID || !data.quantite || !data.prix) {
      toast.info("Veuillez remplir tous les champs");
      return;
    }

    if (!unite.name) {
      toast.info("Veuillez sélectionner une unité");
      return;
    }

    if (indexEnCoursDeModification === null) return;

    // ✅ Calculer le total avec arrondi à 2 décimales
    const totalCalcule = Number(
      (Number(data.quantite) * Number(data.prix)).toFixed(2)
    );

    const ligneModifiee: PropsElementVente = {
      voyage: data.quantite,
      chargeur: unite.chargeur,
      transport: unite.transport,
      uniteName: unite.name,
      quantite: newQuantite,
      produitID: data.produitID,
      produitName: data.produitName,
      total: totalCalcule,
      prix: Number(data.prix),
    };

    setTable((prev) =>
      prev.map((item, i) =>
        i === indexEnCoursDeModification ? ligneModifiee : item
      )
    );

    annulerModificationLigne();
    toast.success("Ligne modifiée avec succès");
  };

  // ✅ NOUVEAU : Annuler la modification d'une ligne
  const annulerModificationLigne = () => {
    setIndexEnCoursDeModification(null);
    setModeEditionLigne(false);

    setdata((prev) => ({
      ...prev,
      produitID: "",
      produitName: "",
      quantite: "",
      prix: "",
      prixUnitaire: "",
      total: "",
    }));

    setUnite({ unitekey: "", name: "", chargeur: "", transport: "" });
    setResetKey((prev) => prev + 1);
  };
  function Verification() {
    if (!data.client || data.clientID === "") {
      toast.info("veillez saisir le client");
      return false;
    }
    if (!data.produitName) {
      toast.info("veillez saisir le produit");
      return false;
    }

    if (!unite.unitekey) {
      toast.info("veillez saisir le chargement");
      return false;
    }
    if (!data.quantite) {
      toast.info("veillez saisir la quantite");
      return false;
    }
    if (isNaN(Number(data.quantite))) {
      toast.info("veillez saisir une quantite correct");
      return false;
    }
    if (Number(data.quantite) <= 0) {
      toast.info("veillez saisir une quantitée supperieur a 0");
      return false;
    }

    if (!data.prix) {
      toast.info("veillez saisir le prix");
      return false;
    }

    if (isNaN(Number(data.prix))) {
      toast.info("veillez saisir un prix correct");
      return false;
    }
    if (Number(data.prix) <= 0) {
      toast.info("veillez saisir un prix supperieur a 0");
      return false;
    }

    return true;
  }

  const PushObject = () => {
    // if (data.clientID === "") {
    //   toast.error("Ajour un client !");
    //   return;
    // }
    // if (Number(data.quantite) <= 0) {
    //   toast.error("La quantité doit être suppérieux a 0 !");
    //   return;
    // }

    // if (!data.produitID || !data.quantite || !data.prix) {
    //   toast.info("Veuillez remplir tous les champs");
    //   return;
    // }

    // if (!unite.name) {
    //   toast.info("Veuillez sélectionner une unité");
    //   return;
    // }

    if (!Verification()) {
      return;
    }

    // ✅ Calculer le total avec arrondi à 2 décimales
    const totalCalcule = Number(
      (Number(data.quantite) * Number(data.prix)).toFixed(2)
    );

    const Newvente: PropsElementVente = {
      voyage: data.quantite,
      chargeur: CharDetail.newChargeur,
      transport: CharDetail.newTransport,
      uniteName: unite.name,
      quantite: newQuantite,
      produitID: data.produitID,
      produitName: data.produitName,
      total: totalCalcule,
      prix: Number(data.prix),
    };

    setTable((prev) => [...prev, Newvente]);

    setdata((prev) => ({
      ...prev,
      produitID: "",
      produitName: "",
      quantite: "",
      prix: "",
      prixUnitaire: "",
      total: "",
    }));

    setResetKey((prev) => prev + 1);
  };

  const supprimerLigne = (index: number) => {
    setTable((prev) => prev.filter((_, i) => i !== index));

    // Si on supprime la ligne en cours de modification, annuler le mode édition
    if (index === indexEnCoursDeModification) {
      annulerModificationLigne();
    }
  };

  const initialValue = 0;
  const sumWithInitial = Number(
    table
      .reduce((acc, curr) => acc + Number(curr.total), initialValue)
      .toFixed(2)
  );

  const enregistrerVente = async () => {
    if (!data.clientID || table.length === 0) {
      toast.info(
        "Veuillez sélectionner un client et ajouter au moins un produit"
      );
      return;
    }

    if (modeEditionLigne) {
      toast.warning("Veuillez terminer la modification de la ligne en cours");
      return;
    }

    const dataAvecVentes: PropsDataVentes = {
      clientID: data.clientID,
      client: data.client,
      ventes: table,
      status: radio,
      totalGlobale: sumWithInitial,
      createdAt: initialData?.createdAt || new Date(),
    };

    try {
      await onsubmit(dataAvecVentes);
      toast.success(
        mod === "eddit"
          ? "Vente modifiée avec succès"
          : "Vente enregistrée avec succès"
      );
      if (mod === "add") {
        reinitialiser();
      }
    } catch (error) {
      toast.error(`Erreur lors de l'enregistrement ${error}`);
    }
  };

  const reinitialiser = () => {
    setTable([]);
    setdata({
      clientID: "",
      produitID: "",
      produitName: "",
      client: {},
      quantite: "",
      prix: "",
      prixUnitaire: "",
      total: "",
      status: radio,
      createdAt: new Date(),
    });
    setUnite({ unitekey: "", name: "", chargeur: "", transport: "" });
    setRadio("payé");
    setIndexEnCoursDeModification(null);
    setModeEditionLigne(false);
    setResetKey((prev) => prev + 1);
  };
  const FormaNumber = (number: number) => {
    return new Intl.NumberFormat("de-DE").format(number);
  };
  return (
    <Card className="p-4 grid gap-4">
      <h2 className="text-blue-500 font-bold text-lg">
        {mod === "eddit" ? "Modifier la vente" : "Vendre plusieurs produits"}
      </h2>

      {/* Sélection client */}
      <div className="space-y-4 w-full">
        {mod === "add" ? (
          table.length === 0 ? (
            // ✅ Mode ADD + Tableau vide = Select actif
            <SelectDemo
              key={`client-${resetKey}`}
              data={client}
              labelKey={(item) => `${item.prenom} ${item.nom}`}
              onChange={(name, value, items) =>
                setdata((prev) => ({
                  ...prev,
                  clientID: items?.id || "",
                  client: items || {},
                }))
              }
              label="client"
              placeholder="Choisir un client"
            />
          ) : (
            // ✅ Mode ADD + Tableau rempli = Client verrouillé
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-blue-50 border-blue-200">
                <span className="font-medium text-blue-900">
                  {client.find((c) => c.id === data.clientID)?.prenom}{" "}
                  {client.find((c) => c.id === data.clientID)?.nom}
                </span>
                <span className="text-xs text-blue-600">
                  (Client verrouillé - Supprimez tous les produits pour changer
                  de client)
                </span>
              </div>
            </div>
          )
        ) : (
          // ✅ Mode EDIT = Toujours verrouillé
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <div className="flex items-center gap-2 p-3 border rounded-md bg-blue-50 border-blue-200">
              <span className="font-medium text-blue-900">
                {client.find((c) => c.id === data.clientID)?.prenom}{" "}
                {client.find((c) => c.id === data.clientID)?.nom}
              </span>
              <span className="text-xs text-blue-600">
                (Client verrouillé en mode édition)
              </span>
            </div>
          </div>
        )}

        {/* ✅ Message d'info si on est en train de modifier une ligne */}
        {modeEditionLigne && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800 font-medium">
              ⚠️ Mode modification de ligne {indexEnCoursDeModification! + 1} -
              Modifiez les valeurs ci-dessous puis cliquez sur "Mettre à jour"
            </p>
          </div>
        )}

        {/* Formulaire produit */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <SelectDemo
            className="w-full"
            key={`produit-${resetKey}`}
            data={Produit}
            labelKey={(item) => `${item.nom} - Stock: ${item.quantite} Tonnes`}
            onChange={(name, value, itemps) =>
              setdata((prev) => ({
                ...prev,
                produitID: itemps?.id || "",
                produitName: itemps?.nom || "",
                prixUnitaire: itemps?.prix || "",
                prix: itemps?.prix || "",
              }))
            }
            label="Produit"
            placeholder="choisir un produit"
          />

          <SelectDemo
            className="w-full"
            key={`unite-${resetKey}`}
            data={Uniter_T}
            labelKey={(item) => `${item.name} ${item.unite_t}`}
            onChange={(name, value, itemps) => {
              setUnite({
                name: String(itemps?.name) || "",
                unitekey: Number(itemps?.unite_t),
                transport: Number(itemps?.transport),
                chargeur: Number(itemps?.chargeur),
              });
            }}
            label="Transport"
            placeholder="choisir transport"
          />

          <InputDemo
            placeholder="choisir nombre de chargement"
            value={data.quantite}
            onChange={(e) =>
              setdata((prev) => ({ ...prev, quantite: e.target.value }))
            }
            className="placeholder:text-[10px] "
          />

          <InputDemo
            placeholder="prix unitaire (FCFA)"
            value={data.prix}
            onChange={(e) =>
              setdata((prev) => ({ ...prev, prix: e.target.value }))
            }
          />

          {/* ✅ Bouton conditionnel : Ajouter OU Mettre à jour */}
          {modeEditionLigne ? (
            <div className="flex gap-2">
              <Button
                onClick={mettreAJourLigne}
                className="bg-orange-500 hover:bg-orange-400 flex-1"
              >
                <CheckCircle className="mr-2" /> Mettre à jour
              </Button>
              <Button
                onClick={annulerModificationLigne}
                className="bg-gray-500 hover:bg-gray-400"
                size="icon"
              >
                <ArrowLeftCircle />
              </Button>
            </div>
          ) : (
            <Button
              onClick={PushObject}
              className="bg-blue-500 hover:bg-blue-400"
            >
              <PlusCircle className="mr-2" /> Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      {table.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>unite(Tonnes)</TableHead>
              <TableHead>Prix unitaire</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.map((v, i) => (
              <TableRow
                key={i}
                className={
                  indexEnCoursDeModification === i ? "bg-orange-50" : ""
                }
              >
                <TableCell className="font-medium">{i + 1}</TableCell>
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
                      onClick={() => chargerLignePourModification(i)}
                      className="bg-orange-500 hover:bg-orange-400 text-xs"
                      size="sm"
                      disabled={
                        modeEditionLigne && indexEnCoursDeModification !== i
                      }
                    >
                      <Edit className="mr-1 h-3 w-3" /> Modifier
                    </Button>

                    {/* Bouton Supprimer */}
                    <Button
                      onClick={() => supprimerLigne(i)}
                      className="bg-red-500 hover:bg-red-400 text-xs"
                      size="sm"
                      disabled={mod === "eddit" && table.length === 1}
                      title={
                        mod === "eddit" && table.length === 1
                          ? "Impossible de supprimer la dernière ligne en mode édition"
                          : "Supprimer cette ligne"
                      }
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

      {/* Statut & total */}
      <div className="flex items-center justify-between">
        <RadioGroupDemo
          options={option}
          onValueChange={setRadio}
          defaultValue={radio}
          name={radio}
          label="Status"
        />
        <div className="border rounded-md p-4 bg-green-50">
          <p className="text-sm text-gray-600">Total à payer</p>
          <p className="text-2xl font-bold text-green-600">
            {sumWithInitial} FCFA
          </p>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={enregistrerVente}
          className="bg-green-500 hover:bg-green-400"
          disabled={table.length === 0 || !data.clientID || modeEditionLigne}
        >
          <CheckCircle className="mr-2" />
          {mod === "eddit" ? "Modifier la vente" : "Enregistrer la vente"}
        </Button>
        <Button
          onClick={reinitialiser}
          className="bg-gray-500 hover:bg-gray-400"
        >
          <ArrowLeftCircle className="mr-2" /> Réinitialiser
        </Button>
      </div>
    </Card>
  );
}

export default CardVendProduit;
