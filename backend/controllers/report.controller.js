// backend/controllers/report.controller.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Client = require("../models/Client");
const Opportunity = require("../models/Opportunity");
const Ticket = require("../models/Ticket");
const Invoice = require("../models/Invoice");

const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

/**
 * Retourne un objet "overview" contenant les principales métriques.
 * - clientsNewByMonth
 * - ticketsByStatus
 * - opportunitiesByStage
 * - revenueByMonth
 * - topPerformers (commercials)
 */
exports.getManagerOverview = async (req, res) => {
  try {
    const now = new Date();
    const last12Months = new Date();
    last12Months.setMonth(now.getMonth() - 12);

    // ================================
    // 1️⃣ TOTAL REVENUE (Factures payées)
    // ================================
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // ================================
    // 2️⃣ NEW CLIENTS BY MONTH
    // ================================
    const clientsByMonth = await User.aggregate([
      { 
        $match: { 
          role: "client",
          createdAt: { $gte: last12Months }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Total nouveaux clients
    const newClientsCount = clientsByMonth.reduce((a, b) => a + b.count, 0);

    // ================================
    // 3️⃣ REVENUE BY MONTH
    // ================================
    const revenueByMonth = await Invoice.aggregate([
      { $match: { status: "paid", createdAt: { $gte: last12Months } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // ================================
    // 4️⃣ TICKETS STATUS
    // ================================
    const ticketsByStatus = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const resolvedTickets = ticketsByStatus.find(t => t._id === "resolved")?.count || 0;

    // ================================
    // 5️⃣ OPPORTUNITIES BY STAGE
    // ================================
    const opportunitiesByStage = await Opportunity.aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 }
        }
      }
    ]);

    const wonOpportunities = opportunitiesByStage.find(o => o._id === "Gagné")?.count || 0;
    const totalOpportunities = opportunitiesByStage.reduce((a, b) => a + b.count, 0);

    // ================================
    // 6️⃣ TOP PERFORMERS (Revenus générés par commercial)
    // ================================
    const topPerformers = await Invoice.aggregate([
      { $match: { status: "paid" } },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator"
        }
      },
      { $unwind: "$creator" },
      {
        $group: {
          _id: "$creator._id",
          name: { $first: "$creator.fullName" },
          avatar: { $first: "$creator.fullName" },
          revenue: { $sum: "$totalAmount" },
          wonCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // ================================
    // 7️⃣ SEND RESPONSE
    // ================================
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      newClientsCount,
      wonOpportunities,
      totalOpportunities,
      resolvedTickets,
      clientsByMonth,
      revenueByMonth,
      ticketsByStatus,
      opportunitiesByStage,
      topPerformers
    });

  } catch (err) {
    console.error("Erreur getManagerOverview:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.revenueByMonth = async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const now = new Date();
    const from = new Date();
    from.setMonth(now.getMonth() - (months - 1));

    const revenue = await Invoice.aggregate([
      { $match: { createdAt: { $gte: from }, status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur" });
  }
};

exports.ticketsHeatmap = async (req, res) => {
  try {
    // activité tickets par jour des 30 derniers jours
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const activity = await Ticket.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur" });
  }
};

exports.topPerformers = async (req, res) => {
  try {
    const topPerformers = await Opportunity.aggregate([
      { $match: { stage: "won" } },
      {
        $group: {
          _id: "$owner",
          wonCount: { $sum: 1 },
          revenue: { $sum: "$value" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $concat: ["$user.prenom", " ", "$user.nom"] },
          wonCount: 1,
          revenue: 1
        }
      }
    ]);

    res.json(topPerformers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur" });
  }
};

/* --------------- EXPORT PDF --------------- */
exports.exportPDF = async (req, res) => {
  try {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setMonth(now.getMonth() - 11);

    // Récupération des données
    const [
      clientsCount,
      ticketsCount,
      opportunitiesCount,
      revenue,
      clientsByMonth,
      revenueByMonth,
      ticketsByStatus,
      opportunitiesByStage,
      topPerformers
    ] = await Promise.all([
      User.countDocuments({ role: "client" }),
      Ticket.countDocuments(),
      Opportunity.countDocuments(),
      Invoice.aggregate([
        { $match: { status: "paid", createdAt: { $gte: yearAgo } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      // Données pour les graphiques
      User.aggregate([
        { $match: { role: "client", createdAt: { $gte: yearAgo } } },
        { $group: { 
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Invoice.aggregate([
        { $match: { status: "paid", createdAt: { $gte: yearAgo } } },
        { $group: { 
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Ticket.aggregate([
        { $group: { 
          _id: "$status",
          count: { $sum: 1 }
        }}
      ]),
      Opportunity.aggregate([
        { $group: { 
          _id: "$stage",
          count: { $sum: 1 }
        }}
      ]),
      // Top performers (simplifié)
      User.aggregate([
        { $match: { role: { $in: ["commercial", "sales"] } } },
        { $lookup: {
          from: "opportunities",
          localField: "_id",
          foreignField: "assignedTo",
          as: "opps"
        }},
        { $project: {
          name: { $concat: ["$prenom", " ", "$nom"] },
          wonCount: { 
            $size: { 
              $filter: { 
                input: "$opps", 
                as: "opp",
                cond: { $eq: ["$$opp.stage", "gagnée"] }
              }
            }
          },
          revenue: { $sum: "$opps.expectedValue" }
        }},
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalRevenue = revenue[0]?.total || 0;
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ 
      margin: 40, 
      size: "A4",
      info: {
        Title: "Rapport Manager CRM",
        Author: "CRM Pro",
        Subject: "Rapport de performance",
        Keywords: "rapport, manager, statistiques, performance",
        CreationDate: new Date()
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=rapport_manager_${new Date().toISOString().split('T')[0]}.pdf`
    );

    // Gestion des erreurs du stream
    doc.on('error', (err) => {
      console.error("Erreur PDF stream:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Erreur lors de la génération du PDF" });
      }
    });

    res.on('error', (err) => {
      console.error("Erreur response stream:", err);
    });

    doc.pipe(res);

    // ------------------------------------------
    // 1️⃣ EN-TÊTE
    // ------------------------------------------
    // Bandeau supérieur
    doc.rect(0, 0, 595, 100)
       .fill("#2C3E50");

    doc.fillColor("#FFFFFF")
       .fontSize(24)
       .font("Helvetica-Bold")
       .text("RAPPORT MANAGER", 0, 40, { align: "center" });

    doc.fontSize(12)
       .font("Helvetica")
       .text("Tableau de bord des performances", 0, 70, { align: "center" });

    doc.fillColor("#7F8C8D")
       .fontSize(10)
       .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 40, 110);

    // ------------------------------------------
    // 2️⃣ KPI PRINCIPAUX
    // ------------------------------------------
    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Indicateurs Clés de Performance", 40, 140);

    doc.moveDown(0.5);

    // Grille des KPIs
    const kpis = [
      { label: "Clients actifs", value: clientsCount, color: "#3498DB" },
      { label: "Tickets ouverts", value: ticketsCount, color: "#E74C3C" },
      { label: "Opportunités", value: opportunitiesCount, color: "#2ECC71" },
      { label: "Chiffre d'affaires", value: `${Math.round(totalRevenue).toLocaleString('fr-FR')} Ar`, color: "#9B59B6" }
    ];

    let y = 180;
    kpis.forEach((kpi, i) => {
      const x = i % 2 === 0 ? 40 : 300;
      if (i % 2 === 0 && i > 0) y += 80;

      doc.roundedRect(x, y, 240, 70, 8)
         .fill("#F8F9FA")
         .strokeColor("#E0E0E0")
         .stroke();

      doc.fillColor(kpi.color)
         .fontSize(14)
         .font("Helvetica-Bold")
         .text(kpi.label, x + 20, y + 20);

      doc.fillColor("#2C3E50")
         .fontSize(24)
         .font("Helvetica-Bold")
         .text(kpi.value, x + 20, y + 40);
    });

    y += 100;

    // ------------------------------------------
    // 3️⃣ ÉVOLUTION DU CA (12 MOIS)
    // ------------------------------------------
    doc.addPage();
    
    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Évolution du Chiffre d'Affaires", 40, 40);

    doc.fillColor("#7F8C8D")
       .fontSize(11)
       .text("Sur les 12 derniers mois", 40, 65);

    // Tableau des données
    const tableTop = 90;
    doc.fillColor("#FFFFFF")
       .rect(40, tableTop, 515, 25)
       .fill("#3498DB");

    doc.fillColor("#FFFFFF")
       .fontSize(11)
       .font("Helvetica-Bold")
       .text("Mois", 50, tableTop + 8)
       .text("CA (Ar)", 300, tableTop + 8)
       .text("% Évolution", 450, tableTop + 8);

    let dataY = tableTop + 30;
    let prevRevenue = null;

    revenueByMonth.forEach((item, index) => {
      const monthName = monthNames[(item._id.month - 1) % 12];
      const revenue = item.revenue || 0;
      const evolution = prevRevenue 
        ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1)
        : "-";

      // Fond alterné
      doc.rect(40, dataY - 5, 515, 20)
         .fill(index % 2 === 0 ? "#FFFFFF" : "#F8F9FA");

      doc.fillColor("#2C3E50")
         .fontSize(10)
         .text(`${monthName} ${item._id.year}`, 50, dataY)
         .text(revenue.toLocaleString('fr-FR'), 300, dataY)
         .text(evolution + "%", 450, dataY);

      prevRevenue = revenue;
      dataY += 22;
    });

    // Total
    doc.moveTo(40, dataY + 5)
       .lineTo(555, dataY + 5)
       .strokeColor("#3498DB")
       .stroke();

    doc.fillColor("#2C3E50")
       .fontSize(11)
       .font("Helvetica-Bold")
       .text("TOTAL", 50, dataY + 15)
       .text(totalRevenue.toLocaleString('fr-FR') + " Ar", 300, dataY + 15);

    // ------------------------------------------
    // 4️⃣ ACQUISITION CLIENTS
    // ------------------------------------------
    doc.moveDown(4);

    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Acquisition Clients", 40, doc.y);

    doc.fillColor("#7F8C8D")
       .fontSize(11)
       .text("Nouveaux clients par mois", 40, doc.y + 5);

    doc.moveDown(1);

    const clientsTableTop = doc.y;
    doc.fillColor("#FFFFFF")
       .rect(40, clientsTableTop, 515, 25)
       .fill("#2ECC71");

    doc.fillColor("#FFFFFF")
       .fontSize(11)
       .font("Helvetica-Bold")
       .text("Mois", 50, clientsTableTop + 8)
       .text("Nouveaux clients", 300, clientsTableTop + 8)
       .text("Total cumulé", 450, clientsTableTop + 8);

    let clientsY = clientsTableTop + 30;
    let cumulativeTotal = 0;

    clientsByMonth.forEach((item, index) => {
      const monthName = monthNames[(item._id.month - 1) % 12];
      const count = item.count || 0;
      cumulativeTotal += count;

      doc.rect(40, clientsY - 5, 515, 20)
         .fill(index % 2 === 0 ? "#FFFFFF" : "#F8F9FA");

      doc.fillColor("#2C3E50")
         .fontSize(10)
         .text(`${monthName} ${item._id.year}`, 50, clientsY)
         .text(count.toString(), 300, clientsY)
         .text(cumulativeTotal.toString(), 450, clientsY);

      clientsY += 22;
    });

    // ------------------------------------------
    // 5️⃣ RÉPARTITION DES TICKETS
    // ------------------------------------------
    doc.addPage();
    
    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Répartition des Tickets", 40, 40);

    const ticketsTotal = ticketsByStatus.reduce((sum, item) => sum + (item.count || 0), 0);
    let ticketsY = 80;

    ticketsByStatus.forEach((item, index) => {
      const percentage = ticketsTotal > 0 ? ((item.count / ticketsTotal) * 100).toFixed(1) : 0;
      const barWidth = 300 * (item.count / Math.max(...ticketsByStatus.map(t => t.count || 1)));

      doc.fillColor("#2C3E50")
         .fontSize(11)
         .text(item._id || "Non défini", 40, ticketsY);

      doc.rect(150, ticketsY - 5, barWidth, 15)
         .fill(index === 0 ? "#E74C3C" : 
               index === 1 ? "#3498DB" : 
               index === 2 ? "#F39C12" : "#95A5A6");

      doc.fillColor("#7F8C8D")
         .fontSize(10)
         .text(`${item.count} tickets (${percentage}%)`, 460, ticketsY);

      ticketsY += 25;
    });

    // ------------------------------------------
    // 6️⃣ PIPELINE COMMERCIAL
    // ------------------------------------------
    doc.moveDown(3);

    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Pipeline Commercial", 40, doc.y);

    const oppsTotal = opportunitiesByStage.reduce((sum, item) => sum + (item.count || 0), 0);
    let oppsY = doc.y + 20;

    opportunitiesByStage.forEach((item, index) => {
      const percentage = oppsTotal > 0 ? ((item.count / oppsTotal) * 100).toFixed(1) : 0;

      doc.fillColor("#2C3E50")
         .fontSize(11)
         .text(item._id || "Non défini", 40, oppsY);

      doc.rect(150, oppsY - 5, 300, 15)
         .fill("#F8F9FA")
         .strokeColor("#E0E0E0")
         .stroke();

      const fillWidth = 300 * (percentage / 100);
      doc.rect(150, oppsY - 5, fillWidth, 15)
         .fill(index === 0 ? "#3498DB" : 
               index === 1 ? "#2ECC71" : 
               index === 2 ? "#F39C12" : "#9B59B6");

      doc.fillColor("#7F8C8D")
         .fontSize(10)
         .text(`${item.count} opportunités (${percentage}%)`, 460, oppsY);

      oppsY += 25;
    });

    // ------------------------------------------
    // 7️⃣ TOP PERFORMERS
    // ------------------------------------------
    doc.moveDown(3);

    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Top 5 Performers", 40, doc.y);

    let performersY = doc.y + 20;

    topPerformers.forEach((performer, index) => {
      const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#3498DB", "#95A5A6"];
      
      doc.rect(40, performersY - 5, 515, 30)
         .fill(index % 2 === 0 ? "#FFFFFF" : "#F8F9FA")
         .strokeColor("#E0E0E0")
         .stroke();

      doc.fillColor(rankColors[index])
         .fontSize(14)
         .font("Helvetica-Bold")
         .text(`${index + 1}`, 50, performersY + 5);

      doc.fillColor("#2C3E50")
         .fontSize(12)
         .text(performer.name, 80, performersY + 5);

      doc.fillColor("#7F8C8D")
         .fontSize(10)
         .text(`${performer.wonCount} opportunités gagnées`, 80, performersY + 20);

      doc.fillColor("#2ECC71")
         .fontSize(12)
         .font("Helvetica-Bold")
         .text(`${Math.round(performer.revenue || 0).toLocaleString('fr-FR')} Ar`, 450, performersY + 10);

      performersY += 35;
    });

    // ------------------------------------------
    // 8️⃣ ANALYSE ET RECOMMANDATIONS
    // ------------------------------------------
    doc.addPage();
    
    doc.fillColor("#2C3E50")
       .fontSize(18)
       .font("Helvetica-Bold")
       .text("Analyse et Recommandations", 40, 40);

    doc.fillColor("#34495E")
       .fontSize(12)
       .font("Helvetica-Bold")
       .text("Points forts :", 40, 80);

    const strengths = [
      "• Croissance régulière du chiffre d'affaires",
      "• Base client en expansion constante",
      "• Pipeline commercial bien structuré",
      "• Taux de résolution des tickets satisfaisant"
    ];

    strengths.forEach((strength, index) => {
      doc.fillColor("#2C3E50")
         .fontSize(11)
         .text(strength, 60, 105 + (index * 20));
    });

    doc.fillColor("#34495E")
       .fontSize(12)
       .font("Helvetica-Bold")
       .text("Recommandations :", 40, 200);

    const recommendations = [
      "1. Focus sur la conversion des opportunités en phase finale",
      "2. Accélération du traitement des tickets en attente",
      "3. Développement de programmes de fidélisation clients",
      "4. Formation continue des équipes commerciales"
    ];

    recommendations.forEach((rec, index) => {
      doc.fillColor("#2C3E50")
         .fontSize(11)
         .text(rec, 60, 225 + (index * 20));
    });

    // ------------------------------------------
    // 9️⃣ PIED DE PAGE
    // ------------------------------------------
    const footerY = 750;
    
    doc.moveTo(40, footerY)
       .lineTo(555, footerY)
       .strokeColor("#E0E0E0")
       .stroke();

    doc.fillColor("#7F8C8D")
       .fontSize(9)
       .text("CRM Pro • Rapport confidentiel", 40, footerY + 10)
       .text(`Page ${doc.bufferedPageRange().count || 1}`, 0, footerY + 10, { align: "right" });

    doc.fillColor("#95A5A6")
       .fontSize(8)
       .text("Ce rapport a été généré automatiquement. Pour toute question, contactez l'équipe support.", 
             40, footerY + 25, { align: "center", width: 515 });

    // Terminer le document
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
      doc.end();
    });

  } catch (err) {
    console.error("Erreur génération PDF manager:", err);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Erreur lors de la génération du rapport PDF",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

/* --------------- EXPORT EXCEL --------------- */
exports.exportExcel = async (req, res) => {
  try {
    // Collect same overview sets
    const now = new Date();
    const yearAgo = new Date(now); yearAgo.setMonth(now.getMonth() - 11);

    const [clients, tickets, opportunities, invoices] = await Promise.all([
      User.find({ role: "client" }).limit(1000).lean(),
      Ticket.find().limit(1000).lean(),
      Opportunity.find().limit(1000).lean(),
      Invoice.find().limit(1000).lean()
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Overview");

    sheet.addRow(["Rapport Manager — CRM Pro"]);
    sheet.addRow([`Date : ${new Date().toLocaleString()}`]);
    sheet.addRow([]);
    sheet.addRow(["Clients"]);
    sheet.addRow(["_id", "prenom", "nom", "email", "telephone", "createdAt"]);
    clients.forEach(c => sheet.addRow([c._id.toString(), c.prenom, c.nom, c.email, c.telephone, c.createdAt?.toISOString()]));

    const sheetT = workbook.addWorksheet("Tickets");
    sheetT.addRow(["_id", "title", "status", "priority", "createdBy", "createdAt"]);
    tickets.forEach(t => sheetT.addRow([t._id.toString(), t.title, t.status, t.priority, t.createdBy?.toString?.() ?? "", t.createdAt?.toISOString()]));

    const sheetO = workbook.addWorksheet("Opportunities");
    sheetO.addRow(["_id", "title", "stage", "value", "owner"]);
    opportunities.forEach(o => sheetO.addRow([o._id.toString(), o.title || o.name || "", o.stage, o.value || 0, o.owner?.toString?.() ?? ""]));

    const sheetI = workbook.addWorksheet("Invoices");
    sheetI.addRow(["_id", "client", "totalAmount", "status", "createdAt"]);
    invoices.forEach(inv => sheetI.addRow([inv._id.toString(), inv.client?.toString?.() ?? "", inv.totalAmount, inv.status, inv.createdAt?.toISOString()]));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=report_manager_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportExcel error:", err);
    res.status(500).json({ message: "Erreur export Excel" });
  }
};
