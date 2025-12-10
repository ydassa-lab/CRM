const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const PDFDocument = require("pdfkit");
const Notification = require("../models/Notification"); // ✔️ AJOUT


// 📌 Create invoice
exports.createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      createdBy: req.user._id,
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.log("Erreur création facture:", error);
    res.status(500).json({ message: "Erreur lors de la création." });
  }
};

// 📌 Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" || req.user.role === "commercial"
        ? {}
        : { createdBy: req.user._id };

    const invoices = await Invoice.find(filter)
      .populate("client", "prenom nom email telephone")
      .populate("createdBy", "prenom nom email");

    res.json(invoices);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur lors du chargement." });
  }
};

// 📌 Get one invoice
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client", "prenom nom email telephone")
      .populate("createdBy", "prenom nom email");

    if (!invoice) return res.status(404).json({ message: "Introuvable" });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne" });
  }
};

// 📌 Update status
exports.updateStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) return res.status(404).json({ message: "Introuvable" });

    invoice.status = req.body.status;
    await invoice.save();

    res.json({ message: "Statut mis à jour", invoice });
  } catch (error) {
    res.status(500).json({ message: "Erreur interne" });
  }
};

// 📌 Add payment
exports.addPayment = async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) return res.status(404).json({ message: "Facture introuvable" });

    // Enregistrer le paiement
    invoice.paymentHistory.push({
      amount: Number(amount),
      method: method || "simulation",
      date: new Date()
    });

    // Vérifier paiement total
    const totalPaid = invoice.paymentHistory.reduce((a, p) => a + p.amount, 0);

    if (totalPaid >= invoice.totalAmount) {
      invoice.status = "paid";
    } else {
      invoice.status = "pending";
    }

    await invoice.save();

    // 🔔 Notification automatique au commercial/admin
    await Notification.create({
      user: req.user._id,
      title: "Paiement enregistré",
      message: `Un paiement de ${amount} Ar a été ajouté à la facture #${invoice._id}`,
      link: `/admin/billing/${invoice._id}`
    });

    res.json({
      message: "Paiement enregistré",
      status: invoice.status,
      invoice
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne ajout paiement" });
  }
};

// 📌 Generate PDF
// controllers/invoice.controller.js

exports.generatePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("client");
    if (!invoice) return res.status(404).json({ message: "Facture introuvable" });

    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 40,
      info: {
        Title: `Facture ${invoice._id}`,
        Author: 'Votre Entreprise',
        Subject: 'Facture'
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=facture-${invoice.invoiceNumber || invoice._id}.pdf`
    );

    // Gestion des erreurs du stream
    doc.on('error', (err) => {
      console.error("Erreur PDF stream:", err);
      if (!res.headersSent) {
        res.status(500).json({ 
          message: "Erreur lors de la génération du PDF.",
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    });

    res.on('error', (err) => {
      console.error("Erreur response stream:", err);
    });

    res.on('finish', () => {
      console.log("PDF envoyé avec succès");
    });

    // Pipe le document vers la réponse
    doc.pipe(res);

    // ------------------------------------------
    // CONFIGURATION DES COULEURS
    // ------------------------------------------
    const colors = {
      primary: "#2C3E50",
      secondary: "#3498DB",
      accent: "#E74C3C",
      lightGray: "#F8F9FA",
      darkGray: "#495057",
      success: "#27AE60"
    };

    // Fonction de conversion nombre -> lettres (version simplifiée)
    const numberToWords = (num) => {
      const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
      const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
      const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
      
      if (num === 0) return 'zéro';
      
      let words = '';
      if (num >= 1000000) {
        words += Math.floor(num / 1000000) + ' million ';
        num %= 1000000;
      }
      
      if (num >= 1000) {
        words += Math.floor(num / 1000) + ' mille ';
        num %= 1000;
      }
      
      if (num >= 100) {
        words += Math.floor(num / 100) + ' cent ';
        num %= 100;
      }
      
      if (num >= 20) {
        words += tens[Math.floor(num / 10)];
        num %= 10;
        if (num > 0) words += '-' + units[num];
      } else if (num >= 10) {
        words += teens[num - 10];
      } else if (num > 0) {
        words += units[num];
      }
      
      return words.trim() + ' Ariary';
    };

    // ------------------------------------------
    // 1️⃣ EN-TÊTE AVEC LOGO ET BANDEAU
    // ------------------------------------------
    // Bandeau supérieur
    doc.rect(0, 0, 595, 120)
       .fill(colors.primary);

    try {
      // Essayez différents chemins de logo
      const logoPaths = [
        "public/logo.jpeg",
        "public/logo.png",
        "uploads/logo.jpeg",
        "uploads/logo.png",
        "./public/logo.jpeg",
        "./public/logo.png"
      ];
      
      let logoLoaded = false;
      for (const path of logoPaths) {
        try {
          doc.image(path, 40, 25, { width: 80 });
          logoLoaded = true;
          console.log("Logo chargé depuis:", path);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!logoLoaded) {
        console.log("Logo introuvable, utilisation du texte");
        doc.fillColor("#FFF")
           .fontSize(24)
           .text("COMPANY", 40, 40);
      }
    } catch (e) {
      console.log("Erreur logo:", e.message);
      doc.fillColor("#FFF")
         .fontSize(24)
         .text("COMPANY", 40, 40);
    }

    // Informations de contact dans le bandeau
    doc.fillColor("white")
       .fontSize(9)
       .text("contact@entreprise.com", 0, 25, { align: "right" })
       .text("+261 34 12 345 67", 0, 40, { align: "right" })
       .text("Lot III - Antananarivo 101", 0, 55, { align: "right" });

    // ------------------------------------------
    // 2️⃣ TITRE DE LA FACTURE
    // ------------------------------------------
    doc.fillColor("white")
       .fontSize(32)
       .font("Helvetica-Bold")
       .text("FACTURE", 40, 80);

    // Badge numéro de facture
    const invoiceNum = invoice.invoiceNumber || invoice._id.toString().substring(18, 24);
    doc.rect(450, 70, 110, 35)
       .fill(colors.accent)
       .fillColor("white")
       .fontSize(16)
       .text(`N° ${invoiceNum}`, 455, 80);

    // ------------------------------------------
    // 3️⃣ INFORMATIONS DE FACTURATION
    // ------------------------------------------
    const infoTop = 150;
    
    // Colonne de gauche - Émetteur
    doc.fillColor(colors.darkGray)
       .fontSize(10)
       .text("ÉMETTEUR", 40, infoTop)
       .fontSize(9)
       .fillColor(colors.primary)
       .font("Helvetica-Bold")
       .text("VOTRE ENTREPRISE SARL", 40, infoTop + 15)
       .font("Helvetica")
       .fillColor("#333")
       .text("Lot III - Adresse Complète")
       .text("Antananarivo 101 - Madagascar")
       .text("NIF: 1234567890")
       .text("Stat: 987654321")
       .text("RCS: Antananarivo A12345");

    // Colonne du milieu - Client
    const clientTop = infoTop;
    doc.fillColor(colors.darkGray)
       .fontSize(10)
       .text("CLIENT", 250, clientTop)
       .fontSize(9)
       .fillColor(colors.primary)
       .font("Helvetica-Bold")
       .text(`${invoice.client.nom} ${invoice.client.prenom}`, 250, clientTop + 15)
       .font("Helvetica")
       .fillColor("#333")
       .text(invoice.client.email)
       .text(invoice.client.telephone || "Non renseigné")
       .text(invoice.client.adresse || "Adresse non spécifiée");

    // Colonne de droite - Détails facture
    const detailsTop = infoTop;
    const detailsLeft = 400;
    
    doc.fillColor(colors.darkGray)
       .fontSize(10)
       .text("DÉTAILS FACTURE", detailsLeft, detailsTop);

    const detailBoxTop = detailsTop + 15;
    doc.rect(detailsLeft, detailBoxTop, 155, 70)
       .fill(colors.lightGray)
       .strokeColor("#DDD")
       .stroke();

    doc.fillColor("#333")
       .fontSize(9)
       .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, detailsLeft + 10, detailBoxTop + 15)
       .text(`Échéance: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'À réception'}`, detailsLeft + 10, detailBoxTop + 30)
       .text(`Statut:`, detailsLeft + 10, detailBoxTop + 45);
    
    // Couleur du statut
    const statusColor = invoice.status === 'paid' ? colors.success : colors.accent;
    doc.fillColor(statusColor)
       .text((invoice.status?.toUpperCase() || 'EN ATTENTE'), detailsLeft + 50, detailBoxTop + 45);

    // ------------------------------------------
    // 4️⃣ TABLEAU DES ARTICLES
    // ------------------------------------------
    const tableTop = 250;
    
    // En-tête du tableau
    doc.rect(40, tableTop, 515, 25)
       .fill(colors.secondary)
       .fillColor("white")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("DESCRIPTION", 50, tableTop + 8)
       .text("QUANTITÉ", 300, tableTop + 8)
       .text("PRIX UNITAIRE", 380, tableTop + 8)
       .text("TOTAL", 480, tableTop + 8);

    // Lignes des articles
    let y = tableTop + 30;
    doc.font("Helvetica");

    invoice.items.forEach((item, i) => {
      // Vérifier si on dépasse la page
      if (y > 700) {
        doc.addPage();
        y = 40;
        
        // Réafficher un en-tête léger
        doc.fillColor(colors.primary)
           .fontSize(12)
           .text(`Suite des articles - Facture N° ${invoiceNum}`, 40, 20);
        
        tableTop = 50;
        y = tableTop + 30;
      }
      
      // Fond alterné
      doc.rect(40, y - 5, 515, 22)
         .fill(i % 2 === 0 ? "#FFF" : colors.lightGray);

      doc.fillColor("#333")
         .fontSize(9)
         .text(item.description, 50, y)
         .text(item.quantity.toString(), 300, y)
         .text(`${item.price.toLocaleString('fr-FR')} Ar`, 380, y)
         .text(`${item.total.toLocaleString('fr-FR')} Ar`, 480, y);

      y += 25;
    });

    // ------------------------------------------
    // 5️⃣ SECTION TOTAUX
    // ------------------------------------------
    const totalsTop = y + 20;
    const totalsLeft = 350;

    // Vérifier si on a assez d'espace pour les totaux
    if (totalsTop > 750) {
      doc.addPage();
      y = 40;
    }

    // Sous-total
    doc.fillColor(colors.darkGray)
       .fontSize(9)
       .text("Sous-total:", totalsLeft, y + 20)
       .text(`${invoice.subTotal?.toLocaleString('fr-FR') || invoice.totalAmount.toLocaleString('fr-FR')} Ar`, 480, y + 20, { align: "right" });

    // TVA (si applicable)
    if (invoice.taxRate > 0) {
      doc.text(`TVA (${invoice.taxRate}%):`, totalsLeft, y + 35)
         .text(`${invoice.taxAmount?.toLocaleString('fr-FR')} Ar`, 480, y + 35, { align: "right" });
    }

    // Remise (si applicable)
    if (invoice.discount > 0) {
      doc.text(`Remise:`, totalsLeft, y + 50)
         .text(`-${invoice.discount.toLocaleString('fr-FR')} Ar`, 480, y + 50, { align: "right" });
    }

    // Ligne séparatrice
    doc.moveTo(totalsLeft, y + 65)
       .lineTo(535, y + 65)
       .strokeColor("#DDD")
       .stroke();

    // Total final
    doc.fillColor(colors.primary)
       .fontSize(12)
       .font("Helvetica-Bold")
       .text("TOTAL À PAYER:", totalsLeft, y + 80)
       .text(`${invoice.totalAmount.toLocaleString('fr-FR')} Ar`, 480, y + 80, { align: "right" });

    // En toutes lettres
    doc.fillColor("#666")
       .fontSize(8)
       .font("Helvetica")
       .text(`Arrêtée à la somme de: ${numberToWords(invoice.totalAmount)}`, 40, y + 105);

    // ------------------------------------------
    // 6️⃣ INFORMATIONS DE PAIEMENT
    // ------------------------------------------
    const paymentTop = y + 130;
    
    // Vérifier l'espace pour la section paiement
    if (paymentTop > 750) {
      doc.addPage();
      y = 40;
    }

    doc.rect(40, paymentTop, 515, 60)
       .fill("#F0F8FF")
       .strokeColor("#BBDEFB")
       .stroke();

    doc.fillColor(colors.secondary)
       .fontSize(10)
       .font("Helvetica-Bold")
       .text("MODALITÉS DE PAIEMENT", 50, paymentTop + 10);

    doc.fillColor("#333")
       .fontSize(9)
       .text("Banque: BOA Madagascar", 50, paymentTop + 25)
       .text("IBAN: MG46 0000 1234 5678 9012 3456 789", 50, paymentTop + 37)
       .text("Code Swift: BOAAMGMGXXX", 50, paymentTop + 49)
       .text("Compte: 12345678901", 250, paymentTop + 25)
       .text("Bénéficiaire: VOTRE ENTREPRISE SARL", 250, paymentTop + 37);

    // ------------------------------------------
    // 7️⃣ PIED DE PAGE
    // ------------------------------------------
    let footerTop = doc.y + 30;
    if (footerTop > 780) {
      doc.addPage();
      footerTop = 750;
    }
    
    doc.moveTo(40, footerTop)
       .lineTo(555, footerTop)
       .strokeColor("#EEE")
       .stroke();

    doc.fillColor("#777")
       .fontSize(8)
       .text("VOTRE ENTREPRISE SARL • Capital social: 10.000.000 Ar • NIF: 1234567890 • Stat: 987654321", 40, footerTop + 10, {
         align: "center"
       })
       .text("Adresse: Lot III, Antananarivo 101 • Tél: +261 34 12 345 67 • Email: contact@entreprise.com", 40, footerTop + 22, {
         align: "center"
       })
       .text("Facture générée électroniquement • Valide sans signature ni cachet", 40, footerTop + 34, {
         align: "center"
       })
       .fillColor(colors.success);

    // Numéro de page
    const pageNumber = doc.bufferedPageRange().count || 1;
    doc.text(`Page ${pageNumber}/${pageNumber}`, 0, 800, { align: "right" });

    // Terminer le document de manière asynchrone
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
      doc.end();
    });

  } catch (error) {
    console.error("Erreur génération PDF:", error);
    
    // Vérifier si les headers ont déjà été envoyés
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Erreur lors de la génération du PDF.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Fonction utilitaire pour convertir les nombres en lettres
function numberToWords(num) {
  // Implémentez une fonction de conversion nombre->lettres
  // Ou utilisez une bibliothèque comme 'number-to-words'
  return `**${num.toLocaleString('fr-FR')}**`;
}

const ExcelJS = require("exceljs");

exports.exportExcel = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client");

    if (!invoice) return res.status(404).json({ message: "Introuvable" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Facture");

    sheet.columns = [
      { header: "Description", key: "description", width: 30 },
      { header: "Quantité", key: "quantity", width: 15 },
      { header: "Prix", key: "price", width: 15 },
      { header: "Total", key: "total", width: 15 },
    ];

    invoice.items.forEach((i) => {
      sheet.addRow(i);
    });

    sheet.addRow({});
    sheet.addRow({ description: "TOTAL", total: invoice.totalAmount });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=facture_${invoice._id}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { Parser } = require("json2csv");

exports.exportCSV = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) return res.status(404).json({ message: "Introuvable" });

    const fields = ["description", "quantity", "price", "total"];
    const parser = new Parser({ fields });

    const csv = parser.parse(invoice.items);

    res.header("Content-Type", "text/csv");
    res.attachment(`facture_${invoice._id}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("client");

    // Résumés
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const paidAmount = invoices.filter(i => i.status === "paid")
                               .reduce((s, i) => s + i.totalAmount, 0);
    const pendingAmount = invoices.filter(i => i.status === "pending")
                                  .reduce((s, i) => s + i.totalAmount, 0);
    const cancelledAmount = invoices.filter(i => i.status === "cancelled")
                                    .reduce((s, i) => s + i.totalAmount, 0);

    // Paiements mensuels (12 derniers mois)
    const monthlyPayments = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("fr-FR", { month: "short" }),
      amount: 0
    }));

    invoices.forEach(inv => {
      if (inv.status === "paid") {
        const m = new Date(inv.updatedAt).getMonth();
        monthlyPayments[m].amount += inv.totalAmount;
      }
    });

    // Derniers paiements
    const lastPayments = invoices
      .flatMap(inv =>
        inv.paymentHistory.map(p => ({
          date: p.date,
          amount: p.amount,
          client: inv.client?.prenom + " " + inv.client?.nom
        }))
      )
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    // Top clients revenus
    const clientTotals = {};
    invoices.forEach(inv => {
      if (!inv.client) return;

      const name = `${inv.client.prenom} ${inv.client.nom}`;
      clientTotals[name] = (clientTotals[name] || 0) + inv.totalAmount;
    });

    const topClients = Object.entries(clientTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      cancelledAmount,
      monthlyPayments,
      lastPayments,
      topClients
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement stats" });
  }
};
