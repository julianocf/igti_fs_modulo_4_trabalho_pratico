import mongoose from "mongoose";

const accountsSchema = mongoose.Schema({
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    validate(balance) {
      if (balance < 0) throw new Error('Valor negativo para o saldo');
    },
  },
});

const accountsModel = mongoose.model("accounts", accountsSchema);

export { accountsModel };
