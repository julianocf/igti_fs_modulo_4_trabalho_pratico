import express from "express";
import { accountsModel } from "../models/accountsModel.js";

const app = express();

// Endpoint para retornar todas as contas ordenadas crescente ou decrescente
app.get("/accounts/:sort", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const sort = req.params.sort;

  try {
    let accounts = await accountsModel.find({}).sort({ balance: sort });
    res.send(accounts);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o saque." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**
Crie um endpoint para registrar um depósito em uma conta. Este endpoint deverá
receber como parâmetros a “agencia”, o número da “conta” e o valor do depósito.
Ele deverá atualizar o “balance” da conta, incrementando-o com o valor recebido
como parâmetro. O endpoint deverá validar se a conta informada existe, caso não
exista deverá retornar um erro, caso exista retornar o saldo atual da conta.
*/
app.put("/deposit/:agency/:account/:value", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const agency = req.params.agency;
  const account = req.params.account;
  const value = req.params.value;

  if (value <= 0) {
    return res.status(400).send({
      message: "Impossível depositar um valor menor ou igual a 0.",
    });
  }

  try {
    const accountData = await accountsModel.findOneAndUpdate(
      { agencia: agency, conta: account },
      { $inc: { balance: value } },
      {
        new: true,
      }
    );

    if (!accountData) {
      return res.status(404).send("Agência/Conta não encontrada!");
    }

    res.send(accountData);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o depósito." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para registrar um saque em uma conta. Este endpoint deverá
receber como parâmetros a “agência”, o número da “conta” e o valor do saque. Ele
deverá atualizar o “balance” da conta, decrementando-o com o valor recebido com
parâmetro e cobrando uma tarifa de saque de (1). O endpoint deverá validar se a
conta informada existe, caso não exista deverá retornar um erro, caso exista retornar
o saldo atual da conta. Também deverá validar se a conta possui saldo suficiente
para aquele saque, se não tiver deverá retornar um erro, não permitindo assim que
o saque fique negativo.*/
app.put("/withdrawal/:agency/:account/:value", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const agency = req.params.agency;
  const account = req.params.account;
  const value = parseFloat(req.params.value);
  const withdrawalTax = 1;

  if (value <= 0) {
    value = value * -1;
  }

  try {
    let accountData = await accountsModel.findOne({
      agencia: agency,
      conta: account,
    });

    if (!accountData) {
      return res.status(404).send("Agência/Conta não encontrada!");
    }

    if (accountData.balance < value + withdrawalTax) {
      return res.status(500).send("Saldo insuficiente para o saque!");
    }

    accountData = await accountsModel.findOneAndUpdate(
      { agencia: agency, conta: account },
      { $inc: { balance: (value + withdrawalTax) * -1 } },
      {
        new: true,
      }
    );

    res.send(accountData);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o saque." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para consultar o saldo da conta. Este endpoint deverá receber
como parâmetro a “agência” e o número da “conta”, e deverá retornar seu “balance”.
Caso a conta informada não exista, retornar um erro. */
app.get("/account/:agency/:account", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const agency = req.params.agency;
  const account = req.params.account;

  try {
    let accountData = await accountsModel.findOne({
      agencia: agency,
      conta: account,
    });

    if (!accountData) {
      return res.status(404).send("Agência/Conta não encontrada!");
    }

    res.send(accountData);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o saque." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para consultar a média do saldo dos clientes de determinada
agência. O endpoint deverá receber como parâmetro a “agência” e deverá retornar
o balance médio da conta.
 */
app.get("/average-balance/:agency", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  try {
    const agency = parseInt(req.params.agency);

    const averageBalance = await accountsModel.aggregate([
      { $match: { agencia: agency } },
      {
        $group: {
          _id: { agencia: "$agencia" },
          balance: { $avg: "$balance" },
        },
      },
    ]);

    res.send(averageBalance);
  } catch (error) {
    res.status(500).send({
      message:
        "Ocorreu um erro ao transferir os clientes para a agência Private.",
    });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para consultar os clientes com o menor saldo em conta. O endpoint
devera receber como parâmetro um valor numérico para determinar a quantidade de
clientes a serem listados, e o endpoint deverá retornar em ordem crescente pelo
saldo a lista dos clientes (agência, conta, saldo) 
 */
app.get("/poorest-accounts/:limit", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const limit = parseInt(req.params.limit);

  try {
    let poorestAccounts = await accountsModel
      .find({})
      .sort({ balance: 1 })
      .limit(limit);

    res.send(poorestAccounts);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o saque." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para consultar os clientes mais ricos do banco. O endpoint deverá
receber como parâmetro um valor numérico para determinar a quantidade de clientes
a serem listados, e o endpoint deverá retornar em ordem decrescente pelo saldo,
crescente pelo nome, a lista dos clientes (agência, conta, nome e saldo).
 */
app.get("/richest-accounts/:limit", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const limit = parseInt(req.params.limit);

  try {
    let richestAccounts = await accountsModel
      .find({})
      .sort({ balance: -1, name: 1 })
      .limit(limit);

    res.send(richestAccounts);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o saque." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para realizar transferências entre contas. Este endpoint deverá
receber como parâmetro o número da “conta” origem, o número da “conta” destino e
o valor de transferência. Este endpoint deve validar se as contas são da mesma
agência para realizar a transferência, caso seja de agências distintas o valor de tarifa
de transferencia (8) deve ser debitado na “conta” origem. O endpoint deverá retornar
o saldo da conta origem. */

app.put("/transfer/:accountOrig/:accountDest/:value", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  const accountOrig = parseInt(req.params.accountOrig);
  const accountDest = parseInt(req.params.accountDest);
  const value = parseFloat(req.params.value);
  let tranferTax = 0;

  try {
    let accountOrigData = await accountsModel.findOne({
      conta: accountOrig,
    });

    if (!accountOrigData) {
      return res.status(404).send("Agência/Conta de origem não encontrada!");
    }

    let accountDestData = await accountsModel.findOne({
      conta: accountDest,
    });

    if (!accountDestData) {
      return res.status(404).send("Agência/Conta de destino não encontrada!");
    }

    if (accountOrigData.agencia != accountDestData.agencia) {
      tranferTax = 8;
    }

    accountDestData = await accountsModel.findOneAndUpdate(
      { conta: accountDest },
      { $inc: { balance: value } },
      {
        new: true,
      }
    );

    accountOrigData = await accountsModel.findOneAndUpdate(
      { conta: accountOrig },
      { $inc: { balance: (value + tranferTax) * -1 } },
      {
        new: true,
      }
    );

    res.send(accountOrigData + accountDestData);
  } catch (error) {
    res.status(500).send({ message: "Ocorreu um erro ao efetuar o saque." });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint que irá transferir o cliente com maior saldo em conta de cada
agência para a agência private agencia=99. O endpoint deverá retornar a lista dos
clientes da agencia private. */
app.put("/private", async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados inválidos na requisição!",
    });
  }

  try {
    let privateAccounts = await accountsModel.aggregate([
      {
        $group: {
          _id: "$agencia",
          balance: { $max: "$balance" },
        },
      },
    ]);

    privateAccounts.forEach(async function (acc) {
      await accountsModel.findOneAndUpdate(
        { agencia: acc._id, balance: acc.balance },
        { agencia: 99 }
      );
    });

    privateAccounts = await accountsModel.find({
      agencia: 99,
    });

    res.send(privateAccounts);
  } catch (error) {
    res.status(500).send({
      message:
        "Ocorreu um erro ao transferir os clientes para a agência Private.",
    });
    console.log(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
});

/**Crie um endpoint para excluir uma conta. Este endpoint deverá receber como
parâmetro a “agência” e o número da “conta” da conta e retornar o número de contas
ativas para esta agência. */
app.delete("/account/:agency/:account", async (req, res) => {
  try {
    const agency = req.params.agency;
    const account = req.params.account;

    const accountDeleted = await accountsModel.findOneAndDelete({
      agencia: agency,
      conta: account,
    });

    if (!accountDeleted) {
      return res.send(404).send("Conta não encontrada");
    }

    res.send(200).end;
  } catch (error) {
    res.status(500).send(error);
  }
});

export { app as accountsRouter };
