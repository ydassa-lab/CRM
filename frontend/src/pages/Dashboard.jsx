import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

// ADMIN
import AnalyticsDashboard from "./dashboard/AnalyticsDashboard.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
// import AdminClients from "./admin/AdminClients.jsx";
import Notifications from "./notifications/Notifications.jsx";
import Invoices from "./billing/Invoices.jsx";
import InvoiceCreate from "./billing/InvoiceCreate.jsx";
import InvoiceDetails from "./billing/InvoiceDetails.jsx";
import FinanceDashboard from "./billing/FinanceDashboard.jsx";
import ManagerStats from "./manager/ManagerStats.jsx";


// COMMERCIAL
import CommercialProspects from "./commercial/CommercialProspects.jsx";
import CommercialOpportunities from "./commercial/CommercialOpportunities.jsx";
import Clients from "../pages/Clients.jsx";
import Tickets from "../pages/Tickets.jsx";

// MARKETING
// import MarketingCampaigns from "./marketing/MarketingCampaigns.jsx";

// SUPPORT
import SupportTickets from "./support/SupportTickets.jsx";
import TicketDetails from "./support/TicketDetails.jsx";


// MANAGER
// import ManagerStats from "./manager/ManagerStats.jsx";

// CLIENT
// import ClientProfile from "./client/ClientProfile.jsx";
import ClientTickets from "./client/ClientTickets.jsx";

export default function Dashboard({ role }) {
  return (
    <DashboardLayout role={role}>
      <Routes>

        {/* --- PAGE D'ACCUEIL PAR DÉFAUT (toute personne connectée) --- */}
        <Route path="/" element={<AnalyticsDashboard />} />

        {/* --- ROUTES ADMIN --- */}
        {role === "admin" && (
          <Route path="admin/*" element={<AdminRoutes />} />
        )}

        {/* --- ROUTES COMMERCIAL --- */}
        {role === "commercial" && (
          <Route path="commercial/*" element={<CommercialRoutes />} />
        )}

        {/* --- ROUTES MARKETING --- */}
        {role === "marketing" && (
          <Route path="marketing/*" element={<MarketingRoutes />} />
        )}

        {/* --- ROUTES SUPPORT --- */}
        {role === "support" && (
          <Route path="support/*" element={<SupportRoutes />} />
        )}

        {/* --- ROUTES MANAGER --- */}
        {role === "manager" && (
          <Route path="manager/*" element={<ManagerRoutes />} />
        )}

        {/* --- ROUTES CLIENT --- */}
        {role === "client" && (
          <Route path="client/*" element={<ClientRoutes />} />
        )}

        {/* --- FALLBACK --- */}
        <Route path="*" element={<Navigate to="/" replace />} />

         {/* 📌 NOUVELLE ROUTE NOTIFICATIONS */}
    <Route path="notifications" element={<Notifications />} />
      </Routes>
    </DashboardLayout>
  );
}

/* ============================================================
    ROUTES ADMIN
============================================================ */
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AnalyticsDashboard />} />

      {/* Gestion utilisateurs / clients / tickets */}
      <Route path="users" element={<AdminUsers />} />
      <Route path="clients" element={<Clients />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="tickets/:id" element={<TicketDetails role="admin" />} />

      {/* 📌 FACTURATION */}
      <Route path="billing" element={<Invoices />} />
      <Route path="billing/new" element={<InvoiceCreate />} />
      <Route path="billing/:id" element={<InvoiceDetails />} />

      {/* 📊 📈 Dashboard Finance */}
      <Route path="billing/dashboard" element={<FinanceDashboard />} />

      {/* ⚠️ Toujours à la fin */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}



/* ============================================================
    ROUTES COMMERCIAL
============================================================ */
function CommercialRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CommercialProspects />} />
      <Route path="prospects" element={<CommercialProspects />} />
      <Route path="opportunities" element={<CommercialOpportunities />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="clients" element={<Clients />} />
      <Route path="tickets" element={<Tickets />} />
    </Routes>
  );
}

/* ============================================================
    ROUTES MARKETING
============================================================ */
function MarketingRoutes() {
  return (
    <Routes>
      {/* <Route path="/" element={<MarketingCampaigns />} /> */}
      {/* <Route path="campaigns" element={<MarketingCampaigns />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ============================================================
    ROUTES SUPPORT
============================================================ */
function SupportRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SupportTickets />} />
      <Route path="tickets" element={<SupportTickets />} />
      <Route path="tickets/:id" element={<TicketDetails role="support" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


/* ============================================================
    ROUTES MANAGER
============================================================ */
function ManagerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ManagerStats />} />
      <Route path="stats" element={<ManagerStats />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}



/* ============================================================
    ROUTES CLIENT
============================================================ */
function ClientRoutes() {
  return (
    <Routes>
      <Route path="tickets" element={<ClientTickets />} />
      <Route path="tickets/:id" element={<TicketDetails role="client" />} />
    </Routes>
  );
}

