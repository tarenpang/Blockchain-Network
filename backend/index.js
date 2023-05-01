const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const Config = require("./utils/config");
const Block = require("./block");
const Blockchain = require("./blockchain");
const host = "http://localhost";
const port = process.argv[2];
const axios = require("axios");

const DEFAULT_PORT = 5555;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

let blockchainNode = {
	nodeId: "",
	selfId: "",
	peers: {},
	chain: blockchain,
};

blockchainNode.init = function (host, port, blockchain) {
	blockchainNode.nodeId =
		new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
	blockchainNode.selfId = `${host}:${port}`;
	blockchainNode.peers = {};
	blockchainNode.chain = blockchain;
};

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

// Node Info
app.get("/info", (req, res) => {
	res.status(StatusCodes.OK).json({
		about: "IndiGOLD Blockchain Network",
		nodeId: blockchainNode.nodeId,
		chainId: Config.chainId,
		nodeUrl: Config.currentNodeURL,
		peers: Object.keys(blockchainNode.peers).length,
		currentDifficulty: blockchain.difficulty,
		blocksCount: blockchain.blocks.length,
		cumulativeDifficulty: blockchain.calcCumulativeDifficulty(),
		confirmedTransactions: blockchain.getConfirmedTransactions().length,
		pendingTransactions: blockchain.pendingTransactions.length,
	});
});

// Node Debug
app.get("/debug", (req, res) => {
	res.status(StatusCodes.OK).json({
		selfUrl: Config.currentNodeURL,
		peers: blockchainNode.peers,
		chain: blockchain.blocks,
		pendingTransactions: blockchain.pendingTransactions,
		currentDifficulty: blockchain.currentDifficulty,
		miningJobs: blockchain.miningJobs,
		confirmedBalances: blockchain.confirmedBalances,
	});
});

// Get All Blocks
app.get("/blocks", (req, res) => {
	res.json(blockchain.blocks);
});

// Reset Chain to Genesis Block
app.get("/debug/reset-chain", (req, res) => {
	blockchain.resetChain();
	res.status(StatusCodes.OK).json({
		message: "Chain reset successfully.",
		blockchain: blockchain,
	});
});

// Get Block by Index
app.get("/blocks/:index", (req, res) => {
	let index = req.params.index;
	let block = blockchainNode.chain.blocks[index];
	if (block) res.json(block);
	else
		res.status(StatusCodes.NOT_FOUND).json({ errorMsg: "Invalid block index" });
});

// Get Pending Transactions
app.get("/transactions/pending", (req, res) => {
	res.status(StatusCodes.OK).json(blockchain.pendingTransactions);
});

app.get("/addresses", (req, res) => {
	let allAddresses = blockchain.getAllAddresses();
	res.json(allAddresses);
});

app.get("/address/:address/transactions", (req, res) => {
	let address = req.params.address;
	let txnHistory = blockchain.getTransactionHistory(address);
	res.json(txnHistory);
});

app.get("/address/:address/balance", (req, res) => {
	let address = req.params.address;
	let balance = blockchain.getAccountBalance(address);
	if (balance.errorMsg) res.status(StatusCodes.NOT_FOUND);
	res.json(balance);
});

app.post("/transaction", function (req, res) {
	const newTransaction = req.body;
	const blockIndex = blockchain.addNewTxnToPendingTxns(newTransaction);
	res.json({
		message: `Transaction will be added in block ${blockIndex}`,
	});
});

app.post("/transaction/broadcast", async function (req, res) {
	const newTransaction = blockchain.addTransaction(req.body);
	console.log(newTransaction);
	if (newTransaction.errorMsg) {
		res.json({ error: newTransaction.errorMsg });
		return;
	}

	if (newTransaction.transactionDataHash) {
		try {
			const requestPromises = blockchain.networkNodes.map((node) =>
				axios.post(`${node}/transaction`, newTransaction)
			);
			await Promise.all(requestPromises);
			res.json({
				message: "Transaction created and broadcasted",
				transactionDataHash: newTransaction.transactionDataHash,
			});
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	} else {
		res.status(StatusCodes.BAD_REQUEST).json(newTransaction);
	}
});

app.post("/mine", function (req, res) {
	const { minerAddress, difficulty } = req.body;
	const newBlock = blockchain.mineNextBlock(minerAddress, difficulty);

	// broadcast the new block to other nodes
	const requestPromises = [];
	blockchain.networkNodes.forEach((node) => {
		const requestOptions = {
			url: `${node}/receive-new-block`,
			method: "POST",
			data: { newBlock },
			headers: {
				"Content-Type": "application/json",
			},
		};

		requestPromises.push(axios(requestOptions));
	});

	Promise.all(requestPromises)
		.then(() => {
			res.json({
				message: "New block mined and broadcasted successfully",
				block: newBlock,
			});
		})
		.catch((err) => res.status(400).json({ error: err.message }));
});

app.post("/receive-new-block", function (req, res) {
	const block = blockchain.extendChain(req.body.newBlock);
	if (!block.errorMsg) {
		res.json({
			message: "New block received and accepted",
			block,
		});
	} else {
		res.json({
			message: "New block rejected",
			block,
		});
	}
});

app.post("/register-and-broadcast-node", async function (req, res) {
	const newNodeUrl = req.body.newNodeUrl;

	if (blockchain.networkNodes.indexOf(newNodeUrl) == -1) {
		blockchain.networkNodes.push(newNodeUrl);
	}

	const regNodesPromises = [];
	blockchain.networkNodes.forEach((networkNodesUrl) => {
		const requestOptions = {
			url: `${networkNodesUrl}/register-node`,
			method: "POST",
			data: { newNodeUrl: newNodeUrl },
			headers: { "Content-Type": "application/json" },
		};

		regNodesPromises.push(axios(requestOptions));
	});

	try {
		await axios.all(regNodesPromises);

		const bulkRegisterOptions = {
			url: `${newNodeUrl}/register-nodes-bulk`,
			method: "POST",
			data: {
				allNetworkNodes: [
					...blockchain.networkNodes,
					blockchain.currentNodeUrl,
				],
				pendingTransactions: blockchain.pendingTransactions,
			},
			headers: { "Content-Type": "application/json" },
		};

		await axios(bulkRegisterOptions);

		res.json({ message: "New node registered with network successfully" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.post("/register-node", function (req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent =
		blockchain.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = blockchain.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode)
		blockchain.networkNodes.push(newNodeUrl);
	res.json({
		message: "New node registered successfully",
	});
});

app.post("/register-nodes-bulk", function (req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	const pendingTransactions = req.body.pendingTransactions;

	allNetworkNodes.forEach((networkNodesUrl) => {
		const nodeNotAlreadyPresent =
			blockchain.networkNodes.indexOf(networkNodesUrl) == -1;
		const notCurrentNode = blockchain.currentNodeUrl !== networkNodesUrl;
		if (nodeNotAlreadyPresent && notCurrentNode)
			blockchain.networkNodes.push(networkNodesUrl);
	});
	// update pending transactions
	blockchain.pendingTransactions = pendingTransactions;
	res.json({
		message: "Bulk registration successful",
	});
});

app.post("/unregister-and-broadcast-node", function (req, res) {
	const oldNodeURL = req.body.oldNodeURL;

	const removeNodePromise = [];
	blockchain.networkNodes.forEach((networkNodesUrl) => {
		const requestOptions = {
			url: networkNodesUrl + "/unregister-node",
			method: "POST",
			data: { oldNodeURL: oldNodeURL },
			headers: { "Content-Type": "application/json" },
		};

		removeNodePromise.push(axios(requestOptions));
	});

	Promise.all(removeNodePromise)
		.then(() => {
			if (blockchain.networkNodes.includes(oldNodeURL)) {
				blockchain.networkNodes = blockchain.networkNodes.filter(
					(node) => node !== oldNodeURL
				);
			}

			res.json({
				message: "Node removed from network successfully",
			});
		})
		.catch((err) => res.status(400).json({ error: err.message }));
});

app.get("/consensus", async function (req, res) {
	const requestPromises = [];

	// get all network nodes and make a request to each one
	blockchain.networkNodes.forEach((networkNodeUrl) => {
		requestPromises.push(axios.get(`${networkNodeUrl}/blockchain`));
	});

	try {
		const blockchains = await Promise.all(requestPromises);

		// check if the length of the blockchains is greater than our current node blockchain
		const currentChainLength = blockchain.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach((blockchain) => {
			if (blockchain.data.chain.length > maxChainLength) {
				maxChainLength = blockchain.data.chain.length;
				newLongestChain = blockchain.data.chain;
				newPendingTransactions = blockchain.data.pendingTransactions;
			}
		});

		if (!newLongestChain) {
			res.json({
				message: "Current chain has not been replaced",
				chain: blockchain.chain,
			});
		} else {
			blockchain.chain = newLongestChain;
			blockchain.pendingTransactions = newPendingTransactions;
			res.json({
				message: "This chain has been replaced",
				chain: blockchain.chain,
			});
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

app.get("/blocks/length", (req, res) => {
	res.json(blockchain.chain.length);
});

app.get("/block/:blockHash", (req, res) => {
	const blockHash = req.params.blockHash;
	const correctBlock = blockchain.getBlock(blockHash);
	res.json({ block: correctBlock });
});

app.get("/blockByIndex/:index", (req, res) => {
	const blockIndex = req.params.blockIndex;
	const correctBlock = blockchain.getBlockByIndex(blockIndex);
	res.json({ block: correctBlock });
});

app.get("/block/:blockHash/transactions", (req, res) => {
	const blockHash = req.params.blockHash;
	const correctBlock = blockchain.getBlockTransactions(blockHash);
	res.json({ trans: correctBlock });
});

app.get("/transaction/:transactionHash", (req, res) => {
	const transactionHash = req.params.transactionHash;
	const transactionData = blockchain.getTransactionByTxnHash(transactionHash);
	res.json({ transaction: transactionData });
});

app.get("/address/:address", (req, res) => {
	const address = req.params.address;
	const addressData = blockchain.getAddressData(address);
	res.json({ addressData: addressData });
});

app.get("/all-transactions", function (req, res) {
	res.json(blockchain.getAllTransactions());
});

app.get("/all-pending-transactions", function (req, res) {
	res.json(blockchain.pendingTransactions);
});

app.post("/mine", (req, res) => {
	const { data } = req.body;

	blockchain.addBlock({ data });

	pubsub.broadcastChain();

	res.redirect("/blocks");
});

app.listen(port, function () {
	console.log(`Listening on port ${port}...`); // string interpolation: ${port}
});
