TicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await Ticket.countDocuments();
    this.ticketNumber = `TKT-${new Date().getFullYear()}-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});