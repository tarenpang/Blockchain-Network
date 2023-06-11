const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const Blockchain = require("./blockchain");
const Config = require("./utils/config");
const { WebSocket, WebSocketServer } = require("ws");
const http = require("http");
const uuidv4 = require("uuid").v4;

// const nodeId =
// 	new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
const host = "http://localhost";
const port = process.argv[2];
const rootNodeUrl = `${host}:5555`;
const currentNodeURL = `${host}:${port}`;
// const blockchainId = Config.blockchainId;

var corsOptions = {
	origin: "http://localhost:5173",
};

const app = express();
const blockchain = new Blockchain();

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// process.on("warning", (e) => console.warn(e.stack));

// Add Access Control Allow Origin Headers
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "*");
	next();
});

app.get("/", (req, res) => {
	if (!res) {
		res.status(StatusCodes.NOT_FOUND).json({ errorMsg: "Page not found." });
	} else {
		const ExpressListEndpoints = require("express-list-endpoints");
		let endpoints = ExpressListEndpoints(app);
		let listEndpoints = endpoints
			.map(
				endpoint =>
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
	const chainId =
		!blockchain.blocks.length >= 1
			? "Not connected to IndiGOLD Blockchain"
			: blockchain.blocks[0].blockHash;

	res.status(StatusCodes.OK).json({
		about: "IndiGOLD Blockchain Network",
		// nodeId: blockchain.peersMap.keys().next().value,
		nodeId: Config.nodeId,
		blockchainId: chainId,
		nodeUrl: currentNodeURL,
		peersOnNetwork: blockchain.peersMap.size,
		peersMap: blockchain.getPeersInfo(),
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
		nodeId: Config.nodeId,
		selfUrl: Config.currentNodeURL,
		peers: blockchain.getPeersInfo(),
		chain: blockchain.blocks,
		pendingTransactions: blockchain.pendingTransactions,
		currentDifficulty: blockchain.currentDifficulty,
		miningJobs: blockchain.miningJobs,
		confirmedBalances: blockchain.confirmedBalances,
	});
});

// Reset Chain to Genesis Block
app.get("/debug/reset-chain", (req, res) => {
	blockchain.resetChain();
	res.status(StatusCodes.OK).json({
		message: "Chain reset successfully.",
		blockchain: blockchain,
	});
});

// Get All Blocks
app.get("/blocks", (req, res) => {
	res.json(blockchain.blocks);
});

// Get Block by Block Hash
app.get("/block/:blockHash", (req, res) => {
	const blockHash = req.params.blockHash;
	const targetBlock = blockchain.getBlock(blockHash);
	if (targetBlock) res.json(targetBlock);
	else
		res.status(StatusCodes.NOT_FOUND).json({ errorMsg: "Invalid block hash" });
});

// Get Block by Index
// app.get("/block/:index", (req, res) => {
// 	let index = req.params.index;
// 	let block = blockchain.blocks[index];
// 	if (block) res.json(block);
// 	else
// 		res.status(StatusCodes.NOT_FOUND).json({ errorMsg: "Invalid block index" });
// });

// Create a New Transaction
app.post("/transaction", function (req, res) {
	const newTransaction = req.body;
	const blockIndex =
		blockchain.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post("/transactions/send", (req, res) => {
	const requestBody = req.body;
	const newTransaction = blockchain.addNewTransaction(requestBody);

	if (newTransaction.errorMsg) {
		res.json(newTransaction.errorMsg);
		return;
	}

	if (newTransaction.transactionDataHash) {
		// ADD NEW TRANSACTION TO PENDING TRANSACTIONS
		axios
			.post(
				blockchain.currentNodeURL + "/addToPendingTransactions",
				newTransaction
			)
			.then(() => {
				// BROADCAST TRANSACTION TO PEERS
				blockchain.broadcastTransactionToPeers(newTransaction);
			})
			.catch(error => console.log("Error::", error));

		res.status(StatusCodes.CREATED).json({
			message: "Transaction created/broadcast successfully.",
			transactionID: newTransaction.transactionDataHash,
			transaction: newTransaction,
		});
	} else res.status(StatusCodes.BAD_REQUEST).json(newTransaction);
});

// Get All Transactions
app.get("/transactions/all", (req, res) => {
	res.status(StatusCodes.OK).json(blockchain.getAllTransactions());
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
app.get("/transactions/:txnHash", (req, res) => {
	let transactionHash = req.params.txnHash;
	let transaction = blockchain.getTransactionByDataHash(transactionHash);
	if (transaction) res.json(transaction);
	else
		res
			.status(StatusCodes.NOT_FOUND)
			.json({ errorMsg: "Invalid transaction hash" });
});

// Add Transaction to Pending Transactions
app.post("/addToPendingTransactions", (req, res) => {
	const transactionObject = req.body;
	const pendingTransactions = blockchain.getPendingTransactions();
	let duplicateTransactionCount = 0;

	pendingTransactions.forEach(transaction => {
		if (
			transaction.transactionDataHash === transactionObject.transactionDataHash
		) {
			duplicateTransactionCount += 1;
		}
	});

	if (duplicateTransactionCount === 0) {
		// Add transaction to transaction pool and receive next block's index
		const nextBlock =
			blockchain.addNewTransactionToPendingTransactions(transactionObject);

		res.json({ message: `Transaction will be added to block ${nextBlock}` });
	}
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

// Mine the Pending Transactions
app.post("/mine", function (req, res) {
	const { minerAddress, difficulty } = req.body;
	const newBlock = blockchain.mineNextBlock(minerAddress, difficulty);
	console.log("newBlock: ", newBlock);

	// broadcast the new block to other nodes using WebSocket
	wsServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ nonce: newBlock.nonce }));
			client.send(JSON.stringify({ isValid: newBlock.isValid }));
		}
	});

	// broadcast the new block to other nodes
	const axiosPromises = [];
	blockchain.peersMap.forEach((url, nodeId) => {
		const requestOptions = {
			url: `${url}/blockchain/add-block`,
			method: "POST",
			data: { newBlock },
			headers: { "Content-Type": "application/json" },
		};
		axiosPromises.push(axios(requestOptions));
	});
	console.log("axiosPromises: ", axiosPromises);

	Promise.all(axiosPromises)
		.then(() => {
			res.json({
				message: "New block mined and broadcasted successfully",
				block: newBlock,
			});
		})
		.catch(err => res.status(400).json({ error: err.message }));
});

app.post("/blockchain/add-block", function (req, res) {
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

// Get Mining Job
app.get("/mining/get-mining-job/:miner-address", (req, res) => {
	let address = req.params.minerAddress;
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
	const peers = blockchain.getPeersInfo();
	res.status(StatusCodes.OK).json(peers);
});

// Connect an Adjacent  Peer
app.post("/peers/connect", async (req, res) => {
	const peer = req.body.peerUrl;
	let peerNodeId;
	let peerNodeUrl;

	if (peer === undefined)
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ errorMsg: "Request body missing the 'peerUrl:' value" });

	try {
		const result = await axios.get(peer + "/info");
		const peerInfo = result.data;
		peerNodeId = peerInfo.nodeId;
		peerNodeUrl = peerInfo.nodeUrl;
		const blockchainId = peerInfo.blockchainId;

		if (peerNodeUrl === Config.currentNodeURL) {
			return res
				.status(StatusCodes.CONFLICT)
				.json({ errorMsg: "Cannot connect to self" });
		} else if (
			blockchain.peersMap.has(peerNodeId) ||
			blockchain.peersMap.has(peerNodeUrl)
		) {
			// If already connected, continue with the synchronization
			pushNodesToPeer(peersMap);
			return res
				.status(StatusCodes.CONFLICT)
				.json({ errorMsg: `Already connected to peer: ${peerNodeUrl}` });
		} else if (blockchainId !== blockchain.blocks[0].blockHash) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ errorMsg: `Chain ID's must match` });
		}

		// Remove all peers with the same URL + add the new peer
		blockchain.peersMap.forEach((peerUrl, peerId) => {
			if (peerUrl === peerNodeUrl) {
				blockchain.peersMap.delete(peerId);
			}
		});

		// Register new peer with current node
		blockchain.peersMap.set(peerNodeId, peerNodeUrl);

		// Register current node bi-directionally with new peer node
		await axios.post(peerNodeUrl + "/peers/connect", {
			peerUrl: Config.currentNodeURL,
		});

		pushNodesToPeer(blockchain.peersMap);

		// Synchronize chains and transactions
		blockchain.syncBlockchainFromPeerChain(peerInfo);
		blockchain.syncPendingTransactionsFromPeerChain(peerInfo);

		// Register all network nodes to new peer
		await axios.post(peerNodeUrl + "/register-network-to-peer");

		return res.status(StatusCodes.OK).json({
			message: `Successfully connected to peer: ${peerNodeUrl}`,
		});
	} catch (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ errorMsg: `Unable to connect to peer: ${peer} ` });
	}

	function pushNodesToPeer(nodesMap) {
		const endpoints = [];
		nodesMap.forEach(peerUrl => {
			endpoints.push(peerUrl + "/register-broadcast-peer");
		});

		// Broadcast and register peer to all network nodes
		return Promise.all(
			endpoints.map(endpoint =>
				axios.post(endpoint, { peerNodeId, peerNodeUrl })
			)
		).catch(function (error) {
			console.log("Peer registration error", error);
		});
	}
});

// Notify Peers about New Block
app.post("/peers/notify-new-block", (req, res) => {
	blockchain.syncBlockchainFromPeerChain(req.body);
	res.status(StatusCodes.OK).json({ message: "Notification received." });
});

// Register a New Peer
app.post("/register-peer", function (req, res) {
	const nodeUrl = `http://localhost:${process.argv[2]}`;
	// console.log("nodeUrl: ", nodeUrl);

	// Check if nodeUrl already exists in Peers map
	if (blockchain.peersMap[nodeUrl]) {
		console.log(`Error registering node: ${nodeUrl} is already in the network`);
		return res.sendStatus(StatusCodes.BAD_REQUEST);
	}

	// Add New peer to the Current Node Peers Map
	// blockchain.peersMap[nodeUrl] = nodeId;
	let firstKey = blockchain.peersMap.keys().next().value;
	blockchain.peersMap.delete(firstKey);

	blockchain.peersMap.set(nodeId, nodeUrl);

	// Send a successful response
	res.json({ nodeId: nodeId });

	console.log(
		`Node registered successfully. Node ID: ${nodeId}, Node URL: ${nodeUrl}`
	);
});

// Register and Broadcast Peer to the Network
app.post("/register-broadcast-peer", (req, res) => {
	const peerId = req.body.peerNodeId;
	const peerUrl = req.body.peerNodeUrl;

	const peerNotPreExisting = !blockchain.peersMap.has(peerId);
	const notCurrentNode = blockchain.currentNodeURL !== peerUrl;

	if (peerNotPreExisting && notCurrentNode) {
		blockchain.peersMap.set(peerId, peerUrl);
	}

	res.json({ message: "Peer already registered" });
	// res.json({ errorMsg: `peerId: ${peerId}` });
});

// Register Network To the Peer
app.post("/register-network-to-peer", (req, res) => {
	const allPeers = blockchain.peersMap;

	const networkRegistered = blockchain.registerAllNodesToPeer(allPeers);

	res.json(networkRegistered);
});

// Consensus - Replace Chain with Longest Valid Chain
app.get("/consensus", function (req, res) {
	const requestPromises = [];

	// get all network nodes and make a request to each one
	blockchain.peersMap.forEach(peerNodeUrl => {
		const requestOptions = {
			url: peerNodeUrl + "/blockchain",
			method: "GET",
			json: true,
		};

		requestPromises.push(axios(requestOptions));
	});

	Promise.all(requestPromises)
		.then(responses => {
			const blockchains = responses.map(response => response.data);

			// check if the length of the blockchains is greater than our current node blockchain
			const currentChainLength = blockchain.blocks.length;
			let maxChainLength = currentChainLength;
			let newLongestChain = null;
			let newPendingTransactions = null;

			blockchains.forEach(blockchain => {
				if (blockchain.blocks.length > maxChainLength) {
					maxChainLength = blockchain.blocks.length;
					newLongestChain = blockchain.blocks;
					newPendingTransactions = blockchain.pendingTransactions;
				}
			});

			if (!newLongestChain) {
				res.json({
					message: "Current chain has not been replaced",
					chain: blockchain.blocks,
				});
			} else {
				blockchain.blocks = newLongestChain;
				blockchain.pendingTransactions = newPendingTransactions;
				res.json({
					message: "This chain has been replaced",
					chain: blockchain.blocks,
				});
			}
		})
		.catch(err => res.status(400).json({ error: err.message }));
});

// Register the New Node
// const nodeUrl = `http://localhost:${port}`;

// app.listen(Config.defaultServerPort, async function () {
// 	if (blockchain.currentNodeURL !== Config.genesisNodeURL) {
// 		// New nodes receive genesis block
// 		await axios
// 			.get(Config.genesisNodeURL + "/blocks")
// 			.then(genesisChain => {
// 				genesisChain = genesisChain.data;
// 				blockchain.blocks = [genesisChain[0]];
// 			})
// 			.catch(error => console.error("ERROR: ", error));
// 	}

// 	console.log(`Listening on port ${process.argv[2]}...`);
// });

// Instantiate the HTTP Server and the WebSocket Server Object
const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });
server.listen(port, async function () {
	if (blockchain.currentNodeURL !== Config.genesisNodeURL) {
		// New nodes receive genesis block
		await axios
			.get(Config.genesisNodeURL + "/blocks")
			.then(genesisChain => {
				genesisChain = genesisChain.data;
				blockchain.blocks = [genesisChain[0]];
			})
			.catch(error => console.error("ERROR: ", error));
	}

	console.log(`Listening on port ${process.argv[2]}...`);
});

// Maintain All Active Connections in This Object
const clients = {};
// Maintain All Active Connections in This Object
const users = {};
// Maintain the Current Editor Content
let editorContent = null;
// Create Array for User Activity History
let userActivity = [];

// Event Types
const typesDef = {
	USER_EVENT: "userevent",
	CONTENT_CHANGE: "contentchange",
};

function broadcastMessage(json) {
	// Send the Current Data to All Connected Clients
	const data = JSON.stringify(json);
	for (let userId in clients) {
		let client = clients[userId];
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	}
}

function handleMessage(message, userId) {
	const dataFromClient = JSON.parse(message.toString());
	const json = { type: dataFromClient.type };
	if (dataFromClient.type === typesDef.USER_EVENT) {
		users[userId] = dataFromClient;
		userActivity.push(`${dataFromClient.username} joined to edit the document`);
		json.data = { users, userActivity };
	} else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
		editorContent = dataFromClient.content;
		json.data = { editorContent, userActivity };
	}
	broadcastMessage(json);
}

function handleDisconnect(userId) {
	console.log(`${userId} disconnected.`);
	const json = { type: typesDef.USER_EVENT };
	const username = users[userId]?.username || userId;
	userActivity.push(`${username} left the document`);
	json.data = { users, userActivity };
	delete clients[userId];
	delete users[userId];
	broadcastMessage(json);
}

// A new client connection request received
wsServer.on("connection", function (connection) {
	// Generate a unique code for every user
	const userId = uuidv4();
	console.log("Received a new connection");

	// Store the new connection and handle messages
	clients[userId] = connection;
	console.log(`${userId} connected.`);
	connection.on("message", message => handleMessage(message, userId));
	// User disconnected
	connection.on("close", () => handleDisconnect(userId));
});
