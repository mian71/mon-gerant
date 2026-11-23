"use client"


import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'


type Produit = { nom: string, prix: number, stock: number, achat?: number }
type Vente = { items: string, total: number, date?: string, benefice?: number, detail?: { nom: string, qte: number, prix: number }[], paiement?: string, remise?: number }
type Dette = { client: string, items: string, total: number, date: string, benefice: number, panierDetail: Produit[], totalOrigine?: number, dejaPaye?: number }
type Depense = { nom: string, montant: number, date: string }
type Commande = { client: string, items: string, total: number, date: string, benefice: number, detail: { nom: string, qte: number, prix: number }[], panierDetail: Produit[], remise?: number }
type AchatFournisseur = { fournisseur: string, produit: string, qte: number, prixUnitaire: number, total: number, date: string, paye: boolean }

export default function Home() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [panier, setPanier] = useState<Produit[]>([])
  const [montantDonne, setMontantDonne] = useState("")
  const [ventes, setVentes] = useState<Vente[]>([])
  const [ventesToutTemps, setVentesToutTemps] = useState<Vente[]>([])
  const [dettes, setDettes] = useState<Dette[]>([])
  const [depenses, setDepenses] = useState<Depense[]>([])
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [achats, setAchats] = useState<AchatFournisseur[]>([])
  const [modePaiement, setModePaiement] = useState<'especes' | 'wave' | 'orange' | 'credit' | 'mixte'>('especes')
  const [mixteEspeces, setMixteEspeces] = useState("")
  const [mixteWave, setMixteWave] = useState("")
  const [mixteOrange, setMixteOrange] = useState("")
  const [nomClient, setNomClient] = useState("")
  const [nomCommande, setNomCommande] = useState("")
  const [remise, setRemise] = useState("")
  const [typeRemise, setTypeRemise] = useState<'montant' | 'pourcent'>('montant')
  const [nomFournisseur, setNomFournisseur] = useState("")
  const [produitAchat, setProduitAchat] = useState("")
  const [qteAchat, setQteAchat] = useState("")
  const [prixAchatFournisseur, setPrixAchatFournisseur] = useState("")
  const [fournisseurPaye, setFournisseurPaye] = useState(true)
  const [afficherAchats, setAfficherAchats] = useState(false)
  const [nouveauNom, setNouveauNom] = useState("")
  const [nouveauPrix, setNouveauPrix] = useState("")
  const [nouveauStock, setNouveauStock] = useState("")
  const [nouvelAchat, setNouvelAchat] = useState("")
  const [charge, setCharge] = useState(true)
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [quantites, setQuantites] = useState<Record<number, number>>({})
  const [recherche, setRecherche] = useState("")
  const [codeSauvegarde, setCodeSauvegarde] = useState("")
  const [afficherSauvegarde, setAfficherSauvegarde] = useState(false)
  const [afficherTop, setAfficherTop] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editPrix, setEditPrix] = useState("")
  const [editAchat, setEditAchat] = useState("")
  const [editNom, setEditNom] = useState("")
  const [nomDepense, setNomDepense] = useState("")
  const [montantDepense, setMontantDepense] = useState("")
  const [afficherDepenses, setAfficherDepenses] = useState(false)
  const [nomBoutique, setNomBoutique] = useState("")
  const [afficherNomBoutique, setAfficherNomBoutique] = useState(false)
  const [derniereVente, setDerniereVente] = useState<Vente | null>(null)
  const [objectif, setObjectif] = useState("")
  const [afficherObjectif, setAfficherObjectif] = useState(false)
  const [afficherClientes, setAfficherClientes] = useState(false)
  const [rechercheCliente, setRechercheCliente] = useState("")
  const [afficherGraphique, setAfficherGraphique] = useState(false)
  const [afficherInventaire, setAfficherInventaire] = useState(false)
  const [stockInventaire, setStockInventaire] = useState<Record<number, string>>({})
  const [ventesPatron, setVentesPatron] = useState<any[]>([])
  const [afficherVentesDirect, setAfficherVentesDirect] = useState(false)

  const chargerVentesPatron = async () => {
  try {
    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('ventes')
      .select('*')
      .gte('created_at', debutJour.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.log('Erreur chargerVentesPatron:', error);
      return;
    }
    setVentesPatron(data || []);
  } catch (e) {
    console.log('Erreur chargerVentesPatron:', e);
  }
};
 
  // --- BOUTIQUE TEMPS REEL / MULTI-BOUTIQUES ---
  const [boutiqueId, setBoutiqueId] = useState("")
  const [codeBoutique, setCodeBoutique] = useState("")
  const [role, setRole] = useState("Patron")
  const [ventesLive, setVentesLive] = useState<any[]>([])
 
  
  // Charger les produits du maquis depuis Supabase
useEffect(() => {
  if (!boutiqueId) return
  if (boutiqueId.startsWith('local-')) return // pas de synchro en mode local

  const chargerProduits = async () => {
    const { data } = await supabase.from('produits').select('*').eq('boutique_id', boutiqueId)
    if (data) {
      setProduits(data.map((p: any) => ({
        ...p,
        prix: p.prix_vente,
        achat: p.prix_achat
      })))
    }
  }
  chargerProduits()
}, [boutiqueId])
  
  useEffect(() => {
    const v = localStorage.getItem("ventes-mon-gerant-v2")
    if (v) setVentes(JSON.parse(v))
    const vt = localStorage.getItem("ventes-tout-temps-mon-gerant")
    if (vt) { setVentesToutTemps(JSON.parse(vt)) } else if (v) { setVentesToutTemps(JSON.parse(v)) }
    const p = localStorage.getItem("produits-mon-gerant-v2")
    if (p) setProduits(JSON.parse(p))
    const d = localStorage.getItem("dettes-mon-gerant-v2")
    if (d) setDettes(JSON.parse(d))
    const dep = localStorage.getItem("depenses-mon-gerant-v2")
    if (dep) setDepenses(JSON.parse(dep))
    const cmd = localStorage.getItem("commandes-mon-gerant")
    if (cmd) setCommandes(JSON.parse(cmd))
    const ach = localStorage.getItem("achats-fournisseurs-mon-gerant")
    if (ach) setAchats(JSON.parse(ach))
    const nb = localStorage.getItem("nom-boutique-mon-gerant")
    if (nb) setNomBoutique(nb)
    const obj = localStorage.getItem("objectif-mon-gerant")
    if (obj) setObjectif(obj)
    const bid = localStorage.getItem("boutique-id-mon-gerant")
    if (bid) setBoutiqueId(bid)
    const cb = localStorage.getItem("code-boutique-mon-gerant")
    if (cb) setCodeBoutique(cb)
    const rl = localStorage.getItem("role-boutique-mon-gerant")
    if (rl) setRole(rl)
    setCharge(false)
  }, [])

   
  useEffect(() => { if (!charge) localStorage.setItem("ventes-mon-gerant-v2", JSON.stringify(ventes)) }, [ventes, charge])
  useEffect(() => { if (!charge) localStorage.setItem("ventes-tout-temps-mon-gerant", JSON.stringify(ventesToutTemps)) }, [ventesToutTemps, charge])
  useEffect(() => { if (!charge) localStorage.setItem("produits-mon-gerant-v2", JSON.stringify(produits)) }, [produits, charge])
  useEffect(() => { if (!charge) localStorage.setItem("dettes-mon-gerant-v2", JSON.stringify(dettes)) }, [dettes, charge])
  useEffect(() => { if (!charge) localStorage.setItem("depenses-mon-gerant-v2", JSON.stringify(depenses)) }, [depenses, charge])
  useEffect(() => { if (!charge) localStorage.setItem("commandes-mon-gerant", JSON.stringify(commandes)) }, [commandes, charge])
  useEffect(() => { if (!charge) localStorage.setItem("achats-fournisseurs-mon-gerant", JSON.stringify(achats)) }, [achats, charge])
  useEffect(() => { if (!charge) localStorage.setItem("nom-boutique-mon-gerant", nomBoutique) }, [nomBoutique, charge])
  useEffect(() => { if (!charge) localStorage.setItem("objectif-mon-gerant", objectif) }, [objectif, charge])
  useEffect(() => { if (!charge && boutiqueId) localStorage.setItem("boutique-id-mon-gerant", boutiqueId) }, [boutiqueId, charge])
  useEffect(() => { if (!charge && codeBoutique) localStorage.setItem("code-boutique-mon-gerant", codeBoutique) }, [codeBoutique, charge])
  useEffect(() => { if (!charge) localStorage.setItem("role-boutique-mon-gerant", role) }, [role, charge])

  // Ventes en direct - SUPABASE TEMPS REEL
  useEffect(() => {
    if (!boutiqueId) {
      // Pas de boutique = on affiche juste les ventes locales
      setVentesLive(ventes.slice(-5).reverse().map((v, i) => ({ id: i, produit_nom: v.items, montant: v.total, vendeur: labelPaiement(v.paiement) })))
      return
    }

    const charger = async () => {
      const { data } = await supabase
        .from('ventes_live')
        .select('*')
        .eq('boutique_id', boutiqueId)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data && data.length > 0) setVentesLive(data)
    }
    charger()

    const channel = supabase
      .channel('ventes-live-' + boutiqueId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ventes_live' }, (payload) => {
        if (payload.new.boutique_id === boutiqueId) {
          setVentesLive(prev => [payload.new as any, ...prev].slice(0, 5))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [boutiqueId, ventes])

  const creerBoutique = async () => {
    const nom = prompt('Nom du maquis ?') || 'Mon Maquis'
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const idLocal = 'local-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)

    setBoutiqueId(idLocal)
    setCodeBoutique(code)
    setNomBoutique(nom)
    setRole('patron')
    localStorage.setItem('boutique-id-mon-gerant', idLocal)
    localStorage.setItem('code-boutique-mon-gerant', code)
    localStorage.setItem('nom-boutique-mon-gerant', nom)
    localStorage.setItem('role-boutique-mon-gerant', 'patron')

    try {
      const { data, error } = await supabase
        .from('boutiques')
        .insert([{ nom, code }])
        .select()
        .single()
      
      if (error) {
        alert('ERREUR SUPABASE BOUTIQUE : ' + error.message)
        console.log('Erreur complète :', error)
      } else if (data) {
        setBoutiqueId(data.id)
        localStorage.setItem('boutique-id-mon-gerant', data.id)
        alert('Maquis synchronisé Supabase ! ID : ' + data.id)
      }
    } catch (e: any) {
      alert('ERREUR CATCH : ' + e.message)
      console.log('Mode offline, boutique locale utilisée')
    }

    alert(`Boutique créée ! Code : ${code} - Partage-le à ton équipe`)
  }
    const chargerProduitsDepuisSupabase = async (idBoutique: string) => {
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .eq('boutique_id', idBoutique)
    if (error) { console.log('Erreur chargement produits', error); return }
    if (data && data.length > 0) {
      const produitsCharges = data.map((p: any) => ({
        nom: p.nom,
        prix: p.prix_vente,
        achat: p.prix_achat,
        stock: p.stock
      }))
      setProduits(produitsCharges)
      alert(`✅ ${produitsCharges.length} produits récupérés !`)
    }
  }

const chargerVentes = async (idBoutique) => {
  const { data, error } = await supabase
    .from('ventes')
    .select('*')
    .eq('boutique_id', idBoutique)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) { console.log(error); return }

  const ventesPropres = (data || []).map(v => {
    let itemsTexte = ''
    try {
      if (!v.items) itemsTexte = v.produit_nom || 'Vente'
      else if (typeof v.items === 'string') itemsTexte = v.items
      else itemsTexte = JSON.stringify(v.items)
    } catch(e) { itemsTexte = v.produit_nom || 'Vente' }

    return {
      ...v,
      items: itemsTexte,
      total: Number(v.total ?? v.montant ?? 0) || 0,
      date: v.date || v.created_at || new Date().toISOString(),
      benefice: Number(v.benefice ?? 0) || 0,
      montant: Number(v.montant ?? v.total ?? 0) || 0,
    }
  })

  setVentes(ventesPropres)
  setVentesToutTemps(ventesPropres)
}

  const rejoindreBoutique = async () => {
    const codeSaisi = prompt('Entre le code du maquis ?')
    if (!codeSaisi) return
    const codePropre = codeSaisi.trim().toUpperCase()

    // On essaie de retrouver le maquis sur Supabase
    try {
      const { data } = await supabase.from('boutiques').select('*').eq('code', codePropre).single()
      if (data) {
        setBoutiqueId(data.id)
        setCodeBoutique(data.code)
        setNomBoutique(data.nom)
        setRole('gerant')
        localStorage.setItem('boutique-id-mon-gerant', data.id)
        localStorage.setItem('code-boutique-mon-gerant', data.code)
        localStorage.setItem('nom-boutique-mon-gerant', data.nom)
        localStorage.setItem('role-boutique-mon-gerant', 'gerant')
        alert(`Connecté au maquis ${data.nom} !`)
        return
      }
    } catch (e) { console.log('Pas trouvé en ligne, on essaie en local') }

    // Sinon, mode local : on accepte le code tel quel
    const idLocal = 'local-' + codePropre
    setBoutiqueId(idLocal)
    setCodeBoutique(codePropre)
    setNomBoutique('Maquis ' + codePropre)
    setRole('gerant')
    localStorage.setItem('boutique-id-mon-gerant', idLocal)
    localStorage.setItem('code-boutique-mon-gerant', codePropre)
    localStorage.setItem('nom-boutique-mon-gerant', 'Maquis ' + codePropre)
    localStorage.setItem('role-boutique-mon-gerant', 'gerant')
    alert(`Connecté avec le code ${codePropre} !`)
  }

  const nomAffiche = nomBoutique.trim() || "Mon Gérant"
  const totalBrut = panier.reduce((s, p) => s + p.prix, 0)
  const remiseNum = Number(remise) || 0
  const montantRemise = typeRemise === 'pourcent' ? Math.round(totalBrut * remiseNum / 100) : remiseNum
  const montantRemiseClamp = Math.min(Math.max(0, montantRemise), totalBrut)
  const total = totalBrut - montantRemiseClamp
  const monnaie = Number(montantDonne) - total
  const totalJour = ventes.reduce((a, v: any) => a + (typeof v === 'number' ? v : (v.total || 0)), 0)
  const totalDettes = dettes.reduce((a, d) => a + d.total, 0)
  const totalDepenses = depenses.reduce((a, d) => a + d.montant, 0)
  const totalCommandes = commandes.reduce((a, c) => a + c.total, 0)
  const totalRemisesJour = ventes.reduce((a, v) => a + (v.remise || 0), 0)
  const totalAchatsJour = achats.filter(a => { const d = new Date(a.date); const auj = new Date(); return d.toDateString() === auj.toDateString() }).reduce((s, a) => s + a.total, 0)
  const totalDuFournisseurs = achats.filter(a => !a.paye).reduce((s, a) => s + a.total, 0)
  const coutPanier = panier.reduce((s, p) => s + (p.achat || 0), 0)
  const beneficeApresRemise = total - coutPanier
  const remiseDangereuse = panier.length > 0 && beneficeApresRemise < 0
  const remiseSansBenefice = panier.length > 0 && beneficeApresRemise === 0 && montantRemiseClamp > 0
  const sommeMixte = (Number(mixteEspeces) || 0) + (Number(mixteWave) || 0) + (Number(mixteOrange) || 0)
  const resteMixte = total - sommeMixte
  const mixteOk = panier.length > 0 && sommeMixte === total && total > 0

  // EN HAUT avec tes autres useState
const [jours7, setJours7] = useState<{ label: string, dateStr: string, total: number }[]>([])

// AILLEURS, dans un useEffect
useEffect(() => {
  const arr: { label: string, dateStr: string, total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const totalJ = (ventesToutTemps || []).filter(v => {
      try {
        if (!v) return false
        const dateV = v?.date || v?.created_at
        if (!dateV || typeof dateV !== 'string') return false
        return dateV.split('T')[0] === dateStr
      } catch(e) { return false }
    }).reduce((s, v) => s + (Number(v?.total ?? v?.montant ?? 0) || 0), 0)
    const label = i === 0 ? "Auj." : d.toLocaleDateString('fr-FR', { weekday: 'short' })
    arr.push({ label, dateStr, total: totalJ })
  }
  setJours7(arr)
}, [ventesToutTemps])

const maxJours = Math.max(...jours7.map(j => Number(j?.total ?? 0) || 0), 1)
const total7Jours = jours7.reduce((s, j) => s + (Number(j?.total ?? 0) || 0), 0)
const moyenne7Jours = Math.round(total7Jours / 7)
const hier = jours7.length > 1 ? (Number(jours7[jours7.length - 2]?.total ?? 0) || 0) : 0
const aujTotal = jours7.length > 0 ? (Number(jours7[jours7.length - 1]?.total ?? 0) || 0) : 0
const evolution = hier > 0 ? Math.round(((aujTotal - hier) / hier) * 100) : aujTotal > 0 ? 100 : 0

const joursDepuis = (dateStr: string) => {
  try {
    if (!dateStr) return 0
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 0
    return Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  } catch(e) { return 0 }
}
const dettesAnciennes = (dettes || []).filter(d => joursDepuis(d?.date) >= 7)
const totalDettesAnciennes = dettesAnciennes.reduce((s, d) => s + (Number(d?.total ?? 0) || 0), 0)

const getPaiement = (v: any) => v?.paiement || v?.mode_paiement || 'especes'
const totalEspeces = (ventes || []).reduce((a, v) => a + (getPaiement(v) === 'especes' ? (Number(v?.total ?? v?.montant ?? 0) || 0) : 0), 0)
const totalWave = (ventes || []).reduce((a, v) => a + (getPaiement(v) === 'wave' ? (Number(v?.total ?? v?.montant ?? 0) || 0) : 0), 0)
const totalOrange = (ventes || []).reduce((a, v) => a + (getPaiement(v) === 'orange' ? (Number(v?.total ?? v?.montant ?? 0) || 0) : 0), 0)
const labelPaiement = (p: string) => p === 'wave' ? '🟦 Wave' : p === 'orange' ? '🟧 Orange Money' : p === 'credit' ? '📒 Crédit' : p === 'mixte' ? '🟪 Mixte' : '💵 Espèces'

  type ClienteStats = { nom: string, totalAchete: number, totalDu: number, nbAchats: number, nbDettes: number, dernierAchat: string }
  const clientesMap: Record<string, ClienteStats> = {}
  dettes.forEach(d => {
    const nom = d.client.trim()
    if (!clientesMap[nom]) clientesMap[nom] = { nom, totalAchete: 0, totalDu: 0, nbAchats: 0, nbDettes: 0, dernierAchat: d.date }
    clientesMap[nom].totalDu += d.total
    clientesMap[nom].totalAchete += d.total
    clientesMap[nom].nbDettes += 1
    clientesMap[nom].nbAchats += 1
    if (new Date(d.date) > new Date(clientesMap[nom].dernierAchat)) clientesMap[nom].dernierAchat = d.date
  })
  ventesToutTemps.forEach(v => {
    const m = v.items.match(/ \(Crédit (.+)\)$/)
    if (!m) return
    const nom = m[1].trim()
    if (!clientesMap[nom]) clientesMap[nom] = { nom, totalAchete: 0, totalDu: 0, nbAchats: 0, nbDettes: 0, dernierAchat: v.date || "" }
    clientesMap[nom].totalAchete += v.total
    clientesMap[nom].nbAchats += 1
    if (v.date && new Date(v.date) > new Date(clientesMap[nom].dernierAchat)) clientesMap[nom].dernierAchat = v.date
  })
  const listeClientes = Object.values(clientesMap).sort((a, b) => b.totalAchete - a.totalAchete)
  const clientesFiltrees = listeClientes.filter(c => !rechercheCliente.trim() || c.nom.toLowerCase().includes(rechercheCliente.toLowerCase()))
  const meilleureCliente = listeClientes[0]
  const totalClientes = listeClientes.length

  const objectifNum = Number(objectif) || 0
  const progression = objectifNum > 0 ? Math.min(100, Math.round((totalJour / objectifNum) * 100)) : 0
  const resteObjectif = Math.max(0, objectifNum - totalJour)
  const valeurStockAchat = produits.reduce((a, p) => a + (p.stock || 0) * (p.achat || 0), 0)
  const valeurStockVente = produits.reduce((a, p) => a + (p.stock || 0) * p.prix, 0)
  const beneficeFuturStock = valeurStockVente - valeurStockAchat

  const ruptures = produits.filter(p => (p.stock || 0) === 0)
  const stockBas = produits.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 2)
  const alertesStock = [...ruptures, ...stockBas]

  const partagerListeCourses = () => {
    const texte = `🛒 *Ma Liste de Courses - ${nomAffiche}*\n📅 ${new Date().toLocaleDateString('fr-FR')}\n\n${ruptures.length > 0 ? `⛔ *EN RUPTURE - À acheter en URGENCE :*\n${ruptures.map(p => `- ${p.nom} (stock 0)`).join('\n')}\n\n` : ''}${stockBas.length > 0 ? `⚠️ *STOCK BAS - Bientôt fini :*\n${stockBas.map(p => `- ${p.nom} (il reste ${p.stock})`).join('\n')}\n\n` : ''}N'oublie pas d'acheter ça au marché demain ! 🙏`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }

  const statsProduits: Record<string, { nom: string, qte: number, total: number, benefice: number }> = {}
  ventesToutTemps.forEach(v => {
    if (!v.items) return
    const itemsPropres = v.items.replace(/ \(Crédit .*\)$/, "").replace(/ \(Mixte.*\)$/, "")
    itemsPropres.split(', ').forEach(part => {
      const match = part.match(/^(\d+)x (.+)$/)
      if (!match) return
      const qte = Number(match[1]); const nom = match[2]
      const prod = produits.find(p => p.nom === nom)
      const prixVente = prod ? prod.prix : 0
      const prixAchat = prod ? (prod.achat || 0) : 0
      if (!statsProduits[nom]) statsProduits[nom] = { nom, qte: 0, total: 0, benefice: 0 }
      statsProduits[nom].qte += qte
      statsProduits[nom].total += qte * prixVente
      statsProduits[nom].benefice += qte * (prixVente - prixAchat)
    })
  })
  const listeStats = Object.values(statsProduits)
  const calculerBenefice = (listeVentes: Vente[]) => {
    let b = 0
    const dejaCompte = new Set<string>()
    listeVentes.forEach((v, idx) => {
      if (!v.items) return
      if (v.items.startsWith("Paiement partiel")) { b += v.benefice || 0; return }
      if (v.items.includes("(Mixte")) {
        const cle = v.items.split(" (Mixte")[0] + v.date
        if (dejaCompte.has(cle)) return
        dejaCompte.add(cle)
      }
      v.items.replace(/ \(Crédit .*\)$/, "").replace(/ \(Mixte.*\)$/, "").split(', ').forEach(part => {
        const m = part.match(/^(\d+)x (.+)$/); if (!m) return
        const prod = produits.find(p => p.nom === m[2]); if (prod) b += Number(m[1]) * (prod.prix - (prod.achat || 0))
      })
    })
    return b
  }
  const beneficeBrutSansRemise = calculerBenefice(ventes)
  const beneficeBrut = beneficeBrutSansRemise - totalRemisesJour
  const beneficeNet = beneficeBrut - totalDepenses
  const medailles = ['🥇', '🥈', '🥉']
  const topVendus = [...listeStats].sort((a, b) => b.qte - a.qte).slice(0, 3)
  const topRentables = [...listeStats].sort((a, b) => b.benefice - a.benefice).slice(0, 3)
  const beneficeToutTemps = calculerBenefice(ventesToutTemps) - ventesToutTemps.reduce((a, v) => a + (v.remise || 0), 0)
  const totalVenduToutTemps = ventesToutTemps.reduce((a, v) => a + (v.total || 0), 0)

  const ajouterDepense = () => {
    if (!nomDepense || !montantDepense) { alert("Mets le nom et le montant ! Ex: Transport - 2000"); return }
    setDepenses([...depenses, { nom: nomDepense, montant: Number(montantDepense), date: new Date().toISOString() }])
    setNomDepense(""); setMontantDepense("")
  }

  const validerInventaire = () => {
    let corrections: string[] = []
    const nouveaux = produits.map((p, i) => {
      const saisie = stockInventaire[i]
      if (saisie === undefined || saisie === "") return p
      const vraiStock = Number(saisie)
      if (vraiStock !== p.stock) corrections.push(`${p.nom} : ${p.stock} → ${vraiStock}`)
      return { ...p, stock: vraiStock }
    })
    if (corrections.length === 0) { alert("✅ Tout est juste ! Aucune correction."); return }
    if (!confirm(`Tu confirmes ces corrections ?\n\n${corrections.join('\n')}`)) return
    setProduits(nouveaux)
    setStockInventaire({})
    setAfficherInventaire(false)
    alert(`✅ Inventaire validé ! ${corrections.length} produit(s) corrigé(s).`)
  }

  const ajouterAchatFournisseur = () => {
    if (!nomFournisseur.trim()) { alert("Tape le nom du fournisseur ! Ex: Tantie Fatou"); return }
    if (!produitAchat.trim()) { alert("Choisis ou tape le produit !"); return }
    if (!qteAchat || Number(qteAchat) <= 0) { alert("Mets la quantité ! Ex: 20"); return }
    if (!prixAchatFournisseur || Number(prixAchatFournisseur) <= 0) { alert("Mets le prix d'achat ! Ex: 200"); return }
    const qte = Number(qteAchat); const prixUnit = Number(prixAchatFournisseur); const totalAchat = qte * prixUnit
    if (!confirm(`Tu confirmes ?\n\n${qte}x ${produitAchat} chez ${nomFournisseur}\nÀ ${prixUnit} F l'unité = ${totalAchat} F\n${fournisseurPaye ? '✅ J\'ai déjà payé' : '📒 Je paierai après'}`)) return
    const nouveauAchat: AchatFournisseur = { fournisseur: nomFournisseur.trim(), produit: produitAchat.trim(), qte, prixUnitaire: prixUnit, total: totalAchat, date: new Date().toISOString(), paye: fournisseurPaye }
    setAchats([...achats, nouveauAchat])
    const idxProd = produits.findIndex(p => p.nom.toLowerCase() === produitAchat.trim().toLowerCase())
    if (idxProd !== -1) {
      setProduits(produits.map((p, i) => i === idxProd ? { ...p, stock: (p.stock || 0) + qte, achat: prixUnit } : p))
    } else {
      const prixVente = prompt(`Nouveau produit "${produitAchat}" !\nÀ combien tu vas le VENDRE ?`, String(prixUnit + 50))
      if (prixVente) setProduits([...produits, { nom: produitAchat.trim(), prix: Number(prixVente), stock: qte, achat: prixUnit }])
    }
    if (fournisseurPaye) setDepenses([...depenses, { nom: `Achat ${qte}x ${produitAchat} chez ${nomFournisseur.trim()}`, montant: totalAchat, date: new Date().toISOString() }])
    setNomFournisseur(""); setProduitAchat(""); setQteAchat(""); setPrixAchatFournisseur(""); setFournisseurPaye(true)
    alert(`✅ Achat enregistré ! Stock de ${produitAchat} +${qte}`)
  }
  const payerFournisseur = (index: number) => {
    const a = achats[index]
    if (!confirm(`Tu as payé ${a.fournisseur} pour ${a.qte}x ${a.produit} = ${a.total} F ?`)) return
    setAchats(achats.map((x, i) => i === index ? { ...x, paye: true } : x))
    setDepenses([...depenses, { nom: `Paiement fournisseur ${a.fournisseur} - ${a.qte}x ${a.produit}`, montant: a.total, date: new Date().toISOString() }])
  }

  const envoyerRecu = (vente: Vente) => {
    let lignes = ""
    if (vente.detail && vente.detail.length > 0) lignes = vente.detail.map(d => `• ${d.qte}x ${d.nom} - ${d.prix} F x ${d.qte} = ${d.qte * d.prix} F`).join('\n')
    else {
      const itemsPropres = vente.items.replace(/ \(Crédit .*\)$/, "").replace(/ \(Mixte.*\)$/, "")
      lignes = itemsPropres.split(', ').map(part => {
        const m = part.match(/^(\d+)x (.+)$/)
        if (!m) return `• ${part}`
        const qte = Number(m[1]); const nom = m[2]
        const prod = produits.find(p => p.nom === nom)
        const prix = prod ? prod.prix : 0
        if (prix === 0) return `• ${qte}x ${nom}`
        return `• ${qte}x ${nom} - ${prix} F x ${qte} = ${qte * prix} F`
      }).join('\n')
    }
    const sousTotal = vente.detail ? vente.detail.reduce((s, d) => s + d.qte * d.prix, 0) : vente.total + (vente.remise || 0)
    const ligneRemise = (vente.remise || 0) > 0 ? `\n🏷️ Remise : -${vente.remise} F` : ""
    const texte = `🧾 *REÇU - ${nomAffiche}*\n📅 ${vente.date ? new Date(vente.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')} à ${vente.date ? new Date(vente.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}\n💳 Paiement : ${labelPaiement(vente.paiement)}\n\n${lignes}\n\nSous-total : ${sousTotal} F${ligneRemise}\n💰 *TOTAL : ${vente.total} F*\n\nMerci de ta visite chez ${nomAffiche} ! 😊\nÀ très bientôt 🙏`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }

  const partagerTop = () => {
    const texte = `🏆 *${nomAffiche} - Top Produits (Depuis le début)*\n\n🔥 *Les plus vendus :*\n${topVendus.map((p, i) => `${medailles[i]} ${p.nom} - ${p.qte} vendus = ${p.total} F`).join('\n') || 'Aucune vente encore'}\n\n💚 *Les plus rentables :*\n${topRentables.map((p, i) => `${medailles[i]} ${p.nom} - Bénéfice ${p.benefice} F`).join('\n') || 'Aucune vente encore'}\n\n💰 Total vendu depuis le début : ${totalVenduToutTemps} F\n💚 Bénéfice total depuis le début : ${beneficeToutTemps} F`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }

  const nouvelleJournee = async () => {
    if (!confirm(`Nouvelle journée ?\n\n✅ Le TOP va rester (depuis le début).\n🗑️ Seules les ventes d'aujourd'hui vont être effacées.\n\nTu confirmes ?`)) return

    setVentes([]); setDepenses([]); setDerniereVente(null)
    setVentesPatron([])

    try {
      const debutJour = new Date()
      debutJour.setHours(0, 0, 0, 0)
      const { error, count } = await supabase
        .from('ventes')
        .delete()
        .gte('created_at', debutJour.toISOString())
        .select()
      console.log('Delete ventes directes:', { error, count })
      if (error) alert('Erreur suppression Supabase: ' + error.message)
    } catch (e) {
      console.log('Erreur nouvelle journée:', e)
    }

    alert("✅ Nouvelle journée ! Le TOP est gardé.")
  }
 
  const creerSauvegarde = () => {
    const data = { produits, ventes, ventesToutTemps, dettes, depenses, commandes, achats, nomBoutique, objectif, date: new Date().toISOString() }
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    setCodeSauvegarde(code); setAfficherSauvegarde(true); return code
  }
  const copierSauvegarde = async () => {
    const code = creerSauvegarde()
    try { await navigator.clipboard.writeText(code); alert("✅ Code copié ! Envoie-le sur ton WhatsApp pour le garder.") } catch { alert("Copie le code manuellement en dessous") }
  }
  const envoyerSauvegardeWhatsApp = () => {
    const code = creerSauvegarde()
    const texte = `💾 *SAUVEGARDE ${nomAffiche} - ${new Date().toLocaleDateString('fr-FR')}*\n\nProduits: ${produits.length}, Ventes du jour: ${ventes.length}, Ventes depuis le début: ${ventesToutTemps.length}, Dettes: ${dettes.length}, Commandes: ${commandes.length}, Achats: ${achats.length}, Dépenses: ${depenses.length}\n\nGarde ce message ! Pour restaurer, copie le code et colle-le dans l'app.\n\nCODE:\n${code}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }
  const restaurerSauvegarde = () => {
    const code = codeSauvegarde.trim()
    if (!code) { alert("Colle d'abord ton code de sauvegarde !"); return }
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(code))))
      if (!data.produits) throw new Error("Code invalide")
      if (!confirm(`Restaurer la sauvegarde du ${new Date(data.date).toLocaleDateString('fr-FR')} ?\n${data.produits.length} produits, ${data.ventes?.length || 0} ventes du jour, ${data.ventesToutTemps?.length || 0} ventes depuis le début.\nCela va remplacer les données actuelles.`)) return
      setProduits(data.produits); setVentes(data.ventes || []); setVentesToutTemps(data.ventesToutTemps || data.ventes || []); setDettes(data.dettes || []); setDepenses(data.depenses || []); setCommandes(data.commandes || []); setAchats(data.achats || []); if (data.nomBoutique) setNomBoutique(data.nomBoutique); if (data.objectif) setObjectif(data.objectif)
      alert("✅ Sauvegarde restaurée !"); setAfficherSauvegarde(false)
    } catch { alert("❌ Code invalide ! Vérifie que tu as copié tout le code.") }
  }

  const normaliser = (texte: string) => texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const produitsFiltres = produits.map((p, idx) => ({ ...p, vraiIndex: idx })).filter(p => {
    if (!recherche.trim()) return true
    return normaliser(p.nom).includes(normaliser(recherche.trim()))
  })
  const getQuantite = (idx: number) => quantites[idx] || 1
  const changerQuantite = (idx: number, delta: number) => {
    const actuelle = getQuantite(idx)
    const nouvelle = Math.max(1, Math.min(99, actuelle + delta))
    setQuantites({ ...quantites, [idx]: nouvelle })
  }
  const ajouterProduit = async () => {
    if (!nouveauNom || !nouveauPrix) return
    
    const nouveauProduitLocal = { 
      nom: nouveauNom, 
      prix_vente: Number(nouveauPrix), 
      prix_achat: Number(nouvelAchat) || 0,
      stock: Number(nouveauStock) || 0,
      boutique_id: boutiqueId
    }

    // 1. Affichage immédiat en local
    // On garde aussi prix/achat pour l'affichage actuel de ton app
    setProduits([...produits, { ...nouveauProduitLocal, prix: nouveauProduitLocal.prix_vente, achat: nouveauProduitLocal.prix_achat }])
    setNouveauNom(""); setNouveauPrix(""); setNouveauStock(""); setNouvelAchat("")

    // 2. Envoi à Supabase avec LES BONS NOMS DE COLONNES
    // Si boutiqueId est "local-..." ce n'est pas un UUID, Supabase va refuser
    if (!boutiqueId || boutiqueId.startsWith('local-')) {
      alert('Attention : ce maquis est en mode local, il ne peut pas se synchroniser. Recrée un maquis pour avoir un vrai ID Supabase.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('produits')
        .insert([{
          nom: nouveauNom,
          prix_vente: Number(nouveauPrix),
          prix_achat: Number(nouvelAchat) || 0,
          stock: Number(nouveauStock) || 0,
          boutique_id: boutiqueId
        }])
        .select()
        .single()
      
      if (error) {
        console.log('Erreur Supabase produits:', error.message)
        // Si le produit existe déjà (unique boutique_id + nom), on fait un UPDATE
        if (error.code === '23505') {
          await supabase.from('produits').update({
            prix_vente: Number(nouveauPrix),
            prix_achat: Number(nouvelAchat) || 0,
            stock: Number(nouveauStock) || 0
          }).eq('boutique_id', boutiqueId).eq('nom', nouveauNom)
          alert('Produit déjà existant, stock mis à jour !')
        } else {
          alert('Erreur synchro: ' + error.message)
        }
      } else {
        console.log('Produit synchronisé !', data)
      }
    } catch (e) {
      console.log('Mode offline', e)
    }
  }
  const ouvrirEdit = (idx: number) => {
    const p = produits[idx]
    setEditIndex(idx); setEditNom(p.nom); setEditPrix(String(p.prix)); setEditAchat(String(p.achat || 0))
  }
  const sauverEdit = () => {
    if (editIndex === null) return
    setProduits(produits.map((p, i) => i === editIndex ? { ...p, nom: editNom, prix: Number(editPrix) || 0, achat: Number(editAchat) || 0 } : p))
    setEditIndex(null)
    alert("✅ Produit corrigé !")
  }
  const ajouterAuPanier = (produit: Produit, idx: number) => {
    const qte = getQuantite(idx)
    const dejaDansPanier = panier.filter(p => p.nom === produit.nom).length
    if (dejaDansPanier + qte > (produit.stock || 0)) { alert(`⛔ Il ne reste que ${produit.stock - dejaDansPanier} x ${produit.nom} en stock !`); return }
    setPanier([...panier, ...Array(qte).fill(produit)])
    setQuantites({ ...quantites, [idx]: 1 }); setRecherche("")
  }
  const modifierStock = (index: number, delta: number) => {
    setProduits(produits.map((p, i) => { if (i !== index) return p; return { ...p, stock: Math.max(0, (p.stock || 0) + delta) } }))
  }
  const retirerStockPanier = () => produits.map(prod => { const vendu = panier.filter(p => p.nom === prod.nom).length; return { ...prod, stock: prod.stock - vendu } })

  const creerCommande = () => {
    if (panier.length === 0) { alert("Ton panier est vide !"); return }
    if (!nomCommande.trim()) { alert("Tape le nom de la cliente qui commande ! Ex: Awa"); return }
    const coutVerifCmd = panier.reduce((s, p) => s + (p.achat || 0), 0)
    if (total - coutVerifCmd < 0) { if (!confirm(`⛔ ATTENTION !\n\nCette commande te fait PERDRE ${-(total - coutVerifCmd)} F !\n\nTu es SÛRE ?`)) return }
    const comptage: Record<string, number> = {}
    panier.forEach(p => { comptage[p.nom] = (comptage[p.nom] || 0) + 1 })
    const detail = Object.entries(comptage).map(([nom, nb]) => `${nb}x ${nom}`).join(', ')
    const detailPrix = Object.entries(comptage).map(([nom, nb]) => {
      const prod = panier.find(p => p.nom === nom)
      return { nom, qte: nb, prix: prod ? prod.prix : 0 }
    })
    const coutTotal = panier.reduce((s, p) => s + (p.achat || 0), 0)
    const nouvelleCommande: Commande = { client: nomCommande.trim(), items: detail, total, date: new Date().toISOString(), benefice: total - coutTotal, detail: detailPrix, panierDetail: panier, remise: montantRemiseClamp }
    setCommandes([...commandes, nouvelleCommande])
    setPanier([]); setNomCommande(""); setModePaiement('especes'); setRemise("")
    alert(`📦 Commande enregistrée pour ${nomCommande} : ${total} F${montantRemiseClamp > 0 ? ` (remise ${montantRemiseClamp} F incluse)` : ''}\n\nLe stock n'a PAS encore diminué.`)
  }
  const encaisserCommande = (index: number) => {
    const cmd = commandes[index]
    for (const d of cmd.detail) {
      const prod = produits.find(p => p.nom === d.nom)
      if (!prod || (prod.stock || 0) < d.qte) { alert(`⛔ Plus assez de ${d.nom} en stock ! Il ne reste que ${prod ? prod.stock : 0}, il faut ${d.qte}.`); return }
    }
    const choix = prompt(`Comment ${cmd.client} paie ses ${cmd.total} F ?\n\nTape :\n1 = Espèces\n2 = Wave\n3 = Orange Money\n4 = Crédit (elle paiera après)\n\n(Annuler = Espèces)`, "1")
    const paiementChoisi = choix === "2" ? 'wave' : choix === "3" ? 'orange' : choix === "4" ? 'credit' : 'especes'
    if (!confirm(`${cmd.client} a payé ${cmd.total} F en ${labelPaiement(paiementChoisi)} ?\n${cmd.items}`)) return
    if (paiementChoisi === 'credit') {
      const nouvelleDette = { client: cmd.client, items: cmd.items, total: cmd.total, date: new Date().toISOString(), benefice: cmd.benefice, panierDetail: cmd.panierDetail, totalOrigine: cmd.total, dejaPaye: 0 }
      setDettes([...dettes, nouvelleDette])
      const nouveauxProduits = produits.map(prod => { const vendu = cmd.panierDetail.filter(p => p.nom === prod.nom).length; return { ...prod, stock: prod.stock - vendu } })
      setProduits(nouveauxProduits)
      setCommandes(commandes.filter((_, i) => i !== index))
      setDerniereVente({ items: cmd.items, total: cmd.total, date: new Date().toISOString(), benefice: cmd.benefice, detail: cmd.detail, paiement: 'credit', remise: cmd.remise })
      alert(`📒 Commande de ${cmd.client} transformée en Crédit : ${cmd.total} F`)
      return
    }
    const v: Vente = { items: cmd.items, total: cmd.total, date: new Date().toISOString(), benefice: cmd.benefice, detail: cmd.detail, paiement: paiementChoisi, remise: cmd.remise }
    setVentes([...ventes, v]); setVentesToutTemps([...ventesToutTemps, v]); setDerniereVente(v)
    const nouveauxProduits = produits.map(prod => { const vendu = cmd.panierDetail.filter(p => p.nom === prod.nom).length; return { ...prod, stock: prod.stock - vendu } })
    setProduits(nouveauxProduits)
    setCommandes(commandes.filter((_, i) => i !== index))
    alert(`✅ Commande de ${cmd.client} encaissée : ${cmd.total} F en ${labelPaiement(paiementChoisi)}`)
  }
  const annulerCommande = (index: number) => {
    const cmd = commandes[index]
    if (!confirm(`Annuler la commande de ${cmd.client} ?\n${cmd.items} = ${cmd.total} F`)) return
    setCommandes(commandes.filter((_, i) => i !== index))
  }
  const relancerCommande = (cmd: Commande) => {
    const texte = `Bonjour ${cmd.client} 😊\n\nC'est ${nomAffiche}.\nTa commande est prête ! 🎉\n${cmd.detail.map(d => `• ${d.qte}x ${d.nom} = ${d.qte * d.prix} F`).join('\n')}\n\n${(cmd.remise || 0) > 0 ? `🏷️ Remise : -${cmd.remise} F\n` : ''}💰 Total : *${cmd.total} F*\n\nTu peux passer quand tu veux pour récupérer 🙏`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }

  const encaisserMixte = async () => {
    if (panier.length === 0) return
    if (!mixteOk) { alert(`La somme ne fait pas ${total} F !\nTu as mis ${sommeMixte} F, il ${resteMixte > 0 ? `manque ${resteMixte} F` : `y a ${-resteMixte} F en trop`}.`); return }
    const comptage: Record<string, number> = {}
    panier.forEach(p => { comptage[p.nom] = (comptage[p.nom] || 0) + 1 })
    const detail = Object.entries(comptage).map(([nom, nb]) => `${nb}x ${nom}`).join(', ')
    const detailPrix = Object.entries(comptage).map(([nom, nb]) => {
      const prod = panier.find(p => p.nom === nom)
      return { nom, qte: nb, prix: prod ? prod.prix : 0 }
    })
    const coutTotal = panier.reduce((s, p) => s + (p.achat || 0), 0)
    const beneficeTotal = total - coutTotal
    const parts: { paiement: string, montant: number }[] = []
    if (Number(mixteEspeces) > 0) parts.push({ paiement: 'especes', montant: Number(mixteEspeces) })
    if (Number(mixteWave) > 0) parts.push({ paiement: 'wave', montant: Number(mixteWave) })
    if (Number(mixteOrange) > 0) parts.push({ paiement: 'orange', montant: Number(mixteOrange) })

    // === ENVOIE À SUPABASE - 1 SEULE LIGNE ===
    const idBoutique = (typeof boutique !== 'undefined' && boutique?.id) || localStorage.getItem('boutique-id-mon-gerant') || localStorage.getItem('boutique-id')

        const { error: errVente } = await supabase
      .from('ventes')
      .insert([{
        boutique_id: idBoutique,
        total: total,
        date: new Date().toISOString(),
        items: detail,
        benefice: beneficeTotal,
        mode_paiement: 'mixte',
        vendeur: 'Gérant',
        produit_nom: detail + ' (Mixte)',
        montant: total,
        quantite: panier.length,
      }])

    if (errVente) {
      alert('ERREUR VENTE MIXTE: ' + errVente.message)
      console.log(errVente)
      return
    }

    const nouvellesVentes: Vente[] = parts.map((part, idx) => {
      const partBenefice = idx === 0 ? Math.round(beneficeTotal * (part.montant / total)) : idx === parts.length - 1 ? beneficeTotal - Math.round(beneficeTotal * (parts[0].montant / total)) : Math.round(beneficeTotal * (part.montant / total))
      return { items: `${detail} (Mixte ${part.paiement})`, total: part.montant, date: new Date().toISOString(), benefice: partBenefice, detail: idx === 0 ? detailPrix : [], paiement: part.paiement, remise: idx === 0 ? montantRemiseClamp : 0 }
    })
    setVentes([...ventes, ...nouvellesVentes])
    setVentesToutTemps([...ventesToutTemps, ...nouvellesVentes])
    setDerniereVente(nouvellesVentes[0])
    setProduits(retirerStockPanier())
    setPanier([]); setMontantDonne(""); setModePaiement('especes'); setRemise("")
    setMixteEspeces(""); setMixteWave(""); setMixteOrange("")
    const resume = parts.map(p => `${labelPaiement(p.paiement)} ${p.montant} F`).join(' + ')
    alert(`✅ Paiement Mixte encaissé : ${resume} = ${total} F`)
  }

  
  const encaisser = async () => {
    if (panier.length === 0) return
    if (modePaiement === 'mixte') { encaisserMixte(); return }
    const coutVerif = panier.reduce((s, p) => s + (p.achat || 0), 0)
    if (total - coutVerif < 0) { if (!confirm(`⛔ ATTENTION !\n\nTu vas PERDRE ${-(total - coutVerif)} F sur cette vente !\n\nTu as acheté pour ${coutVerif} F, tu vends à ${total} F.\n\nTu es SÛRE de vouloir continuer quand même ?`)) return }
    const comptage: Record<string, number> = {}
    panier.forEach(p => { comptage[p.nom] = (comptage[p.nom] || 0) + 1 })
    const detail = Object.entries(comptage).map(([nom, nb]) => `${nb}x ${nom}`).join(', ')
    const detailPrix = Object.entries(comptage).map(([nom, nb]) => {
      const prod = panier.find(p => p.nom === nom)
      return { nom, qte: nb, prix: prod ? prod.prix : 0 }
    })
    const coutTotal = panier.reduce((s, p) => s + (p.achat || 0), 0)
    const benefice = total - coutTotal

    // === ENVOIE À SUPABASE - table ventes - VERSION CORRIGÉE ===
    let boutiqueStockee = null
    try {
      const brut = localStorage.getItem('boutique')
      if (brut) boutiqueStockee = JSON.parse(brut)
    } catch(e) { boutiqueStockee = null }
    const idBoutique = boutiqueStockee?.id || localStorage.getItem('boutique-id-mon-gerant') || localStorage.getItem('boutique-id')

    const dateVente = new Date().toISOString()

    const { error: errVente } = await supabase
      .from('ventes')
      .insert([{
        boutique_id: idBoutique,
        total: total,
        date: dateVente,
        items: detail,
        benefice: benefice,
        mode_paiement: modePaiement,
        vendeur: 'Gérant',
        produit_nom: detail,
        montant: total,
        quantite: panier.length,
      }])

    if (errVente) {
      alert('ERREUR VENTE: ' + errVente.message)
      console.log(errVente)
      return
    }

    if (modePaiement === 'credit') {
      if (!nomClient.trim()) { alert("Tape le nom de la cliente ! Ex: Awa"); return }
      const nouvelleDette = { client: nomClient.trim(), items: detail, total, date: new Date().toISOString(), benefice, panierDetail: panier, totalOrigine: total, dejaPaye: 0 }
      setDettes([...dettes, nouvelleDette])
      setProduits(retirerStockPanier())
      setPanier([]); setNomClient(""); setModePaiement('especes'); setRemise("")
      setDerniereVente({ items: detail, total, date: new Date().toISOString(), benefice, detail: detailPrix, paiement: 'credit', remise: montantRemiseClamp })
      alert(`📒 Crédit enregistré : ${nomClient} doit ${total} F${montantRemiseClamp > 0 ? ` (remise ${montantRemiseClamp} F)` : ''}`); return
    }
    if (modePaiement === 'especes' && Number(montantDonne) < total) { alert(`Il manque ${total - Number(montantDonne)} F !`); return }
    const nouvelleVente = { items: detail, total: total, date: new Date().toISOString(), benefice, detail: detailPrix, paiement: modePaiement, remise: montantRemiseClamp }
    setVentes([...ventes, nouvelleVente])
    setVentesToutTemps([...ventesToutTemps, nouvelleVente])
    setDerniereVente(nouvelleVente)
    setProduits(retirerStockPanier())
    setPanier([]); setMontantDonne(""); setModePaiement('especes'); setRemise("")
  }

  const payerDette = (index: number) => {
    const dette = dettes[index]
    const choix = prompt(`Comment ${dette.client} a payé ses ${dette.total} F ?\n\nTape :\n1 = Espèces\n2 = Wave\n3 = Orange Money\n\n(Annuler = Espèces)`, "1")
    const paiementChoisi = choix === "2" ? 'wave' : choix === "3" ? 'orange' : 'especes'
    if (!confirm(`${dette.client} a payé ${dette.total} F en ${labelPaiement(paiementChoisi)} ?`)) return
    const comptageDette: Record<string, { qte: number, prix: number }> = {}
    dette.panierDetail.forEach(p => {
      if (!comptageDette[p.nom]) comptageDette[p.nom] = { qte: 0, prix: p.prix }
      comptageDette[p.nom].qte++
    })
    const detailDette = Object.entries(comptageDette).map(([nom, d]) => ({ nom, qte: d.qte, prix: d.prix }))
    const v = { items: `${dette.items} (Crédit ${dette.client})`, total: dette.total, date: new Date().toISOString(), benefice: dette.benefice, detail: detailDette, paiement: paiementChoisi }
    setVentes([...ventes, v]); setVentesToutTemps([...ventesToutTemps, v]); setDerniereVente(v)
    setDettes(dettes.filter((_, i) => i !== index))
  }

  const payerDettePartiel = (index: number) => {
    const dette = dettes[index]
    const montantStr = prompt(`${dette.client} te doit encore ${dette.total} F\npour : ${dette.items}\n\nCombien elle te donne MAINTENANT ?\nEx: 3000`, "")
    if (montantStr === null) return
    const montantPaye = Number(montantStr)
    if (!montantPaye || montantPaye <= 0) { alert("Mets un montant ! Ex: 3000"); return }
    if (montantPaye > dette.total) { alert(`Elle ne te doit que ${dette.total} F !`); return }
    const choix = prompt(`Comment ${dette.client} a payé ces ${montantPaye} F ?\n\nTape :\n1 = Espèces\n2 = Wave\n3 = Orange Money`, "1")
    const paiementChoisi = choix === "2" ? 'wave' : choix === "3" ? 'orange' : 'especes'
    const reste = dette.total - montantPaye
    if (!confirm(`${dette.client} paie ${montantPaye} F en ${labelPaiement(paiementChoisi)} ?\n\nIl lui restera ${reste} F à payer.`)) return
    const partBenefice = dette.benefice * (montantPaye / (dette.totalOrigine || dette.total))
    const v = { items: `Paiement partiel dette ${dette.client} - ${dette.items}`, total: montantPaye, date: new Date().toISOString(), benefice: partBenefice, detail: [], paiement: paiementChoisi }
    setVentes([...ventes, v]); setVentesToutTemps([...ventesToutTemps, v]); setDerniereVente(v)
    if (reste === 0) {
      setDettes(dettes.filter((_, i) => i !== index))
      alert(`✅ ${dette.client} a tout payé ! Dette terminée.`)
    } else {
      const origine = dette.totalOrigine || dette.total
      const deja = (dette.dejaPaye || 0) + montantPaye
      setDettes(dettes.map((d, i) => i === index ? { ...d, total: reste, totalOrigine: origine, dejaPaye: deja, benefice: d.benefice - partBenefice } : d))
      alert(`💳 ${dette.client} a payé ${montantPaye} F.\nIl lui reste ${reste} F à payer.`)
    }
  }

  const annulerDette = (index: number) => {
    const dette = dettes[index]
    if (!confirm(`Annuler la dette de ${dette.client} ? Le stock va être rendu.`)) return
    const nouveauxProduits = [...produits]
    dette.panierDetail.forEach(p => { const idx = nouveauxProduits.findIndex(prod => prod.nom === p.nom); if (idx !== -1) nouveauxProduits[idx] = { ...nouveauxProduits[idx], stock: nouveauxProduits[idx].stock + 1 } })
    setProduits(nouveauxProduits); setDettes(dettes.filter((_, i) => i !== index))
  }
  const relancerDette = (dette: Dette) => {
    const deja = dette.dejaPaye || 0
    const origine = dette.totalOrigine || dette.total
    const nbJours = joursDepuis(dette.date)
    const texte = deja > 0
      ? `Bonjour ${dette.client} 😊\n\nC'est ${nomAffiche}.\nPour ta commande de ${origine} F (${dette.items}), tu as déjà payé ${deja} F, merci 🙏\nIl te reste encore *${dette.total} F* à régler.\n\nTu peux passer quand tu veux pour régler 🙏\nMerci !`
      : `Bonjour ${dette.client} 😊\n\nC'est ${nomAffiche}.\nTu me dois encore *${dette.total} F* pour : ${dette.items} (depuis ${nbJours} jour${nbJours > 1 ? 's' : ''}).\n\nTu peux passer quand tu veux pour régler 🙏\nMerci !`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }
  const relancerCliente = (cliente: ClienteStats) => {
    const texte = cliente.totalDu > 0
      ? `Bonjour ${cliente.nom} 😊\n\nC'est ${nomAffiche}.\nTu me dois encore *${cliente.totalDu} F*.\nTu as déjà acheté pour ${cliente.totalAchete} F chez moi, merci beaucoup 🙏\nTu peux passer quand tu veux pour régler.\nMerci !`
      : `Bonjour ${cliente.nom} 😊\n\nC'est ${nomAffiche}.\nMerci beaucoup, tu as déjà acheté pour *${cliente.totalAchete} F* chez moi ! 🙏\nTu es une de mes meilleures clientes.\nÀ très bientôt 😊`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }
  const annulerDerniereVente = () => {
    if (ventes.length === 0) return
    if (!confirm("Annuler la dernière vente ? Le stock va être rendu et le TOP va être corrigé.")) return
    const derniereVenteLocal = ventes[ventes.length - 1]
    setVentes(ventes.slice(0, -1))
    setVentesToutTemps(ventesToutTemps.slice(0, -1))
    setDerniereVente(null)
    const nouveauxProduits = [...produits]
    derniereVenteLocal.items.split(', ').forEach(part => {
      const match = part.match(/^(\d+)x (.+)$/)
      if (match) { const quantite = Number(match[1]); const nomProduit = match[2]; const index = nouveauxProduits.findIndex(p => p.nom === nomProduit); if (index !== -1) { nouveauxProduits[index] = { ...nouveauxProduits[index], stock: nouveauxProduits[index].stock + quantite } } }
    })
    setProduits(nouveauxProduits)
  }
  const partagerWhatsApp = () => {
    const texte = `🧺 *${nomAffiche} - Rapport du jour*\n\n💰 Ventes du jour : ${ventes.length}\n💵 Total vendu du jour : ${totalJour} F\n💵 Espèces : ${totalEspeces} F\n🟦 Wave : ${totalWave} F\n🟧 Orange Money : ${totalOrange} F\n🏷️ Remises données : ${totalRemisesJour} F\n🚚 Achats fournisseurs du jour : ${totalAchatsJour} F\n📒 Je dois aux fournisseurs : ${totalDuFournisseurs} F\n🎯 Objectif du jour : ${objectifNum ? `${objectifNum} F (${progression}%)` : 'Pas fixé'}\n💚 Bénéfice brut du jour : ${beneficeBrut} F\n💸 Dépenses : ${totalDepenses} F\n💚 Bénéfice net du jour : ${beneficeNet} F\n📒 Dettes en cours : ${totalDettes} F (${dettes.length} personnes)${totalDettesAnciennes > 0 ? `\n⏰ Dont dettes de +7 jours : ${totalDettesAnciennes} F` : ''}\n📦 Commandes en attente : ${totalCommandes} F (${commandes.length} commandes)\n💰 Valeur de mon stock : ${valeurStockVente} F\n\n📊 7 derniers jours : ${total7Jours} F (moyenne ${moyenne7Jours} F/jour)\n\n📋 Détail du jour :\n${ventes.map((v: any) => typeof v === 'number' ? `- Ancienne vente = ${v} F` : `- ${v.items} = ${v.total} F (${labelPaiement(v.paiement)})${(v.remise || 0) > 0 ? ` [Remise ${v.remise} F]` : ''}`).join('\n')}\n\nBonne soirée !`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }
  const envoyerPeriode = (debutStr: string, finStr: string, label: string) => {
    const debut = new Date(debutStr); const fin = new Date(finStr); fin.setHours(23, 59, 59)
    const ventesFiltrees = ventesToutTemps.filter(v => { if (!v.date) return true; const d = new Date(v.date); return d >= debut && d <= fin })
    const totalPeriode = ventesFiltrees.reduce((a, v) => a + v.total, 0)
    let beneficePeriode = 0
    ventesFiltrees.forEach(v => {
      if (!v.items) return
      if (v.items.startsWith("Paiement partiel")) { beneficePeriode += v.benefice || 0; return }
      v.items.replace(/ \(Crédit .*\)$/, "").replace(/ \(Mixte.*\)$/, "").split(', ').forEach(part => {
        const m = part.match(/^(\d+)x (.+)$/); if (!m) return
        const prod = produits.find(p => p.nom === m[2]); if (prod) beneficePeriode += Number(m[1]) * (prod.prix - (prod.achat || 0))
      })
    })
    const remisesPeriode = ventesFiltrees.reduce((a, v) => a + (v.remise || 0), 0)
    const depensesPeriode = depenses.filter(d => { const dt = new Date(d.date); return dt >= debut && dt <= fin }).reduce((a, d) => a + d.montant, 0)
    const texte = `🧺 *${nomAffiche} - ${label}*\n\n📅 Du ${debutStr} au ${finStr}\n💰 Ventes : ${ventesFiltrees.length}\n💵 Total vendu : ${totalPeriode} F\n🏷️ Remises : ${remisesPeriode} F\n💚 Bénéfice brut : ${beneficePeriode - remisesPeriode} F\n💸 Dépenses : ${depensesPeriode} F\n💚 Bénéfice net : ${beneficePeriode - remisesPeriode - depensesPeriode} F\n\n📋 Détail :\n${ventesFiltrees.map(v => `- ${v.items} = ${v.total} F (${labelPaiement(v.paiement)})${(v.remise || 0) > 0 ? ` [Remise ${v.remise} F]` : ''}`).join('\n')}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, '_blank')
  }
  const partagerRapportPeriode = () => { if (!dateDebut || !dateFin) { alert("Choisis une date de début et de fin !"); return } envoyerPeriode(dateDebut, dateFin, "Rapport Période") }
  const rapportRapide = (type: 'jour' | 'semaine' | 'mois') => {
    const auj = new Date(); const toStr = (d: Date) => d.toISOString().split('T')[0]
    if (type === 'jour') envoyerPeriode(toStr(auj), toStr(auj), "Rapport Aujourd'hui")
    if (type === 'semaine') { const debut = new Date(auj); debut.setDate(auj.getDate() - 6); envoyerPeriode(toStr(debut), toStr(auj), "Rapport Cette Semaine") }
    if (type === 'mois') { const debut = new Date(auj.getFullYear(), auj.getMonth(), 1); envoyerPeriode(toStr(debut), toStr(auj), "Rapport Ce Mois") }
  }

  const panierGroupe: Record<string, { nom: string, prix: number, qte: number }> = {}
  panier.forEach(p => { if (!panierGroupe[p.nom]) panierGroupe[p.nom] = { nom: p.nom, prix: p.prix, qte: 0 }; panierGroupe[p.nom].qte++ })

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 500, margin: '0 auto' }}>
      {/* --- BOUTIQUE TEMPS RÉEL --- */}
      {!boutiqueId ? (
        <div style={{ background: '#fff3cd', padding: 12, borderRadius: 10, marginBottom: 12, textAlign: 'center' }}>
         <b>🔗 Mode Multi-Boutiques</b><br />
  <button onClick={creerBoutique} style={{ background: '#000', color: '#fff', padding: '8px 12px', borderRadius: 8, margin: 4 }}>
    Je suis Patron - Créer
  </button>
  <button onClick={rejoindreBoutique} style={{ background: '#fff', border: '1px solid #000', padding: '8px 12px', borderRadius: 8, margin: 4 }}>
    Je suis Gérant - Entrer Code
  </button>
</div>
      ) : (
        <div style={{ background: '#d4edda', padding: 10, borderRadius: 10, marginBottom: 12, textAlign: 'center' }}>
          ✅ Connecté à : <b>{codeBoutique}</b> — Rôle : <b>{role}</b><br />
          <small>Partage ce code à l'autre téléphone</small>
          <div style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', marginTop: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#666' }}>💰 TOTAL DIRECT AUJOURD'HUI (Patron)</div>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#16a34a' }}>
             {ventesPatron.reduce((s: number, v: any) => s + (Number(v?.montant ?? 0) || 0), 0).toLocaleString()} F
            </div>
            <div style={{ fontSize: 13 }}>🧾 {ventesPatron.length} ventes en direct</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              💵 Espèces : {ventesPatron.filter((v: any) => ['especes','espèces','Espèces'].includes(v.mode_paiement)).reduce((s: number, v: any) => s + Number(v.montant ?? 0), 0).toLocaleString()} F •
              🟦 Wave : {ventesPatron.filter((v: any) => v.mode_paiement === 'Wave' || v.mode_paiement === 'wave').reduce((s: number, v: any) => s + Number(v.montant ?? 0), 0).toLocaleString()} F •
              🟧 Orange : {ventesPatron.filter((v: any) => v.mode_paiement === 'Orange Money' || v.mode_paiement === 'Orange' || v.mode_paiement === 'orange').reduce((s: number, v: any) => s + Number(v.montant ?? 0), 0).toLocaleString()} F
            </div>
          </div>

          <div style={{ marginTop: 8, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>🔴 Ventes en direct - {ventesPatron.length} ventes</b>
              <div>
                
                <button onClick={() => {
  if (!afficherVentesDirect) chargerVentesPatron();
  setAfficherVentesDirect(!afficherVentesDirect);
        }} style={{ padding: '4px 10px', borderRadius: 6, background: '#fff', border: '1px solid #000', fontWeight: 'bold' }}>
                  {afficherVentesDirect ? '▲ Cacher' : '👁️ Voir'}
                </button>
              </div>
            </div>

            {afficherVentesDirect && (
              <div style={{ marginTop: 8, maxHeight: 250, overflowY: 'auto' }}>
                {ventesPatron.length === 0 ? (
  <div>Aucune vente pour l'instant</div>
) : (
  ventesPatron.map((v: any) => (
    <div key={v.id} style={{ borderBottom: '1px solid #c3e6cb', padding: '4px 0' }}>• {v.produit_nom} — {(Number(v?.montant ?? 0) || 0)} F — {v.vendeur} — {v.mode_paiement}</div>
  ))
)}
              </div>
            )}
          </div>
        </div>
      )}

      <h1>🧺 {nomAffiche}</h1>

      <div>
        <h1>Mon Gérant</h1>
        
        <div style={{ background: '#f0f9ff', padding: 12, borderRadius: 10, marginBottom: 15, border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>🏪 Mon Maquis : <strong>{nomAffiche}</strong></span>
            <button onClick={() => setAfficherNomBoutique(!afficherNomBoutique)} style={{ padding: '6px 10px', background: 'white', border: '1px solid #38bdf8', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>{afficherNomBoutique ? 'Fermer' : '✏️ Changer'}</button>
          </div>
          {afficherNomBoutique && (
            <div style={{ marginTop: 10 }}>
              <input value={nomBoutique} onChange={e => setNomBoutique(e.target.value)} placeholder="Ex: Chez Tantie Awa, Boutique de Mariam..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <p style={{ fontSize: 12, color: '#666', marginBottom: 0 }}>Ce nom va apparaître sur tous tes reçus et rapports WhatsApp.</p>
            </div>
          )}
        </div>

        <div style={{ background: 'white', padding: 15, borderRadius: 10, marginBottom: 15, border: '2px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>📊 Ma Semaine</h3>
            <button onClick={() => setAfficherGraphique(!afficherGraphique)} style={{ padding: '6px 12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{afficherGraphique ? '🔼 Cacher' : '👀 Voir'}</button>
          </div>
          <p style={{ fontSize: 13, margin: '6px 0 0 0' }}>7 derniers jours : <strong>{total7Jours} F</strong> • Moyenne : <strong>{moyenne7Jours} F / jour</strong></p>
          <p style={{ fontSize: 13, margin: '4px 0 0 0' }}>Aujourd'hui vs hier : <strong style={{ color: evolution >= 0 ? '#16a34a' : '#ef4444' }}>{evolution >= 0 ? `📈 +${evolution}%` : `📉 ${evolution}%`}</strong> {evolution >= 0 ? 'Tu montes ! 💪' : 'Courage, demain sera meilleur 🙏'}</p>
          {afficherGraphique && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                {jours7.map((j, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>{j.total > 0 ? `${Math.round(j.total / 1000)}k` : '0'}</div>
                    <div style={{ height: `${Math.max(5, (j.total / maxJours) * 90)}px`, background: i === jours7.length - 1 ? '#16a34a' : '#a78bfa', borderRadius: '6px 6px 0 0' }}></div>
                    <div style={{ fontSize: 11, marginTop: 4, fontWeight: i === jours7.length - 1 ? 'bold' : 'normal' }}>{j.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 0 }}>🟢 Aujourd'hui • 🟣 Les autres jours</p>
            </div>
          )}
        </div>

        {dettesAnciennes.length > 0 && (
          <div style={{ background: '#fee2e2', padding: 15, borderRadius: 10, marginBottom: 15, border: '2px solid #ef4444' }}>
            <h3 style={{ marginTop: 0, color: '#991b1b' }}>⏰ Dettes Anciennes - +7 jours !</h3>
            <p style={{ fontSize: 13 }}>Ces clientes doivent depuis longtemps. Il faut les relancer aujourd'hui.</p>
            {dettesAnciennes.map((d, i) => (
              <div key={i} style={{ background: 'white', padding: 10, borderRadius: 8, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>{d.client}</strong> - {d.total} F<br /><span style={{ fontSize: 12, color: '#991b1b', fontWeight: 'bold' }}>⏰ Depuis {joursDepuis(d.date)} jours !</span></span>
                <button onClick={() => relancerDette(d)} style={{ padding: '8px 10px', background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>📲 Relancer</button>
              </div>
            ))}
            <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 0 }}>Total bloqué depuis +7 jours : {totalDettesAnciennes} F</p>
          </div>
        )}

        <div style={{ background: objectifNum > 0 && progression >= 100 ? '#dcfce7' : '#fef9c7', padding: 15, borderRadius: 10, marginBottom: 15, border: '2px solid #eab308' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>🎯 Objectif du jour</h3>
            <button onClick={() => setAfficherObjectif(!afficherObjectif)} style={{ padding: '6px 10px', background: 'white', border: '1px solid #eab308', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>{afficherObjectif ? 'Fermer' : '✏️ Fixer'}</button>
          </div>
          {afficherObjectif && (
            <div style={{ marginTop: 10 }}>
              <input type="number" value={objectif} onChange={e => setObjectif(e.target.value)} placeholder="Ex: 50000" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <p style={{ fontSize: 12, color: '#666' }}>Combien tu veux vendre aujourd'hui ? C'est toi qui choisis.</p>
            </div>
          )}
          {objectifNum > 0 ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>{totalJour} F vendus</span><span>Objectif : {objectifNum} F</span></div>
              <div style={{ background: 'white', height: 20, borderRadius: 10, overflow: 'hidden', marginTop: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ width: `${progression}%`, background: progression >= 100 ? '#16a34a' : progression >= 50 ? '#eab308' : '#f97316', height: '100%', transition: 'width 0.3s', textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 'bold', lineHeight: '20px' }}>{progression}%</div>
              </div>
              {progression >= 100 ? (
                <p style={{ fontWeight: 'bold', color: '#16a34a', textAlign: 'center', marginBottom: 0 }}>🎉 Objectif atteint ! Bravo Tantie ! 🎉</p>
              ) : (
                <p style={{ textAlign: 'center', marginBottom: 0, fontSize: 14 }}>Il te reste <strong>{resteObjectif} F</strong> pour atteindre ton objectif 💪</p>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#666', marginBottom: 0 }}>Fixe ton objectif du matin pour te motiver. Ex: 50 000 F</p>
          )}
        </div>

        {produits.length > 0 && (
          <div style={{ background: '#f5f3ff', padding: 12, borderRadius: 10, marginBottom: 15, border: '1px solid #c4b5fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>💰 <strong>Valeur de ma boutique (stock) :</strong><br /><span style={{ fontSize: 12, color: '#666' }}>Si tu vends tout ton stock, tu auras {valeurStockVente} F • Bénéfice futur : {beneficeFuturStock} F</span></span>
            <strong style={{ fontSize: 18, whiteSpace: 'nowrap', marginLeft: 10 }}>{valeurStockVente} F</strong>
          </div>
        )}

        {derniereVente && (
          <div style={{ background: '#dcfce7', padding: 15, borderRadius: 10, marginBottom: 15, border: '2px solid #16a34a' }}>
            <strong>✅ Dernière vente : {derniereVente.items} = {derniereVente.total} F ({labelPaiement(derniereVente.paiement)}){(derniereVente.remise || 0) > 0 ? ` - Remise ${derniereVente.remise} F` : ''}</strong>
            <button onClick={() => envoyerRecu(derniereVente)} style={{ width: '100%', padding: 12, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10, cursor: 'pointer' }}>🧾 Envoyer le reçu à la cliente sur WhatsApp</button>
            <button onClick={() => setDerniereVente(null)} style={{ width: '100%', padding: 8, background: 'white', border: 'none', borderRadius: 8, marginTop: 6, cursor: 'pointer' }}>Fermer</button>
          </div>
        )}

        {alertesStock.length > 0 ? (
          <div style={{ background: '#fee2e2', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #ef4444' }}>
            <h3 style={{ marginTop: 0, color: '#991b1b' }}>🚨 Alerte Stock - À acheter au marché !</h3>
            {ruptures.length > 0 && (
              <div style={{ background: 'white', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                <strong>⛔ EN RUPTURE :</strong>
                {ruptures.map((p, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>{p.nom}</span><strong style={{ color: 'red' }}>Stock 0</strong></div>)}
              </div>
            )}
            {stockBas.length > 0 && (
              <div style={{ background: '#fff7ed', padding: 10, borderRadius: 8 }}>
                <strong>⚠️ BIENTÔT FINI :</strong>
                {stockBas.map((p, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>{p.nom}</span><strong style={{ color: '#ea580c' }}>Il reste {p.stock}</strong></div>)}
              </div>
            )}
            <button onClick={partagerListeCourses} style={{ width: '100%', padding: 12, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10, cursor: 'pointer' }}>🛒 Partager ma liste de courses sur WhatsApp</button>
          </div>
        ) : (
          <div style={{ background: '#dcfce7', padding: 12, borderRadius: 10, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' }}>✅ Tout va bien - Aucun produit en rupture</div>
        )}

        {commandes.length > 0 && (
          <div style={{ background: '#ecfeff', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #22d3ee' }}>
            <h3 style={{ marginTop: 0 }}>📦 Commandes en attente ({commandes.length}) - {totalCommandes} F à venir</h3>
            {commandes.map((c, i) => (
              <div key={i} style={{ background: 'white', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>👩🏾 {c.client}</strong><strong>{c.total} F</strong></div>
                <div style={{ fontSize: 13, color: '#666' }}>{c.items} • Commandé le {new Date(c.date).toLocaleDateString('fr-FR')} à {new Date(c.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button onClick={() => encaisserCommande(i)} style={{ flex: 1, padding: 10, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>✅ Elle est venue - Encaisser</button>
                  <button onClick={() => relancerCommande(c)} style={{ flex: 1, padding: 10, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>📲 Dire que c'est prêt</button>
                  <button onClick={() => annulerCommande(i)} style={{ padding: 10, background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {role !== 'Patron' && (
          <div style={{ background: '#fef3c7', padding: 15, borderRadius: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>💰 Ventes du jour : <strong>{ventes.length}</strong></span>
              <span>Total jour : <strong>{totalJour} F</strong></span>
            </div>
            <div style={{ background: 'white', padding: 10, borderRadius: 8, marginTop: 10 }}>
              <strong>💰 Ma caisse du jour :</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>💵 Espèces (dans la caisse)</span><strong>{totalEspeces} F</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>🟦 Wave (sur le téléphone)</span><strong>{totalWave} F</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>🟧 Orange Money</span><strong>{totalOrange} F</strong></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 16, background: '#dcfce7', padding: 8, borderRadius: 8, textAlign: 'center' }}>
              💚 <strong>Bénéfice brut du jour : {beneficeBrut} F</strong>
            </div>
            {totalRemisesJour > 0 && (
              <div style={{ marginTop: 8, fontSize: 14, background: '#fdf2f8', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                🏷️ <strong>Remises données aujourd'hui : {totalRemisesJour} F</strong>
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: 16, background: '#fee2e2', padding: 8, borderRadius: 8, textAlign: 'center' }}>
              💸 <strong>Dépenses du jour : {totalDepenses} F</strong>
            </div>
            <div style={{ marginTop: 8, fontSize: 18, background: '#16a34a', color: 'white', padding: 10, borderRadius: 8, textAlign: 'center' }}>
              💚 <strong>Bénéfice NET du jour : {beneficeNet} F</strong>
            </div>
            {dettes.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 16, background: '#fee2e2', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                📒 <strong>On te doit : {totalDettes} F</strong> ({dettes.length} personnes)
              </div>
            )}
            {totalDuFournisseurs > 0 && (
              <div style={{ marginTop: 8, fontSize: 16, background: '#fde68a', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                🚚 <strong>Tu dois aux fournisseurs : {totalDuFournisseurs} F</strong>
              </div>
            )}
            {commandes.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 16, background: '#ecfeff', padding: 8, borderRadius: 8, textAlign: 'center' }}>
                📦 <strong>Commandes en attente : {totalCommandes} F</strong> ({commandes.length} commandes)
              </div>
            )}
            <button onClick={partagerWhatsApp} style={{ width: '100%', padding: 12, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, marginTop: 12, cursor: 'pointer', fontWeight: 'bold' }}>📲 Partager sur WhatsApp</button>
            <button onClick={annulerDerniereVente} style={{ width: '100%', padding: 10, background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, marginTop: 8, cursor: 'pointer', fontWeight: 'bold' }}>↩️ Annuler dernière vente</button>
            <button onClick={nouvelleJournee} style={{ width: '100%', padding: 10, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, marginTop: 8, cursor: 'pointer' }}>🗑️ Nouvelle journée - Effacer le jour (TOP gardé)</button>
          </div>
        )}

        <div style={{ background: '#fef3c7', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>🚚 Mes Achats - Fournisseurs</h3>

            <button onClick={() => setAfficherAchats(!afficherAchats)} style={{ padding: '6px 12px', background: '#d97706', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{afficherAchats ? '🔼 Cacher' : '➕ Acheter du stock'}</button>
          </div>
          <p style={{ fontSize: 13, color: '#666' }}>Quand tu achètes au marché, enregistre ici. Le stock augmente tout seul.</p>
          {totalDuFournisseurs > 0 && <p style={{ fontWeight: 'bold', color: '#991b1b' }}>📒 Tu dois encore {totalDuFournisseurs} F à tes fournisseurs</p>}
          {afficherAchats && (
            <div>
              <input value={nomFournisseur} onChange={e => setNomFournisseur(e.target.value)} placeholder="Fournisseur : Ex: Tantie Fatou, Marché d'Adjamé..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
              <input value={produitAchat} onChange={e => setProduitAchat(e.target.value)} placeholder="Produit : Ex: Pâte Maman" list="liste-produits-achat" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
              <datalist id="liste-produits-achat">{produits.map((p, i) => <option key={i} value={p.nom} />)}</datalist>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" value={qteAchat} onChange={e => setQteAchat(e.target.value)} placeholder="Quantité Ex: 20" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
                <input type="number" value={prixAchatFournisseur} onChange={e => setPrixAchatFournisseur(e.target.value)} placeholder="Prix d'achat / unité Ex: 200" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
              </div>
              {qteAchat && prixAchatFournisseur && <p style={{ fontWeight: 'bold', textAlign: 'center' }}>Total à payer : {Number(qteAchat) * Number(prixAchatFournisseur)} F</p>}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button onClick={() => setFournisseurPaye(true)} style={{ flex: 1, padding: 10, background: fournisseurPaye ? '#16a34a' : '#e5e7eb', color: fournisseurPaye ? 'white' : 'black', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>✅ J'ai déjà payé</button>
                <button onClick={() => setFournisseurPaye(false)} style={{ flex: 1, padding: 10, background: !fournisseurPaye ? '#db2777' : '#e5e7eb', color: !fournisseurPaye ? 'white' : 'black', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>📒 Je paierai après</button>
              </div>
              <button onClick={ajouterAchatFournisseur} style={{ width: '100%', padding: 12, background: '#d97706', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>🚚 Enregistrer cet achat + Augmenter mon stock</button>
            </div>
          )}
          {achats.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Historique des achats :</strong>
              {[...achats].reverse().slice(0, 10).map((a, i) => {
                const vraiIndex = achats.length - 1 - i
                return (
                  <div key={i} style={{ background: 'white', padding: 10, borderRadius: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong>{a.qte}x {a.produit}</strong> chez {a.fournisseur}<br />
                      <span style={{ fontSize: 12, color: '#666' }}>{new Date(a.date).toLocaleDateString('fr-FR')} • {a.prixUnitaire} F x {a.qte} = {a.total} F</span><br />
                      {a.paye ? <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 'bold' }}>✅ Payé</span> : <span style={{ fontSize: 12, color: '#be123c', fontWeight: 'bold' }}>📒 Pas encore payé - Tu dois {a.total} F</span>}
                    </span>
                    {!a.paye && <button onClick={() => payerFournisseur(vraiIndex)} style={{ padding: '8px 10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>✅ J'ai payé</button>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ background: '#ecfdf5', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>📦 Inventaire - Compter le vrai stock</h3>
            <button onClick={() => { setAfficherInventaire(!afficherInventaire); if (!afficherInventaire) { const init: Record<number, string> = {}; produits.forEach((p, i) => init[i] = String(p.stock || 0)); setStockInventaire(init) } }} style={{ padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{afficherInventaire ? '🔼 Cacher' : '📦 Faire inventaire'}</button>
          </div>
          <p style={{ fontSize: 13, color: '#666' }}>Le soir, compte ce qui reste vraiment. Corrige si l'app s'est trompée.</p>
          {afficherInventaire && (
            <div style={{ marginTop: 10 }}>
              {produits.length === 0 && <p>Aucun produit à compter.</p>}
              {produits.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 10px', borderRadius: 8, marginBottom: 6 }}>
                  <span><strong>{p.nom}</strong><br /><span style={{ fontSize: 12, color: '#666' }}>Dans l'app : {p.stock}</span></span>
                  <input type="number" value={stockInventaire[i] || ""} onChange={e => setStockInventaire({ ...stockInventaire, [i]: e.target.value })} placeholder="Vrai stock" style={{ width: 90, padding: 8, borderRadius: 8, border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }} />
                </div>
              ))}
              {produits.length > 0 && <button onClick={validerInventaire} style={{ width: '100%', padding: 12, background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', marginTop: 8 }}>✅ Valider mon inventaire</button>}
            </div>
          )}
        </div>

        <div style={{ background: '#fff7ed', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #fb923c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>💸 Dépenses du jour</h3>
            <button onClick={() => setAfficherDepenses(!afficherDepenses)} style={{ padding: '6px 12px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{afficherDepenses ? '🔼 Cacher' : '➕ Ajouter'}</button>
          </div>
          <p style={{ fontSize: 13, color: '#666' }}>Écris toi-même ce que tu as dépensé aujourd'hui.</p>
          {afficherDepenses && (
            <div>
              <input value={nomDepense} onChange={e => setNomDepense(e.target.value)} placeholder="Ex: Transport, Sachets, Loyer..." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
              <input type="number" value={montantDepense} onChange={e => setMontantDepense(e.target.value)} placeholder="Montant ex: 2000" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
              <button onClick={ajouterDepense} style={{ width: '100%', padding: 12, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>💸 Ajouter cette dépense</button>
            </div>
          )}
          {depenses.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {depenses.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '8px 10px', borderRadius: 8, marginBottom: 5 }}>
                  <span>{d.nom}</span>
                  <span><strong>-{d.montant} F</strong> <button onClick={() => setDepenses(depenses.filter((_, j) => j !== i))} style={{ background: '#fee2e2', border: 'none', borderRadius: 5, padding: '2px 8px', marginLeft: 5 }}>❌</button></span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: 8 }}><span>Total dépenses</span><span>{totalDepenses} F</span></div>
              <button onClick={() => { if (confirm("Effacer toutes les dépenses ?")) setDepenses([]) }} style={{ width: '100%', padding: 8, background: '#fee2e2', border: 'none', borderRadius: 8, marginTop: 8, cursor: 'pointer' }}>🗑️ Effacer les dépenses</button>
            </div>
          )}
        </div>

        <div style={{ background: '#fdf2f8', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #f9a8d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>👩🏾‍🤝‍👩🏾 Mes Clientes ({totalClientes})</h3>
            <button onClick={() => setAfficherClientes(!afficherClientes)} style={{ padding: '6px 12px', background: '#db2777', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{afficherClientes ? '🔼 Cacher' : '👀 Voir'}</button>
          </div>
          {meilleureCliente && <p style={{ fontSize: 13, color: '#666', margin: '6px 0 0 0' }}>⭐ Meilleure cliente : <strong>{meilleureCliente.nom}</strong> - {meilleureCliente.totalAchete} F achetés depuis le début</p>}
          {afficherClientes && (
            <div style={{ marginTop: 12 }}>
              <input value={rechercheCliente} onChange={e => setRechercheCliente(e.target.value)} placeholder="🔍 Chercher une cliente... ex: Awa" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 10 }} />
              {clientesFiltrees.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Aucune cliente à crédit pour le moment. Quand tu fais un crédit, la cliente apparaît ici automatiquement.</p>}
              {clientesFiltrees.map((c, i) => (
                <div key={i} style={{ background: 'white', padding: 12, borderRadius: 8, marginBottom: 8, border: c.totalDu > 0 ? '1px solid #fda4af' : '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{i === 0 ? '⭐ ' : ''}{c.nom}</strong>
                    <span style={{ fontSize: 12, color: '#666' }}>{c.nbAchats} achat{c.nbAchats > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>🛒 Total acheté : <strong>{c.totalAchete} F</strong></div>
                  {c.totalDu > 0 ? (
                    <div style={{ fontSize: 13, color: '#be123c', fontWeight: 'bold' }}>📒 Elle te doit encore : {c.totalDu} F</div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 'bold' }}>✅ Elle a tout payé</div>
                  )}
                  <div style={{ fontSize: 12, color: '#666' }}>Dernier achat : {c.dernierAchat ? new Date(c.dernierAchat).toLocaleDateString('fr-FR') : '-'}</div>
                  <button onClick={() => relancerCliente(c)} style={{ width: '100%', padding: 8, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 8, cursor: 'pointer' }}>📲 {c.totalDu > 0 ? 'Relancer pour sa dette' : 'Remercier ma cliente'}</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fefce8', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #facc15' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>🏆 Top Produits - Depuis le début</h3>
            <button onClick={() => setAfficherTop(!afficherTop)} style={{ padding: '6px 12px', background: '#eab308', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{afficherTop ? '🔼 Cacher' : '👀 Voir'}</button>
          </div>
          <p style={{ fontSize: 12, color: '#666', margin: '6px 0 0 0' }}>Ce TOP ne s'efface pas quand tu fais Nouvelle journée.</p>
          {ventesToutTemps.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Fais ta première vente pour voir ton Top !</p>}
          {afficherTop && ventesToutTemps.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ background: 'white', padding: 12, borderRadius: 8, marginBottom: 10 }}>
                <strong>🔥 Les plus vendus (depuis le début)</strong>
                {topVendus.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span>{medailles[i]} {p.nom}</span>
                    <span><strong>{p.qte} vendus</strong> • {p.total} F</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#dcfce7', padding: 12, borderRadius: 8 }}>
                <strong>💚 Les plus rentables (depuis le début)</strong>
                {topRentables.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #bbf7d0' }}>
                    <span>{medailles[i]} {p.nom}</span>
                    <span><strong>+{p.benefice} F</strong> de bénéfice</span>
                  </div>
                ))}
                <p style={{ fontSize: 12, color: '#666', marginBottom: 0 }}>Total vendu depuis le début : {totalVenduToutTemps} F • Bénéfice total : {beneficeToutTemps} F</p>
              </div>
              <button onClick={partagerTop} style={{ width: '100%', padding: 12, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 10, cursor: 'pointer' }}>📲 Partager mon Top sur WhatsApp</button>
              <button onClick={() => { if (confirm("⚠️ Vraiment effacer le TOP de tous les temps ?")) { setVentesToutTemps([]); setVentes([]) } }} style={{ width: '100%', padding: 10, background: '#fee2e2', border: 'none', borderRadius: 8, marginTop: 8, cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Effacer le TOP de tous les temps (Attention !)</button>
            </div>
          )}
        </div>

        <div style={{ background: '#f5f3ff', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #a78bfa' }}>
          <h3 style={{ marginTop: 0 }}>💾 Sauvegarde - Ne jamais tout perdre</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={envoyerSauvegardeWhatsApp} style={{ flex: 1, padding: 12, background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>💾 Sauvegarder sur WhatsApp</button>
            <button onClick={copierSauvegarde} style={{ flex: 1, padding: 12, background: '#e5e7eb', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>📋 Copier le code</button>
          </div>
          <button onClick={() => setAfficherSauvegarde(!afficherSauvegarde)} style={{ width: '100%', padding: 10, background: 'white', border: '1px solid #a78bfa', borderRadius: 8, marginTop: 8, cursor: 'pointer', fontWeight: 'bold' }}>{afficherSauvegarde ? '🔼 Cacher restauration' : '♻️ Restaurer une sauvegarde'}</button>
          {afficherSauvegarde && (
            <div style={{ marginTop: 10 }}>
              <textarea value={codeSauvegarde} onChange={e => setCodeSauvegarde(e.target.value)} placeholder="Colle ton code ici..." rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 5 }} />
              <button onClick={restaurerSauvegarde} style={{ width: '100%', padding: 12, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', marginTop: 8, cursor: 'pointer' }}>♻️ Restaurer maintenant</button>
            </div>
          )}
        </div>

        {dettes.length > 0 && (
          <div style={{ background: '#fff1f2', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #fda4af' }}>
            <h3 style={{ marginTop: 0 }}>📒 Dettes - On te doit de l'argent</h3>
            {dettes.map((d, i) => {
              const origine = d.totalOrigine || d.total
              const deja = d.dejaPaye || 0
              const pct = origine > 0 ? Math.round((deja / origine) * 100) : 0
              const nbJours = joursDepuis(d.date)
              const ancienne = nbJours >= 7
              return (
                <div key={i} style={{ background: 'white', padding: 10, borderRadius: 8, marginBottom: 8, border: ancienne ? '2px solid #ef4444' : '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{d.client}</strong><strong>{d.total} F restants</strong></div>
                  <div style={{ fontSize: 13, color: '#666' }}>{d.items} • {new Date(d.date).toLocaleDateString('fr-FR')} • {nbJours === 0 ? "Aujourd'hui" : `Il y a ${nbJours} jour${nbJours > 1 ? 's' : ''}`}</div>
                  {ancienne && <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 'bold', marginTop: 4 }}>⏰ Dette ancienne ! Depuis {nbJours} jours, relance vite !</div>}
                  {deja > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 'bold' }}>Déjà payé : {deja} F / {origine} F ({pct}%)</div>
                      <div style={{ background: '#fee2e2', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{ width: `${pct}%`, background: '#16a34a', height: '100%' }}></div>
                      </div>
                      <div style={{ fontSize: 12, color: '#be123c', fontWeight: 'bold', marginTop: 2 }}>Il reste : {d.total} F</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => payerDette(i)} style={{ flex: 1, padding: 8, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>✅ A tout payé</button>
                    <button onClick={() => payerDettePartiel(i)} style={{ flex: 1, padding: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>💳 A payé une partie</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button onClick={() => relancerDette(d)} style={{ flex: 1, padding: 8, background: '#25D366', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>📲 Relancer</button>
                    <button onClick={() => annulerDette(i)} style={{ padding: 8, background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ background: '#f0fdf4', padding: 15, borderRadius: 10, marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>📊 Rapport sur Période</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={() => rapportRapide('jour')} style={{ flex: 1, padding: 10, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Aujourd'hui</button>
            <button onClick={() => rapportRapide('semaine')} style={{ flex: 1, padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Cette semaine</button>
            <button onClick={() => rapportRapide('mois')} style={{ flex: 1, padding: 10, background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Ce mois</button>
          </div>
          <label>Du :</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
          <label>Au :</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
          <button onClick={partagerRapportPeriode} style={{ width: '100%', padding: 12, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>📲 Partager Rapport Période</button>
        </div>

        <div style={{ background: '#eff6ff', padding: 15, borderRadius: 10, marginBottom: 20, border: '2px solid #2563eb' }}>
          <h3 style={{ marginTop: 0 }}>➕ Ajouter un produit</h3>
          <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>C'est toi qui crée ta boutique.</p>
          <input value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} placeholder="Nom du produit ex: Pâte Maman" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
          <input type="number" value={nouveauPrix} onChange={e => setNouveauPrix(e.target.value)} placeholder="Prix de vente ex: 250" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
          <input type="number" value={nouvelAchat} onChange={e => setNouvelAchat(e.target.value)} placeholder="Prix d'achat ex: 200" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
          <input placeholder="Stock ex: 20" type="number" value={nouveauStock} onChange={e => setNouveauStock(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
          <button onClick={ajouterProduit} style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>➕ Ajouter à ma boutique</button>
        </div>

        <div style={{ background: 'white', padding: 12, borderRadius: 10, marginBottom: 10, border: '2px solid #16a34a', position: 'sticky', top: 10, zIndex: 10 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>🛒 Mes Produits ({produitsFiltres.length} / {produits.length})</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="🔍 Rechercher un produit..." style={{ flex: 1, padding: 12, fontSize: 16, borderRadius: 10, border: '1px solid #ccc' }} />
            {recherche && <button onClick={() => setRecherche("")} style={{ padding: '0 15px', background: '#fee2e2', border: 'none', borderRadius: 10, fontSize: 18, cursor: 'pointer' }}>❌</button>}
          </div>
        </div>

        {produits.length === 0 && (
          <div style={{ background: '#fef9c7', padding: 20, borderRadius: 10, textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 40 }}>🧺</div>
            <strong>Ta boutique est vide !</strong>
            <p style={{ fontSize: 14, color: '#666' }}>Ajoute ton premier produit juste au-dessus.</p>
          </div>
        )}

        {produitsFiltres.map((p) => {
          const stock = p.stock || 0
          const idx = p.vraiIndex
          const qte = getQuantite(idx)
          const enEdition = editIndex === idx
          return (
            <div key={idx} style={{ background: stock <= 0 ? '#e5e7eb' : stock <= 2 ? '#ffedd5' : '#fff', border: stock <= 2 && stock > 0 ? '2px solid #f97316' : '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10, opacity: stock === 0 ? 0.6 : 1 }}>
              {enEdition ? (
                <div>
                  <strong>✏️ Modifier {p.nom}</strong>
                  <input value={editNom} onChange={e => setEditNom(e.target.value)} placeholder="Nom" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }} />
                  <input type="number" value={editPrix} onChange={e => setEditPrix(e.target.value)} placeholder="Prix de vente" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }} />
                  <input type="number" value={editAchat} onChange={e => setEditAchat(e.target.value)} placeholder="Prix d'achat" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginTop: 8 }} />
                  <div style={{ fontSize: 13, color: '#16a34a', marginTop: 6 }}>💚 Bénéfice par vente : {(Number(editPrix) || 0) - (Number(editAchat) || 0)} F</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={sauverEdit} style={{ flex: 1, padding: 10, background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>✅ Sauvegarder</button>
                    <button onClick={() => setEditIndex(null)} style={{ flex: 1, padding: 10, background: '#e5e7eb', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>{p.nom}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Vente : {p.prix} F • Achat : {p.achat || 0} F • 💚 +{(p.prix - (p.achat || 0))} F</div>
                      <div style={{ fontSize: 12, color: stock === 0 ? 'red' : stock < 3 ? 'orange' : 'green', fontWeight: 'bold' }}>
                        {stock === 0 ? '⛔ RUPTURE' : <>📦 Stock : {stock} {stock <= 2 && stock > 0 ? '⚠️ STOCK BAS' : ''}</>}
                      </div>
                      {(!p.achat) && <div style={{ fontSize: 12, color: 'red', fontWeight: 'bold' }}>⚠️ Prix d'achat manquant ! Clique Modifier</div>}
                    </span>
                    <strong style={{ fontSize: 16 }}>{p.prix} F</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                    <button onClick={() => changerQuantite(idx, -1)} style={{ width: 45, height: 45, fontSize: 22, fontWeight: 'bold', background: '#fee2e2', border: 'none', borderRadius: 10, cursor: 'pointer' }}>−</button>
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', background: '#f8fafc', padding: '8px 0', borderRadius: 10 }}>{qte}</div>
                    <button onClick={() => changerQuantite(idx, 1)} style={{ width: 45, height: 45, fontSize: 22, fontWeight: 'bold', background: '#dcfce7', border: 'none', borderRadius: 10, cursor: 'pointer' }}>+</button>
                    <button onClick={() => ajouterAuPanier(p, idx)} disabled={stock === 0} style={{ flex: 1.5, height: 45, background: stock === 0 ? '#9ca3af' : '#16a34a', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' }}>✅ Ajouter {qte > 1 ? `${qte} x ` : ''}{p.nom.split(' ')[0]}</button>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                    <button onClick={() => modifierStock(idx, 1)} style={{ flex: 1, background: '#dcfce7', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>Stock +</button>
                    <button onClick={() => modifierStock(idx, -1)} style={{ flex: 1, background: '#fef9c3', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>Stock −</button>
                    <button onClick={() => ouvrirEdit(idx)} style={{ flex: 1, background: '#dbeafe', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>✏️ Modifier</button>
                    <button onClick={() => setProduits(produits.filter((_, i) => i !== idx))} style={{ flex: 1, background: '#fee2e2', border: 'none', borderRadius: 8, padding: 6 }}>🗑️</button>
                  </div>
                </>
              )}
            </div>
          )
        })}

        <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 10, marginTop: 20 }}>
          <h2>🧾 Panier ({panier.length})</h2>
          {Object.values(panierGroupe).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{item.qte}x {item.nom}</span>
              <span><strong>{item.qte * item.prix} F</strong> <button onClick={() => setPanier(panier.filter(p => p.nom !== item.nom))} style={{ background: '#fee2e2', border: 'none', borderRadius: 5, padding: '2px 8px', marginLeft: 5 }}>❌</button></span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginTop: 10 }}>
            <span>Sous-total</span><strong>{totalBrut} F</strong>
          </div>

          <div style={{ background: '#fdf2f8', padding: 12, borderRadius: 10, marginTop: 10, border: '1px solid #f9a8d4' }}>
            <strong>🏷️ Remise ? (Optionnel)</strong>
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>Si tu veux faire un petit prix à ta fidèle cliente.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={remise} onChange={e => setRemise(e.target.value)} placeholder="Ex: 500 ou 10" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <button onClick={() => setTypeRemise('montant')} style={{ padding: '0 12px', background: typeRemise === 'montant' ? '#db2777' : '#e5e7eb', color: typeRemise === 'montant' ? 'white' : 'black', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>F CFA</button>
              <button onClick={() => setTypeRemise('pourcent')} style={{ padding: '0 12px', background: typeRemise === 'pourcent' ? '#db2777' : '#e5e7eb', color: typeRemise === 'pourcent' ? 'white' : 'black', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>%</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button onClick={() => { setRemise("500"); setTypeRemise('montant') }} style={{ flex: 1, padding: 6, background: 'white', border: '1px solid #f9a8d4', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>−500 F</button>
              <button onClick={() => { setRemise("1000"); setTypeRemise('montant') }} style={{ flex: 1, padding: 6, background: 'white', border: '1px solid #f9a8d4', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>−1000 F</button>
              <button onClick={() => { setRemise("10"); setTypeRemise('pourcent') }} style={{ flex: 1, padding: 6, background: 'white', border: '1px solid #f9a8d4', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>−10%</button>
              <button onClick={() => setRemise("")} style={{ flex: 1, padding: 6, background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>❌ Pas de remise</button>
            </div>
            {montantRemiseClamp > 0 && <p style={{ color: '#db2777', fontWeight: 'bold', marginBottom: 0 }}>🏷️ Remise : −{montantRemiseClamp} F</p>}
          </div>

          {remiseDangereuse && (
            <div style={{ background: '#fee2e2', padding: 12, borderRadius: 10, marginTop: 10, border: '2px solid #ef4444', textAlign: 'center' }}>
              <strong style={{ color: '#991b1b', fontSize: 16 }}>⛔ STOP ! Tu vas PERDRE {-beneficeApresRemise} F !</strong>
              <p style={{ fontSize: 13, margin: '6px 0 0 0' }}>Tu as acheté pour {coutPanier} F, tu vends à {total} F avec cette remise.<br />Enlève la remise ou mets une plus petite.</p>
            </div>
          )}
          {remiseSansBenefice && (
            <div style={{ background: '#fef9c7', padding: 10, borderRadius: 10, marginTop: 10, border: '1px solid #eab308', textAlign: 'center' }}>
              <strong>⚠️ Attention, tu ne gagnes rien sur cette vente</strong>
              <p style={{ fontSize: 12, margin: '4px 0 0 0' }}>Tu vends au prix d'achat ({total} F). Bénéfice = 0 F.</p>
            </div>
          )}
          {!remiseDangereuse && !remiseSansBenefice && panier.length > 0 && (
            <p style={{ fontSize: 13, color: '#16a34a', textAlign: 'center', marginTop: 8 }}>💚 Avec cette remise, tu gagnes encore <strong>{beneficeApresRemise} F</strong></p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, marginTop: 10 }}>
            <strong>TOTAL À PAYER</strong><strong>{total} F</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 15 }}>
            <button onClick={() => setModePaiement('especes')} style={{ padding: 12, background: modePaiement === 'especes' ? '#16a34a' : '#e5e7eb', color: modePaiement === 'especes' ? 'white' : 'black', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>💵 Espèces</button>
            <button onClick={() => setModePaiement('wave')} style={{ padding: 12, background: modePaiement === 'wave' ? '#2563eb' : '#e5e7eb', color: modePaiement === 'wave' ? 'white' : 'black', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>🟦 Wave</button>
            <button onClick={() => setModePaiement('orange')} style={{ padding: 12, background: modePaiement === 'orange' ? '#f97316' : '#e5e7eb', color: modePaiement === 'orange' ? 'white' : 'black', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>🟧 Orange Money</button>
            <button onClick={() => setModePaiement('credit')} style={{ padding: 12, background: modePaiement === 'credit' ? '#db2777' : '#e5e7eb', color: modePaiement === 'credit' ? 'white' : 'black', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>📒 Crédit</button>
            <button onClick={() => setModePaiement('mixte')} style={{ padding: 12, background: modePaiement === 'mixte' ? '#7c3aed' : '#e5e7eb', color: modePaiement === 'mixte' ? 'white' : 'black', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer', gridColumn: 'span 2' }}>💳 Mixte - Espèces + Wave / Orange</button>
          </div>

          {modePaiement === 'especes' && (
            <>
              <label style={{ display: 'block', marginTop: 15 }}>Client a donné (Espèces) :</label>
              <input type="number" value={montantDonne} onChange={(e) => setMontantDonne(e.target.value)} placeholder="Ex: 10000" style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', marginTop: 5 }} />
              {montantDonne && <p style={{ fontSize: 18 }}>{monnaie >= 0 ? `💰 Monnaie : ${monnaie} F` : `⚠️ Il manque ${-monnaie} F`}</p>}
              <button onClick={encaisser} style={{ width: '100%', padding: 15, background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, fontSize: 18, marginTop: 10 }}>💵 Encaisser Espèces {total} F</button>
            </>
          )}
          {modePaiement === 'wave' && (
            <>
              <p style={{ background: '#dbeafe', padding: 10, borderRadius: 8, marginTop: 15 }}>🟦 La cliente va payer <strong>{total} F par Wave</strong>. Vérifie que tu as reçu le SMS avant de cliquer.</p>
              <button onClick={encaisser} style={{ width: '100%', padding: 15, background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontSize: 18, marginTop: 10 }}>🟦 J'ai reçu Wave - Encaisser {total} F</button>
            </>
          )}
          {modePaiement === 'orange' && (
            <>
              <p style={{ background: '#ffedd5', padding: 10, borderRadius: 8, marginTop: 15 }}>🟧 La cliente va payer <strong>{total} F par Orange Money</strong>. Vérifie que tu as reçu le SMS avant de cliquer.</p>
              <button onClick={encaisser} style={{ width: '100%', padding: 15, background: '#f97316', color: 'white', border: 'none', borderRadius: 10, fontSize: 18, marginTop: 10 }}>🟧 J'ai reçu Orange - Encaisser {total} F</button>
            </>
          )}
          {modePaiement === 'credit' && (
            <>
              <label style={{ display: 'block', marginTop: 15 }}>Nom de la cliente qui doit :</label>
              <input value={nomClient} onChange={e => setNomClient(e.target.value)} placeholder="Ex: Awa, Mariam..." style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #ccc', marginTop: 5 }} />
              <button onClick={encaisser} style={{ width: '100%', padding: 15, background: '#db2777', color: 'white', border: 'none', borderRadius: 10, fontSize: 18, marginTop: 10 }}>📒 Enregistrer Crédit {total} F - {nomClient || '...'}</button>
            </>
          )}
          {modePaiement === 'mixte' && (
            <>
              <div style={{ background: '#f5f3ff', padding: 12, borderRadius: 10, marginTop: 15, border: '1px solid #a78bfa' }}>
                <strong>💳 Paiement Mixte - Total à payer : {total} F</strong>
                <p style={{ fontSize: 12, color: '#666' }}>Tape combien elle paie par chaque moyen. La somme doit faire exactement {total} F.</p>
                <label>💵 Espèces :</label>
                <input type="number" value={mixteEspeces} onChange={e => setMixteEspeces(e.target.value)} placeholder="Ex: 4000" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
                <label>🟦 Wave :</label>
                <input type="number" value={mixteWave} onChange={e => setMixteWave(e.target.value)} placeholder="Ex: 6000" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
                <label>🟧 Orange Money :</label>
                <input type="number" value={mixteOrange} onChange={e => setMixteOrange(e.target.value)} placeholder="Ex: 0" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <button onClick={() => { setMixteEspeces(String(Math.floor(total / 2))); setMixteWave(String(total - Math.floor(total / 2))); setMixteOrange("") }} style={{ flex: 1, padding: 8, background: 'white', border: '1px solid #a78bfa', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Moitié / Moitié</button>
                  <button onClick={() => { setMixteEspeces(""); setMixteWave(""); setMixteOrange("") }} style={{ flex: 1, padding: 8, background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>❌ Effacer</button>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                  Somme : {sommeMixte} F / {total} F
                  {mixteOk ? <div style={{ color: '#16a34a' }}>✅ Parfait ! Tu peux encaisser.</div> : resteMixte > 0 ? <div style={{ color: '#ef4444' }}>⚠️ Il manque {resteMixte} F</div> : <div style={{ color: '#ef4444' }}>⚠️ Il y a {-resteMixte} F en trop</div>}
                </div>
              </div>
              <button onClick={encaisserMixte} disabled={!mixteOk} style={{ width: '100%', padding: 15, background: mixteOk ? '#7c3aed' : '#9ca3af', color: 'white', border: 'none', borderRadius: 10, fontSize: 18, marginTop: 10, cursor: mixteOk ? 'pointer' : 'not-allowed' }}>💳 Encaisser Mixte {total} F</button>
            </>
          )}

          <div style={{ background: '#ecfeff', padding: 12, borderRadius: 10, marginTop: 15, border: '1px solid #22d3ee' }}>
            <strong>📦 Ou mettre en Commande ?</strong>
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>La cliente n'est pas là, elle viendra chercher plus tard.</p>
            <input value={nomCommande} onChange={e => setNomCommande(e.target.value)} placeholder="Nom de la cliente qui commande... Ex: Awa" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }} />
            <button onClick={creerCommande} style={{ width: '100%', padding: 12, background: '#0891b2', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>📦 Mettre en Commande {total} F - {nomCommande || '...'}</button>
          </div>
        </div>

        {
          ventes.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>📋 Historique du jour</h3>
              <p style={{ fontSize: 13, color: '#666' }}>Ça c'est juste aujourd'hui. Le TOP en haut compte depuis le début.</p>
              {ventes.map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 10px', borderRadius: 8, marginBottom: 5 }}>
                  <span>Vente #{i + 1} : {v.items} = {v.total} F • {labelPaiement(v.paiement)}{(v.remise || 0) > 0 ? ` • 🏷️ −${v.remise} F` : ''} {v.date ? `• ${new Date(v.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                  <button onClick={() => envoyerRecu(v)} style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}>🧾 Reçu</button>
                </div>
              ))}
              <button onClick={nouvelleJournee} style={{ background: '#fee2e2', border: 'none', padding: '10px 15px', borderRadius: 8, marginTop: 10 }}>🗑️ Effacer l'historique du jour (TOP gardé)</button>
            </div>
          )
        }
      </div >
    </div >
  )
}
