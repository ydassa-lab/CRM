// crm-backend/controllers/ticket.controller.js

const Ticket = require("../models/Ticket");

// Liste des tickets
exports.list = async (req, res) => {
  try {
    const status = req.query.status;
    const q = {};
    if (status) q.status = status;

    // Si l’utilisateur est un client → il ne voit QUE ses tickets
    if (req.user.role === "client") {
      q.createdBy = req.user._id;
    }

    const tickets = await Ticket.find(q)
      .populate("createdBy", "prenom nom email role")
      .populate("assignedTo", "prenom nom email role")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer un ticket
exports.create = async (req, res) => {
  try {
    console.log("REQ.USER =", req.user);   // ← debug

    const ticket = await Ticket.create({
      title: req.body.title,
      message: req.body.message,
      createdBy: req.user._id
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.log(err);  // ← afficher l’erreur exacte
    res.status(500).json({ message: err.message });
  }
};


// Répondre à un ticket
exports.reply = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });

    ticket.responses.push({
      message: req.body.message,
      postedBy: req.user._id
    });

    // Si un agent répond → statut passe en "En cours"
    if (req.user.role !== "client") {
      ticket.status = "En cours";
    }

    await ticket.save();

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier le statut (support/admin)
exports.updateStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }  
};
