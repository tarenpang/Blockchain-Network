const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
// const Config = require("./config");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transaction-miner");
const port = process.argv[2];

const DEFAULT_PORT = 5555;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
// const pubsub = new PubSub({ blockchain, transactionPool, wallet }); // for PubNub
const transactionMiner = new TransactionMiner({
	blockchain,
	transactionPool,
	wallet,
	pubsub,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
	if (!res) {
		res.status(StatusCodes.NOT_FOUND).json({ errorMsg: "Page not found." });
	} else {
		const ExpressListEndpoints = require("express-list-endpoints");
		let endpoints = ExpressListEndpoints(app);
		let listEndpoints = endpoints
			.map(
				(endpoint) =>
					`<li>${endpoint.methods} <a href="${endpoint.path}">${endpoint.path}</a></li>`
			)
			.join("");

		res
			.status(StatusCodes.OK)
			.send(
				"<h1>IndiGOLD Blockchain Network</h1>" + `<ul>${listEndpoints}</ul>`
			);
	}
});

app.get("/info", (req, res) => {
	const nodeId =
		new Date().getTime().toString(16) + Math.random().toString(16).substring(2);

	const chainId =
		!blockchain.blocks.length >= 1
			? "Not connected to the IndiGOLD blockchain."
			: blockchain.blocks[0].blockHash;

	res.status(StatusCodes.OK).json({
		about: "KU Blockchain Engineer Course / Blockchain Network Project",
		nodeId: nodeId,
		chainId: chainId,
		nodeUrl: process.argv[3],
		peers: blockchain.networkNodes.size,
		blocksCount: blockchain.blocks.length,
		cumulativeDifficulty: blockchain.calculateCumulativeDifficulty(),
		confirmedTransactions: blockchain.getConfirmedTransactions().length,
		pendingTransactions: blockchain.pendingTransactions.length,
	});
});

app.get("/blocks", (req, res) => {
	res.json(blockchain.chain);
});

app.get("/blocks/length", (req, res) => {
	res.json(blockchain.chain.length);
});

app.get("/blocks/:id", (req, res) => {
	const { id } = req.params;
	const { length } = blockchain.chain;

	const blocksReversed = blockchain.chain.slice().reverse();

	let startIndex = (id - 1) * 5;
	let endIndex = id * 5;

	startIndex = startIndex < length ? startIndex : length;
	endIndex = endIndex < length ? endIndex : length;

	res.json(blocksReversed.slice(startIndex, endIndex));
});

app.post("/mine", (req, res) => {
	const { data } = req.body;

	blockchain.addBlock({ data });

	pubsub.broadcastChain();

	res.redirect("/blocks");
});

app.post("/transact", (req, res) => {
	const { amount, recipient } = req.body;

	let transaction = transactionPool.existingTransaction({
		inputAddress: wallet.publicKey,
	});

	try {
		if (transaction) {
			transaction.update({ senderWallet: wallet, recipient, amount });
		} else {
			transaction = wallet.createTransaction({
				recipient,
				amount,
				chain: blockchain.chain,
			});
		}
	} catch (error) {
		return res.status(400).json({ type: "error", message: error.message });
	}

	transactionPool.setTransaction(transaction);

	pubsub.broadcastTransaction(transaction);

	res.json({ type: "success", transaction });
});

app.get("/transaction-pool-map", (req, res) => {
	res.json(transactionPool.transactionMap);
});

app.get("/mine-transactions", (req, res) => {
	transactionMiner.mineTransactions();

	res.redirect("/blocks");
});

app.get("/wallet-info", (req, res) => {
	const address = wallet.publicKey;

	res.json({
		address,
		balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
	});
});

app.get("/known-addresses", (req, res) => {
	const addressMap = {};

	for (let block of blockchain.chain) {
		for (let transaction of block.data) {
			const recipient = Object.keys(transaction.outputMap);

			recipient.forEach((recipient) => (addressMap[recipient] = recipient));
		}
	}

	res.json(Object.keys(addressMap));
});

const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction = ({ wallet, recipient, amount }) => {
	const transaction = wallet.createTransaction({
		recipient,
		amount,
		chain: blockchain.chain,
	});

	transactionPool.setTransaction(transaction);
};

const walletAction = () =>
	generateWalletTransaction({
		wallet,
		recipient: walletFoo.publicKey,
		amount: 5,
	});

const walletFooAction = () =>
	generateWalletTransaction({
		wallet: walletFoo,
		recipient: walletBar.publicKey,
		amount: 10,
	});

const walletBarAction = () =>
	generateWalletTransaction({
		wallet: walletBar,
		recipient: wallet.publicKey,
		amount: 15,
	});

for (let i = 0; i < 20; i++) {
	if (i % 3 === 0) {
		walletAction();
		walletFooAction();
	} else if (i % 3 === 1) {
		walletAction();
		walletBarAction();
	} else {
		walletFooAction();
		walletBarAction();
	}

	transactionMiner.mineTransactions();
}

app.listen(port, function () {
	console.log(`Listening on port ${port}...`); // string interpolation: ${port}
});
