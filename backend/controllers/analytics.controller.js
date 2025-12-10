// crm-backend/controllers/analytics.controller.js
const User = require("../models/User");
const Prospect = require("../models/Prospect");
const Ticket = require("../models/Ticket");
const Opportunity = require("../models/Opportunity");
const mongoose = require("mongoose");

function startOfDayISO(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}

exports.overview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: "client" });
    const totalProspects = await Prospect.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: "Ouvert" });
    const totalOpportunities = await Opportunity.countDocuments();
    const wonOpps = await Opportunity.countDocuments({ stage: "Gagné" });

    res.json({
      totalUsers,
      totalClients,
      totalProspects,
      totalTickets,
      openTickets,
      totalOpportunities,
      wonOpps
    });
  } catch (err) {
    console.error("analytics.overview error", err);
    res.status(500).json({ message: err.message });
  }
};

// Tickets last N days (default 30)
exports.ticketsOverTime = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0,0,0,0);

    const pipeline = [
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const data = await Ticket.aggregate(pipeline);

    // fill missing dates
    const map = {};
    data.forEach(d => (map[d._id] = d.count));
    const results = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0,10);
      results.push({ date: key, count: map[key] || 0 });
    }

    res.json(results);
  } catch (err) {
    console.error("analytics.ticketsOverTime error", err);
    res.status(500).json({ message: err.message });
  }
};

// Ticket status distribution
exports.ticketStatus = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ];
    const data = await Ticket.aggregate(pipeline);
    // normalize to object
    const result = {};
    data.forEach(d => (result[d._id] = d.count));
    res.json(result);
  } catch (err) {
    console.error("analytics.ticketStatus error", err);
    res.status(500).json({ message: err.message });
  }
};

// Opportunities by stage (and sum amounts)
exports.opportunitiesByStage = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ["$amount", 0] } }
        }
      }
    ];
    const data = await Opportunity.aggregate(pipeline);
    res.json(data); // [{_id: "Découverte", count: X, totalAmount: Y}, ...]
  } catch (err) {
    console.error("analytics.opportunitiesByStage error", err);
    res.status(500).json({ message: err.message });
  }
};

// Monthly revenue from won opportunities (last N months)
exports.revenueByMonth = async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0,0,0,0);

    const pipeline = [
      { $match: { stage: "Gagné", createdAt: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: { $ifNull: ["$amount", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];

    const data = await Opportunity.aggregate(pipeline);

    // fill months
    const resArr = [];
    const now = new Date(start);
    for (let i = 0; i < months; i++) {
      const y = now.getFullYear();
      const m = now.getMonth() + 1; // 1-based
      const key = `${y}-${String(m).padStart(2,"0")}`;
      const match = data.find(d => `${d._id.year}-${String(d._id.month).padStart(2,"0")}` === key);
      resArr.push({ month: key, total: match ? match.total : 0 });
      now.setMonth(now.getMonth() + 1);
    }

    res.json(resArr);
  } catch (err) {
    console.error("analytics.revenueByMonth error", err);
    res.status(500).json({ message: err.message });
  }
};
