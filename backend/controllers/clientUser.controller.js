const User = require("../models/User");

exports.listClientUsers = async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" })
      .select("prenom nom email telephone typeClient entreprise");

    res.json({ data: clients });
  } catch (err) {
    next(err);
  }
};
