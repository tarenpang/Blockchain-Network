const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const Blockchain = require("./blockchain");
const Config = require("./utils/config");

const nodeId =
	new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
const host = "http://localhost";
const port = process.argv[2];
const currentNodeURL = `${host}:${port}`;
let peersMap = {}; // Map of nodeId: nodeUrl
let blockchainId = Config.blockchainId;

const app = express();
const blockchain = new Blockchain();

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

// Node Info
app.get("/info", (req, res) => {
	res.status(StatusCodes.OK).json({
		about: "IndiGOLD Blockchain Network",
		nodeId: nodeId,
		blockchainId: Config.blockchainId,
		nodeUrl: currentNodeURL,
		peers: peersMap.length,
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
		peers: peersMap,
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
	let block = node.chain.blocks[index];
	if (block) res.json(block);
	else
		res.status(StatusCodes.NOT_FOUND).json({ errorMsg: "Invalid block index" });
});

// Get Block by Block Hash
app.get("/block/:blockHash", (req, res) => {
	const blockHash = req.params.blockHash;
	const correctBlock = noobchain.getBlock(blockHash);
	res.json({ block: correctBlock });
});

// Create a New Transaction
app.post("/transaction", function (req, res) {
	const newTransaction = req.body;
	const blockIndex =
		bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

// Add Transaction to Pending Transactions
app.post("/transaction", function (req, res) {
	const newTransaction = req.body;
	const blockIndex =
		blockchain.addTransactionToPendingTransactions(newTransaction);
	res.json({
		message: `Transaction will be added in block ${blockIndex}`,
	});
});

// Get Pending Transactions
app.get("/transactions/pending", (req, res) => {
	res.status(StatusCodes.OK).json(blockchain.pendingTransactions);
});

// Get Confirmed Transactions
app.get("/transactions/confirmed", (req, res) => {
	const confirmedTransactions = blockchain.getConfirmedTransactions();
	if (!confirmedTransactions.length >= 1)
		res.json({
			errorMsg: "No confirmed transactions.",
		});

	res.status(StatusCodes.OK).json(confirmedTransactions);
});

// Get Transaction by Transaction Data Hash
app.get("/transactions/:transaction-hash", (req, res) => {
	let transactionHash = req.params.txnHash;
	let transaction = blockchain.getTransactionByDataHash(transactionHash);
	if (transaction) res.json(transaction);
	else
		res
			.status(StatusCodes.NOT_FOUND)
			.json({ errorMsg: "Invalid transaction hash" });
});

// List All Account Balances
app.get("/balances", (req, res) => {
	let confirmedBalances = blockchain.calcAllConfirmedBalances();
	res.json(confirmedBalances);
});

// List All Addresses
app.get("/addresses", (req, res) => {
	let allAddresses = blockchain.getAllAddresses();
	res.json(allAddresses);
});

// List All Transactions of a Given Address
app.get("/address/:address/transactions", (req, res) => {
	let address = req.params.address;
	let txnHistory = blockchain.getTransactionHistory(address);
	res.json(txnHistory);
});

// List Balance of a Given Address
app.get("/address/:address/balance", (req, res) => {
	let address = req.params.address;
	let balance = blockchain.getAccountBalance(address);
	if (balance.errorMsg) res.status(StatusCodes.NOT_FOUND);
	res.json(balance);
});

// Create and Broadcast New Transaction to Peers
app.post("/transactions/send", function (req, res) {
	const newTransaction = blockchain.addNewTransaction(req.body);
	if (newTransaction.errorMsg) {
		res.json({ error: newTransaction.errorMsg });
		return;
	}

	const axiosRequests = [];
	bitcoin.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			url: networkNodeUrl + "/transaction",
			method: "POST",
			data: newTransaction,
			responseType: "json",
		};

		axiosRequests.push(axios(requestOptions));
	});

	Promise.all(axiosRequests)
		.then((data) => {
			res.json({ note: "Transaction created and broadcast successfully." });
		})
		.catch((err) => {
			res.status(400).json({ error: err.message });
		});
});

// app.post("/transaction", function (req, res) {
// 	const newTransaction = req.body;
// 	const blockIndex = blockchain.addNewTxnToPendingTxns(newTransaction);
// 	res.json({
// 		message: `Transaction will be added in block ${blockIndex}`,
// 	});
// });

// Get Mining Job
app.get("/mining/get-mining-job/:miner-address", (req, res) => {
	let address = req.params.address;
	let blockCandidate = blockchain.getMiningJob(address);
	// console.log(blockCandidate.transactions[0].to);
	console.log(blockCandidate.transactions);
	res.status(StatusCodes.OK).json({
		index: blockCandidate.index,
		transactionsIncluded: blockCandidate.transactions.length,
		difficulty: blockCandidate.difficulty,
		expectedReward: blockCandidate.transactions[0].value,
		rewardAddress: blockCandidate.transactions[0].to,
		blockDataHash: blockCandidate.blockDataHash,
	});
});

// Submit Mined Block
app.post("/mining/submit-mined-block", (req, res) => {
	let blockDataHash = req.body.blockDataHash;
	let dateCreated = req.body.dateCreated;
	let nonce = req.body.nonce;
	let blockHash = req.body.blockHash;
	let result = blockchain.submitMinedBlock(
		blockDataHash,
		dateCreated,
		nonce,
		blockHash
	);
	if (result.errorMsg) res.status(StatusCodes.BAD_REQUEST).json(result);
	else {
		res.json({
			message: `Block accepted to blockchain, mining reward: ${result.transactions[0].value} microcoins`,
		});
		blockchain.notifyPeersAboutNewBlock();
	}
});

// Debug Mining a Block
app.get("/debug/mine/:minerAddress/:difficulty", (req, res) => {
	let minerAddress = req.params.minerAddress;
	let difficulty = parseInt(req.params.difficulty) || 3;
	let result = blockchain.mineNextBlock(minerAddress, difficulty);
	if (result.errorMsg) res.status(StatusCodes.BAD_REQUEST);
	res.json(result);
});

// List All Peers
app.get("/peers", (req, res) => {
	console.log(peersMap);
	res.status(StatusCodes.OK).json(peersMap);
});

// Connect a Peer
app.post("/peers/connect", (req, res) => {
	let peerUrl = req.body.peerUrl;
	if (peerUrl === undefined)
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ errorMsg: "'peerUrl' not in the request body" });

	console.log("Status: Attempting to connect to peer: " + peerUrl);
	axios
		.get(peerUrl + "/info")
		.then(function (result) {
			if (nodeId === result.data.nodeId) {
				res
					.status(StatusCodes.CONFLICT)
					.json({ errorMsg: "Cannot connect to current node" });
			} else if (node.peers[result.data.nodeId]) {
				console.log("Error: Already connected to peer: " + peerUrl);
				res
					.status(StatusCodes.CONFLICT)
					.json({ errorMsg: "Already connected to peer: " + peerUrl });
			} else if (blockchainId !== result.data.blockchainId) {
				console.log("Error: Chain ID cannot be different");
				res
					.status(StatusCodes.BAD_REQUEST)
					.json({ errorMsg: "Nodes should have the same chain ID" });
			} else {
				// Remove all peers with the same URL + add the new peer
				for (let nodeId in node.peers)
					if (peersMap[nodeId] === peerUrl) delete peersMap[nodeId];
				peersMap[result.data.nodeId] = peerUrl;
				console.log("Successfully connected to peer: " + peerUrl);

				// Try to connect back the remote peer to self
				axios
					.post(peerUrl + "/peers/connect", { peerUrl: node.selfUrl })
					.then(function () {})
					.catch(function () {});

				// Synchronize the blockchain + pending transactions
				syncBlockchainFromPeerChain(result.data);
				node.syncPendingTxnsFromPeerChain(result.data);

				res.json({ message: "Connected to peer: " + peerUrl });
			}
		})
		.catch(function (error) {
			console.log(`Error: connecting to peer: ${peerUrl} failed.`);
			res
				.status(StatusCodes.BAD_REQUEST)
				.json({ errorMsg: "Cannot connect to peer: " + peerUrl });
		});
});

// Notify Peers about New Block
app.post("/peers/notify-new-block", (req, res) => {
	syncBlockchainFromPeerChain(req.body);
	res.json({ message: "Thank you for the notification." });
});

// Register a New Peer
app.post("/register-peer", function (req, res) {
	const nodeUrl = `http://localhost:${process.argv[2]}`;
	// console.log("nodeUrl: ", nodeUrl);

	// Check if nodeUrl already exists in Peers map
	if (peersMap[nodeUrl]) {
		console.log(`Error registering node: ${nodeUrl} is already in the network`);
		return res.sendStatus(StatusCodes.BAD_REQUEST);
	}

	// Generate a new nodeId
	const nodeId =
		new Date().getTime().toString(16) + Math.random().toString(16).substring(2);

	// Add New peer to the Current Node Peers Map
	peersMap[nodeUrl] = nodeId;

	// Send a successful response
	res.json({ nodeId: nodeId });

	console.log(
		`Node registered successfully. Node ID: ${nodeId}, Node URL: ${nodeUrl}`
	);

	// Broadcast the new peer to all existing peers
	// broadcastNewPeer(nodeUrl);
});

// Register the node with the root node
const nodeUrl = `http://localhost:${port}`;
// console.log("nodeUrl: ", nodeUrl);
// console.log("nodeId: ", nodeId);
// console.log("currentNodeURL: ", currentNodeURL);

axios
	.post(`${nodeUrl}/register-peer`, { nodeUrl })
	.then((res) => {
		console.log(res.data);
	})
	.catch((err) => {
		console.error(`Error registering node: ${err.message}`);
	});

// Register and Broadcast Peer to the Network
app.post("/register-and-broadcast-peer", function (req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (blockchain.networkNodes.indexOf(newNodeUrl) == -1)
		blockchain.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	blockchain.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			method: "POST",
			url: `${networkNodeUrl}/register-node`,
			data: { newNodeUrl: newNodeUrl },
			json: true,
		};

		regNodesPromises.push(axios(requestOptions));
	});

	// reverse registration
	Promise.all(regNodesPromises)
		.then((data) => {
			const bulkRegisterOptions = {
				method: "POST",
				url: `${newNodeUrl}/register-nodes-bulk`,
				data: {
					allNetworkNodes: [
						...blockchain.networkNodes,
						blockchain.currentNodeUrl,
					],
				},
				json: true,
			};

			return axios(bulkRegisterOptions);
		})
		.then((data) => {
			res.json({ note: "New node registered with network successfully." });
		})
		.catch((error) => {
			console.log(error);
			res.status(500).send({
				error: "An error occurred while registering the node with the network.",
			});
		});
});

// >>>>>>>>>>>>>>>SYNCHRONIZATION<<<<<<<<<<<<<<<

// Broadcast New Block to Peers
broadcastNewBlockToPeers = async function () {
	let notification = {
		blocksCount: blockchain.blocks.length,
		cumulativeDifficulty: blockchain.calcCumulativeDifficulty(),
		nodeUrl: currentNodeURL,
	};
	for (let nodeId in node.peers) {
		let peerUrl = peersMap[nodeId];
		console.log(`Notifying peer ${peerUrl} about the new block`);
		axios
			.post(peerUrl + "/peers/notify-new-block", notification)
			.then(function () {})
			.catch(function () {});
	}
};

// Broadcast New Transaction to Peers
broadcastTransactionToPeers = async function (tran) {
	for (let nodeId in peersMap) {
		let peerUrl = peersMap[nodeId];
		console.log(
			`Broadcasting a transaction ${tran.transactionsHash} to peer ${peerUrl}`
		);
		axios
			.post(peerUrl + "/transactions/send", txn)
			.then(function () {})
			.catch(function () {});
	}
};

// Sync the Blockchain from Peer Chain Info
syncBlockchainFromPeerChain = async function (peerChainData) {
	try {
		let thisChainDiff = blockchain.calcCumulativeDifficulty();
		let peerChainDiff = peerChainData.cumulativeDifficulty;
		if (peerChainDiff > thisChainDiff) {
			console.log(
				`Chain sync started. Peer: ${peerChainData.nodeUrl}. Expected chain length = ${peerChainData.blocksCount}, expected cummulative difficulty = ${peerChainDiff}.`
			);
			let blocks = (await axios.get(peerChainData.nodeUrl + "/blocks")).data;
			let chainIncreased = blockchain.processLongerChain(blocks);
			if (chainIncreased) {
				broadcastNewBlockToPeers();
			}
		}
	} catch (err) {
		console.log("Error loading the chain: " + err);
	}
};

syncPendingTxnsFromPeerChain = async function (peerChainData) {
	try {
		if (peerChainData.pendingTransactions > 0) {
			console.log(
				`Pending transactions sync started. Peer: ${peerChainData.nodeUrl}`
			);
			let transactions = (
				await axios.get(peerChainData.nodeUrl + "/transactions/pending")
			).data;
			for (let tran of transactions) {
				let newTransaction = blockchain.addNewTransaction(tran);
				if (newTransaction.transactionDataHash) {
					// Added a new pending tx --> broadcast it to all known peers
					broadcastTransactionToPeers(newTransaction);
				}
			}
		}
	} catch (err) {
		console.log("Error loading the pending transactions: " + err);
	}
};

// Start listening on the specified port
app.listen(port, function () {
	console.log(`Listening on port ${process.argv[2]}...`);
});
