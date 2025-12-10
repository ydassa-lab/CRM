// crm-backend/controllers/ticket.controller.js

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { sendEmail } = require("../services/email");
const Notification = require("../models/Notification");

const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");


// LISTE DES TICKETS
exports.list = async (req, res) => {
  try {
    const q = {};

    if (req.query.status) q.status = req.query.status;

    // Un client ne voit que ses propres tickets
    if (req.user.role === "client") {
      q.createdBy = req.user._id;
    }

    const tickets = await Ticket.find(q)
      .populate("createdBy", "prenom nom email role")
      .populate("assignedTo", "prenom nom email role")
      .sort({ createdAt: -1 });

    res.json(tickets);

  } catch (err) {
    console.error("ERROR list:", err);
    res.status(500).json({ message: err.message });
  }
};


// CRÉER UN TICKET
exports.create = async (req, res) => {
  try {
    const supportAgent = await User.findOne({ role: "support" });

    const ticket = await Ticket.create({
      title: req.body.title,
      message: req.body.message,
      priority: req.body.priority || "Normal",
      attachment: req.file ? req.file.filename : null,
      createdBy: req.user._id,
      assignedTo: supportAgent ? supportAgent._id : null
    });

    // 🔔 Envoi e-mail au support
    if (supportAgent) {
      await sendEmail(
        supportAgent.email,
        `🆕 Nouveau ticket #${ticket._id}`,
        `
          <h2>Nouveau ticket reçu</h2>
          <p><strong>Titre :</strong> ${ticket.title}</p>
          <p><strong>Message :</strong> ${ticket.message}</p>
          <p><strong>Priorité :</strong> ${ticket.priority}</p>
          <a href="http://localhost:5173/support/tickets/${ticket._id}">
            Ouvrir le ticket
          </a>
        `
      );
      await Notification.create({
        user: supportAgent._id,
        title: "Nouveau ticket",
        message: `Un nouveau ticket a été créé : ${ticket.title}`,
        link: `/support/tickets/${ticket._id}`,
      });
    }

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// RÉPONDRE À UN TICKET
exports.reply = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("createdBy");

    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    ticket.responses.push({
      message: req.body.message,
      postedBy: req.user._id
    });

    if (req.user.role !== "client") {
      ticket.status = "En cours";

      // 🔔 Email au client
      await sendEmail(
        ticket.createdBy.email,
        `Votre ticket #${ticket._id} a une nouvelle réponse`,
        `
          <h2>Réponse du support</h2>
          <p>${req.body.message}</p>
          <a href="http://localhost:5173/client/tickets/${ticket._id}">
            Voir le ticket
          </a>
        `
      );
      await Notification.create({
        user: ticket.createdBy._id,
        title: "Nouvelle réponse à votre ticket",
        message: req.body.message,
        link: `/client/tickets/${ticket._id}`,
      });
    }

    await ticket.save();

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// CHANGER LE STATUT
exports.updateStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(ticket);

  } catch (err) {
    console.error("ERROR status:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "prenom nom email role")
      .populate("assignedTo", "prenom nom email role")
      .populate("responses.postedBy", "prenom nom email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket introuvable" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.exportPDF = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "prenom nom email")
      .populate("assignedTo", "prenom nom email")
      .populate("responses.postedBy", "prenom nom email");

    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 40,
      info: {
        Title: `Ticket ${ticket._id}`,
        Author: 'Système de Support',
        Subject: 'Fiche de ticket support'
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=ticket_${ticket._id}.pdf`
    );

    doc.pipe(res);

    // ------------------------------------------
    // PALETTE DE COULEURS ADAPTÉE AUX STATUTS
    // ------------------------------------------
    const colors = {
      primary: "#2C3E50",
      secondary: "#3498DB",
      ouvert: "#27AE60",       // Vert
      encours: "#F39C12",      // Orange
      resolu: "#3498DB",       // Bleu
      ferme: "#95A5A6",        // Gris
      faible: "#2ECC71",       // Vert clair
      normal: "#3498DB",       // Bleu
      urgent: "#E74C3C",       // Rouge
      background: "#F8F9FA"
    };

    // Fonction pour obtenir la couleur selon le statut
    const getStatusColor = (status) => {
      const colorMap = {
        'Ouvert': colors.ouvert,
        'En cours': colors.encours,
        'Résolu': colors.resolu,
        'Fermé': colors.ferme
      };
      return colorMap[status] || colors.primary;
    };

    // Fonction pour obtenir la couleur selon la priorité
    const getPriorityColor = (priority) => {
      const colorMap = {
        'Faible': colors.faible,
        'Normal': colors.normal,
        'Urgent': colors.urgent
      };
      return colorMap[priority] || colors.normal;
    };

    // ------------------------------------------
    // 1️⃣ EN-TÊTE PROFESSIONNEL
    // ------------------------------------------
    // Bandeau supérieur
    doc.rect(0, 0, 595, 100)
       .fill(colors.primary);

    try {
      // Essayez différents chemins de logo
      const logoPaths = [
        "public/logo.png",
        "public/logo-support.png",
        "uploads/logo.png"
      ];
      
      let logoLoaded = false;
      for (const path of logoPaths) {
        try {
          doc.image(path, 40, 20, { width: 60 });
          logoLoaded = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!logoLoaded) {
        doc.fillColor("#FFF")
           .fontSize(20)
           .font("Helvetica-Bold")
           .text("SUPPORT", 40, 30);
      }
    } catch (e) {
      doc.fillColor("#FFF")
         .fontSize(20)
         .font("Helvetica-Bold")
         .text("SUPPORT", 40, 30);
    }

    // Informations de contact
    doc.fillColor("white")
       .fontSize(10)
       .text("support@entreprise.mg", 0, 25, { align: "right" })
       .text("+261 34 12 345 67", 0, 40, { align: "right" })
       .text("Service Support Technique", 0, 55, { align: "right" });

    // Titre principal
    doc.fillColor("white")
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("FICHE DE TICKET", 40, 60);

    // Badge ID ticket
    doc.rect(450, 50, 110, 35)
       .fill(getStatusColor(ticket.status))
       .fillColor("white")
       .fontSize(14)
       .font("Helvetica-Bold")
       .text(`#${ticket._id.toString().substring(18, 24)}`, 455, 60);

    // ------------------------------------------
    // 2️⃣ INFORMATIONS PRINCIPALES DU TICKET
    // ------------------------------------------
    const infoTop = 120;
    
    // Carte d'information
    doc.rect(40, infoTop, 515, 90)
       .fill(colors.background)
       .strokeColor("#DDD")
       .stroke();

    // Titre du ticket
    doc.fillColor(colors.primary)
       .fontSize(18)
       .font("Helvetica-Bold")
       .text(ticket.title, 50, infoTop + 15, { width: 495 });

    // Badges statut et priorité
    const badgesTop = infoTop + 45;
    
    // Badge Statut
    doc.rect(50, badgesTop, 80, 22)
       .fill(getStatusColor(ticket.status))
       .fillColor("white")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text(ticket.status.toUpperCase(), 55, badgesTop + 5);

    // Badge Priorité
    doc.rect(140, badgesTop, 80, 22)
       .fill(getPriorityColor(ticket.priority))
       .fillColor("white")
       .fontSize(10)
       .font("Helvetica-Bold")
       .text(ticket.priority.toUpperCase(), 145, badgesTop + 5);

    // Dates
    const dateTop = infoTop + 70;
    const createdAt = new Date(ticket.createdAt);
    const updatedAt = new Date(ticket.updatedAt);
    
    doc.fillColor("#666")
       .fontSize(9)
       .text(`Créé le: ${createdAt.toLocaleDateString('fr-FR')} à ${createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 250, dateTop)
       .text(`Mis à jour: ${updatedAt.toLocaleDateString('fr-FR')} à ${updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 250, dateTop + 12);

    // ------------------------------------------
    // 3️⃣ INTERVENANTS
    // ------------------------------------------
    const peopleTop = 230;
    
    // Titre section
    doc.fillColor(colors.primary)
       .fontSize(14)
       .font("Helvetica-Bold")
       .text("INTERVENANTS", 40, peopleTop);

    // Demandeur
    doc.rect(40, peopleTop + 15, 250, 70)
       .fill("#F0F7FF")
       .strokeColor("#D1E3FF")
       .stroke();

    doc.fillColor(colors.primary)
       .fontSize(11)
       .font("Helvetica-Bold")
       .text("DEMANDEUR", 50, peopleTop + 30);

    doc.fillColor("#333")
       .fontSize(10)
       .text(`${ticket.createdBy.prenom} ${ticket.createdBy.nom}`, 50, peopleTop + 45)
       .fontSize(9)
       .text(`Email: ${ticket.createdBy.email}`, 50, peopleTop + 58);

    // Technicien assigné
    doc.rect(310, peopleTop + 15, 245, 70)
       .fill(ticket.assignedTo ? "#F0FFF0" : "#FFF5F5")
       .strokeColor(ticket.assignedTo ? "#D1FFD1" : "#FFD1D1")
       .stroke();

    doc.fillColor(colors.primary)
       .fontSize(11)
       .font("Helvetica-Bold")
       .text("TECHNICIEN", 320, peopleTop + 30);

    if (ticket.assignedTo) {
      doc.fillColor("#333")
         .fontSize(10)
         .text(`${ticket.assignedTo.prenom} ${ticket.assignedTo.nom}`, 320, peopleTop + 45)
         .fontSize(9)
         .text(`Email: ${ticket.assignedTo.email}`, 320, peopleTop + 58);
    } else {
      doc.fillColor(colors.urgent)
         .fontSize(10)
         .text("NON ASSIGNÉ", 320, peopleTop + 45);
    }

    // ------------------------------------------
    // 4️⃣ DESCRIPTION DU PROBLÈME
    // ------------------------------------------
    const descTop = 320;
    
    doc.fillColor(colors.primary)
       .fontSize(14)
       .font("Helvetica-Bold")
       .text("DESCRIPTION DU PROBLÈME", 40, descTop);

    doc.rect(40, descTop + 10, 515, 120)
       .fill("#FFF")
       .strokeColor("#EEE")
       .stroke();

    // Message avec formatage
    doc.fillColor("#333")
       .fontSize(10)
       .text(ticket.message, 50, descTop + 20, {
         width: 495,
         lineGap: 5,
         align: "left"
       });

    // Indicateur de pièce jointe
    if (ticket.attachment) {
      const attachmentTop = descTop + 125;
      doc.fillColor(colors.secondary)
         .fontSize(9)
         .font("Helvetica-Bold")
         .text("📎 Pièce jointe associée:", 50, attachmentTop)
         .fillColor("#666")
         .fontSize(9)
         .font("Helvetica")
         .text(ticket.attachment.split('/').pop(), 180, attachmentTop);
    }

    // ------------------------------------------
    // 5️⃣ HISTORIQUE DES ÉCHANGES
    // ------------------------------------------
    const responsesTop = descTop + 150;

    doc.fillColor(colors.primary)
       .fontSize(14)
       .font("Helvetica-Bold")
       .text(`HISTORIQUE DES ÉCHANGES (${ticket.responses.length})`, 40, responsesTop);

    if (ticket.responses.length === 0) {
      doc.rect(40, responsesTop + 15, 515, 60)
         .fill("#FFF8E1")
         .strokeColor("#FFECB3")
         .stroke()
         .fillColor("#FF9800")
         .fontSize(11)
         .text("Aucun échange pour le moment.", 220, responsesTop + 40);
    } else {
      let y = responsesTop + 20;
      const maxHeight = 750; // Hauteur maximale avant bas de page
      
      ticket.responses.forEach((response, index) => {
        // Vérifier si on dépasse la page
        if (y + 100 > maxHeight) {
          doc.addPage();
          y = 40;
          
          // Réafficher l'en-tête léger sur les pages suivantes
          doc.fillColor(colors.primary)
             .fontSize(12)
             .font("Helvetica-Bold")
             .text(`Suite des échanges - Ticket #${ticket._id.toString().substring(18, 24)}`, 40, 20);
        }
        
        // Vérifier si c'est le créateur ou un autre utilisateur
        const isCreator = response.postedBy && 
                         response.postedBy._id.toString() === ticket.createdBy._id.toString();
        
        // Carte de réponse
        doc.rect(40, y, 515, 90)
           .fill(isCreator ? "#F0F7FF" : "#F0FFF0")
           .strokeColor(isCreator ? "#D1E3FF" : "#D1FFD1")
           .stroke();

        // En-tête de la réponse
        const responseDate = new Date(response.createdAt);
        const posterName = response.postedBy ? 
                          `${response.postedBy.prenom} ${response.postedBy.nom}` : 
                          "Utilisateur";
        
        doc.fillColor(isCreator ? colors.secondary : colors.ouvert)
           .fontSize(10)
           .font("Helvetica-Bold")
           .text(isCreator ? "👤 DEMANDEUR" : "🔧 RÉPONSE", 50, y + 10);

        doc.fillColor("#666")
           .fontSize(8)
           .text(`${posterName} • ${responseDate.toLocaleDateString('fr-FR')} ${responseDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 50, y + 23);

        // Message (tronqué si trop long)
        const message = response.message;
        const maxChars = 400;
        let displayMessage = message;
        
        if (message.length > maxChars) {
          displayMessage = message.substring(0, maxChars) + '... [suite]';
        }
        
        doc.fillColor("#333")
           .fontSize(9)
           .text(displayMessage, 50, y + 35, {
             width: 495,
             lineGap: 3
           });

        // Indicateur de pièce jointe sur réponse
        if (response.attachment) {
          doc.fillColor("#666")
             .fontSize(8)
             .text(`📎 ${response.attachment.split('/').pop()}`, 50, y + 70);
        }

        // Numéro de réponse
        doc.fillColor("#999")
           .fontSize(8)
           .text(`#${index + 1}`, 530, y + 10, { align: "right" });

        y += 100;
      });
    }

    // ------------------------------------------
    // 6️⃣ PIED DE PAGE
    // ------------------------------------------
    let footerTop = doc.y + 30;
    
    // S'assurer que le pied de page n'est pas trop haut
    if (footerTop < 750) {
      footerTop = 750;
    }

    // Ligne de séparation
    doc.moveTo(40, footerTop)
       .lineTo(555, footerTop)
       .strokeColor("#EEE")
       .stroke();

    // Informations de génération
    doc.fillColor("#777")
       .fontSize(8)
       .text(`ID Complet: ${ticket._id}`, 40, footerTop + 10)
       .text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 0, footerTop + 10, { align: "right" });

    // Message de confidentialité
    doc.fillColor("#666")
       .fontSize(9)
       .text("Ce document est confidentiel et destiné uniquement aux parties concernées.", 40, footerTop + 25, {
         align: "center"
       });

    // Numéro de page
    const pageNumber = doc.bufferedPageRange().count || 1;
    doc.text(`Page ${pageNumber}/${pageNumber}`, 0, 800, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("Erreur génération PDF ticket:", err);
    res.status(500).json({ 
      message: "Erreur lors de la génération du PDF du ticket.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const fields = ["_id", "title", "priority", "status", "createdAt"];
    const json2csv = new Parser({ fields });

    const csv = json2csv.parse(ticket.toObject());

    res.header("Content-Type", "text/csv");
    res.attachment(`ticket_${ticket._id}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "prenom nom email")
      .populate("assignedTo", "prenom nom email")
      .populate("responses.postedBy", "prenom nom email");

    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Système de Support";
    workbook.lastModifiedBy = "Système de Support";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.date1904 = true;

    // ------------------------------------------
    // 1️⃣ FEUILLE PRINCIPALE - DÉTAILS DU TICKET
    // ------------------------------------------
    const sheet = workbook.addWorksheet("Détails du Ticket", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'portrait',
        margins: {
          left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
          header: 0.3, footer: 0.3
        }
      },
      views: [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ]
    });

    // ------------------------------------------
    // EN-TÊTE AVEC TITRE ET LOGO
    // ------------------------------------------
    // Titre principal
    sheet.mergeCells('A1:F1');
    const titleRow = sheet.getCell('A1');
    titleRow.value = "FICHE DE TICKET DE SUPPORT";
    titleRow.font = { 
      name: 'Arial', 
      size: 16, 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' }
    };
    titleRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    titleRow.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    sheet.getRow(1).height = 30;

    // Numéro du ticket
    sheet.mergeCells('A2:F2');
    const ticketNumberRow = sheet.getCell('A2');
    ticketNumberRow.value = `Ticket N°: ${ticket._id}`;
    ticketNumberRow.font = { 
      name: 'Arial', 
      size: 12, 
      bold: true, 
      color: { argb: 'FF2C3E50' }
    };
    ticketNumberRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    sheet.getRow(2).height = 25;

    // Espacement
    sheet.getRow(3).height = 15;

    // ------------------------------------------
    // INFORMATIONS PRINCIPALES
    // ------------------------------------------
    // Section titre
    sheet.mergeCells('A4:F4');
    const sectionTitle = sheet.getCell('A4');
    sectionTitle.value = "INFORMATIONS DU TICKET";
    sectionTitle.font = { 
      name: 'Arial', 
      size: 14, 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    sectionTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3498DB' }
    };
    sectionTitle.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    sheet.getRow(4).height = 25;

    // Fonction pour ajouter des données
    const addDataRow = (rowNum, label, value, valueColor = 'FF000000') => {
      sheet.mergeCells(`A${rowNum}:C${rowNum}`);
      sheet.mergeCells(`D${rowNum}:F${rowNum}`);
      
      const labelCell = sheet.getCell(`A${rowNum}`);
      labelCell.value = label;
      labelCell.font = { 
        name: 'Arial', 
        size: 11, 
        bold: true,
        color: { argb: 'FF2C3E50' }
      };
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8F9FA' }
      };
      labelCell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
      
      const valueCell = sheet.getCell(`D${rowNum}`);
      valueCell.value = value;
      valueCell.font = { 
        name: 'Arial', 
        size: 11,
        color: { argb: valueColor }
      };
      valueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }
      };
      valueCell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
      
      sheet.getRow(rowNum).height = 25;
    };

    // Fonction pour obtenir la couleur selon le statut
    const getStatusColor = (status) => {
      const colorMap = {
        'Ouvert': 'FF27AE60',       // Vert
        'En cours': 'FFF39C12',     // Orange
        'Résolu': 'FF3498DB',       // Bleu
        'Fermé': 'FF95A5A6'         // Gris
      };
      return colorMap[status] || 'FF000000';
    };

    // Fonction pour obtenir la couleur selon la priorité
    const getPriorityColor = (priority) => {
      const colorMap = {
        'Faible': 'FF2ECC71',       // Vert clair
        'Normal': 'FF3498DB',       // Bleu
        'Urgent': 'FFE74C3C'        // Rouge
      };
      return colorMap[priority] || 'FF000000';
    };

    // Informations principales
    let currentRow = 5;
    
    addDataRow(currentRow++, "Titre", ticket.title);
    addDataRow(currentRow++, "Statut", ticket.status, getStatusColor(ticket.status));
    addDataRow(currentRow++, "Priorité", ticket.priority, getPriorityColor(ticket.priority));
    
    const createdAt = new Date(ticket.createdAt);
    const updatedAt = new Date(ticket.updatedAt);
    addDataRow(currentRow++, "Date de création", 
      `${createdAt.toLocaleDateString('fr-FR')} ${createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
    addDataRow(currentRow++, "Dernière mise à jour", 
      `${updatedAt.toLocaleDateString('fr-FR')} ${updatedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);

    // Espacement
    sheet.getRow(currentRow++).height = 15;

    // ------------------------------------------
    // INFORMATIONS DES INTERVENANTS
    // ------------------------------------------
    // Section intervenants
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const intervenantsTitle = sheet.getCell(`A${currentRow}`);
    intervenantsTitle.value = "INTERVENANTS";
    intervenantsTitle.font = { 
      name: 'Arial', 
      size: 14, 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    intervenantsTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3498DB' }
    };
    intervenantsTitle.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // Créateur
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.mergeCells(`D${currentRow}:F${currentRow}`);
    
    const createurLabel = sheet.getCell(`A${currentRow}`);
    createurLabel.value = "DEMANDEUR";
    createurLabel.font = { 
      name: 'Arial', 
      size: 11, 
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    createurLabel.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' }
    };
    createurLabel.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    
    const createurValue = sheet.getCell(`D${currentRow}`);
    createurValue.value = `${ticket.createdBy.prenom} ${ticket.createdBy.nom}\n${ticket.createdBy.email}`;
    createurValue.font = { 
      name: 'Arial', 
      size: 11,
      color: { argb: 'FF2C3E50' }
    };
    createurValue.alignment = { 
      vertical: 'middle', 
      horizontal: 'center',
      wrapText: true 
    };
    createurValue.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F7FF' }
    };
    
    // Bordures
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
      sheet.getCell(`${col}${currentRow}`).border = {
        top: { style: 'thin', color: { argb: 'FF2C3E50' } },
        left: { style: 'thin', color: { argb: 'FF2C3E50' } },
        bottom: { style: 'thin', color: { argb: 'FF2C3E50' } },
        right: { style: 'thin', color: { argb: 'FF2C3E50' } }
      };
    });
    
    sheet.getRow(currentRow).height = 40;
    currentRow++;

    // Assigné
    sheet.mergeCells(`A${currentRow}:C${currentRow}`);
    sheet.mergeCells(`D${currentRow}:F${currentRow}`);
    
    const assigneLabel = sheet.getCell(`A${currentRow}`);
    assigneLabel.value = "TECHNICIEN ASSIGNÉ";
    assigneLabel.font = { 
      name: 'Arial', 
      size: 11, 
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    assigneLabel.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: ticket.assignedTo ? 'FF2C3E50' : 'FFE74C3C' }
    };
    assigneLabel.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    
    const assigneValue = sheet.getCell(`D${currentRow}`);
    if (ticket.assignedTo) {
      assigneValue.value = `${ticket.assignedTo.prenom} ${ticket.assignedTo.nom}\n${ticket.assignedTo.email}`;
      assigneValue.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0FFF0' }
      };
    } else {
      assigneValue.value = "NON ASSIGNÉ";
      assigneValue.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF5F5' }
      };
    }
    assigneValue.font = { 
      name: 'Arial', 
      size: 11,
      color: { argb: 'FF2C3E50' }
    };
    assigneValue.alignment = { 
      vertical: 'middle', 
      horizontal: 'center',
      wrapText: true 
    };
    
    // Bordures
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
      sheet.getCell(`${col}${currentRow}`).border = {
        top: { style: 'thin', color: { argb: 'FF2C3E50' } },
        left: { style: 'thin', color: { argb: 'FF2C3E50' } },
        bottom: { style: 'thin', color: { argb: 'FF2C3E50' } },
        right: { style: 'thin', color: { argb: 'FF2C3E50' } }
      };
    });
    
    sheet.getRow(currentRow).height = 40;
    currentRow++;

    // Espacement
    sheet.getRow(currentRow++).height = 15;

    // ------------------------------------------
    // DESCRIPTION DU MESSAGE
    // ------------------------------------------
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const messageTitle = sheet.getCell(`A${currentRow}`);
    messageTitle.value = "DESCRIPTION DU PROBLÈME";
    messageTitle.font = { 
      name: 'Arial', 
      size: 14, 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    messageTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3498DB' }
    };
    messageTitle.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // Message
    sheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const messageCell = sheet.getCell(`A${currentRow}`);
    messageCell.value = ticket.message;
    messageCell.font = { 
      name: 'Arial', 
      size: 11,
      color: { argb: 'FF333333' }
    };
    messageCell.alignment = { 
      vertical: 'top', 
      horizontal: 'left',
      wrapText: true 
    };
    messageCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFFFF' }
    };
    messageCell.border = {
      top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
    };
    
    // Ajuster la hauteur de la ligne en fonction du message
    const messageLines = Math.ceil(ticket.message.length / 100) + 1;
    sheet.getRow(currentRow).height = Math.min(messageLines * 15, 150);
    currentRow++;

    // Pièce jointe si présente
    if (ticket.attachment) {
      sheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const attachmentCell = sheet.getCell(`A${currentRow}`);
      attachmentCell.value = `📎 Pièce jointe: ${ticket.attachment}`;
      attachmentCell.font = { 
        name: 'Arial', 
        size: 10,
        color: { argb: 'FF3498DB' }
      };
      attachmentCell.alignment = { 
        vertical: 'middle', 
        horizontal: 'left'
      };
      sheet.getRow(currentRow).height = 20;
      currentRow++;
    }

    // Espacement
    sheet.getRow(currentRow++).height = 15;

    // ------------------------------------------
    // 2️⃣ FEUILLE DES RÉPONSES
    // ------------------------------------------
    if (ticket.responses && ticket.responses.length > 0) {
      const responsesSheet = workbook.addWorksheet("Historique des réponses", {
        pageSetup: {
          paperSize: 9,
          orientation: 'landscape'
        }
      });

      // Titre de la feuille
      responsesSheet.mergeCells('A1:E1');
      const responsesTitle = responsesSheet.getCell('A1');
      responsesTitle.value = "HISTORIQUE DES RÉPONSES";
      responsesTitle.font = { 
        name: 'Arial', 
        size: 16, 
        bold: true, 
        color: { argb: 'FFFFFFFF' }
      };
      responsesTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C3E50' }
      };
      responsesTitle.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      responsesSheet.getRow(1).height = 30;

      // En-têtes du tableau
      responsesSheet.columns = [
        { header: "N°", key: "index", width: 8 },
        { header: "Date", key: "date", width: 25 },
        { header: "Auteur", key: "author", width: 30 },
        { header: "Message", key: "message", width: 80 },
        { header: "Pièce jointe", key: "attachment", width: 30 }
      ];

      // Style des en-têtes
      const headerRow = responsesSheet.getRow(2);
      headerRow.font = { 
        name: 'Arial', 
        size: 12, 
        bold: true, 
        color: { argb: 'FFFFFFFF' }
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3498DB' }
      };
      headerRow.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      headerRow.height = 25;

      // Bordures des en-têtes
      ['A', 'B', 'C', 'D', 'E'].forEach(col => {
        responsesSheet.getCell(`${col}2`).border = {
          top: { style: 'thin', color: { argb: 'FF2C3E50' } },
          left: { style: 'thin', color: { argb: 'FF2C3E50' } },
          bottom: { style: 'thin', color: { argb: 'FF2C3E50' } },
          right: { style: 'thin', color: { argb: 'FF2C3E50' } }
        };
      });

      // Données des réponses
      ticket.responses.forEach((response, index) => {
        const row = responsesSheet.getRow(index + 3);
        
        const responseDate = new Date(response.createdAt);
        const author = response.postedBy ? 
          `${response.postedBy.prenom} ${response.postedBy.nom}` : 
          "Anonyme";

        row.getCell('index').value = index + 1;
        row.getCell('date').value = `${responseDate.toLocaleDateString('fr-FR')} ${responseDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        row.getCell('author').value = author;
        row.getCell('message').value = response.message;
        row.getCell('attachment').value = response.attachment || "Aucune";

        // Style alterné des lignes
        const bgColor = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA';
        ['A', 'B', 'C', 'D', 'E'].forEach(col => {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgColor }
          };
          row.getCell(col).border = {
            top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
            right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
          };
          row.getCell(col).alignment = { 
            vertical: 'middle', 
            horizontal: 'left',
            wrapText: true 
          };
          row.getCell(col).font = { 
            name: 'Arial', 
            size: 10,
            color: { argb: 'FF333333' }
          };
        });

        row.height = Math.max(20, Math.ceil(response.message.length / 100) * 15);
      });

      // Ajuster automatiquement la largeur des colonnes
      responsesSheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    }

    // ------------------------------------------
    // 3️⃣ FEUILLE RÉSUMÉ (STATISTIQUES)
    // ------------------------------------------
    const statsSheet = workbook.addWorksheet("Statistiques");

    // Statistiques
    statsSheet.mergeCells('A1:B1');
    const statsTitle = statsSheet.getCell('A1');
    statsTitle.value = "STATISTIQUES DU TICKET";
    statsTitle.font = { 
      name: 'Arial', 
      size: 14, 
      bold: true, 
      color: { argb: 'FFFFFFFF' }
    };
    statsTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' }
    };
    statsTitle.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    statsSheet.getRow(1).height = 30;

    // Données statistiques
    const statsData = [
      ["Nombre de réponses", ticket.responses.length],
      ["Durée depuis création", `${Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24))} jours`],
      ["Statut actuel", ticket.status],
      ["Priorité", ticket.priority],
      ["Assigné", ticket.assignedTo ? "Oui" : "Non"],
      ["Pièces jointes", ticket.attachment ? "Oui" : "Non"]
    ];

    statsData.forEach(([label, value], index) => {
      const rowNum = index + 3;
      
      const labelCell = statsSheet.getCell(`A${rowNum}`);
      labelCell.value = label;
      labelCell.font = { 
        name: 'Arial', 
        size: 11, 
        bold: true,
        color: { argb: 'FF2C3E50' }
      };
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8F9FA' }
      };
      labelCell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
      
      const valueCell = statsSheet.getCell(`B${rowNum}`);
      valueCell.value = value;
      valueCell.font = { 
        name: 'Arial', 
        size: 11
      };
      valueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }
      };
      valueCell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
      
      statsSheet.getRow(rowNum).height = 25;
    });

    // Ajuster les largeurs
    statsSheet.getColumn('A').width = 25;
    statsSheet.getColumn('B').width = 20;

    // ------------------------------------------
    // ENVOI DU FICHIER
    // ------------------------------------------
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket_${ticket._id}_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Erreur génération Excel:", err);
    res.status(500).json({ 
      message: "Erreur lors de la génération du fichier Excel.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

