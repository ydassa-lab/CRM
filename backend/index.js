require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const { errorHandler } = require("./middlewares/errorHandler");
const prospectRoutes = require("./routes/prospect.route");
const opportunityRoutes = require("./routes/opportunity.route");
const clientRoutes = require("./routes/client.route");
const ticketRoutes = require("./routes/ticket.route");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/prospect", prospectRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/tickets", ticketRoutes);

// error handler (after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch(err => {
    console.error("Erreur MongoDB :", err);
  });
