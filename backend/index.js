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
const rootNodeUrl = `${host}:5555`;
const currentNodeURL = `${host}:${port}`;
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
		nodeId: nodeId,
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

// Mine the Pending Transactions
app.post("/mine", function (req, res) {
	const { minerAddress, difficulty } = req.body;
	const newBlock = blockchain.mineNextBlock(minerAddress, difficulty);

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

	Promise.all(axiosPromises)
		.then(() => {
			res.json({
				message: "New block mined and broadcasted successfully",
				block: newBlock,
			});
		})
		.catch((err) => res.status(400).json({ error: err.message }));
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

// Connect a Peer
app.post("/peers/connect", (req, res) => {
	const peer = req.body.peerUrl;
	let peerNodeId;
	let peerNodeUrl;

	if (peer === undefined) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			errorMsg: "Request body missing the 'peerUrl:' value",
		});
	}

	// 1. Validate Peer
	axios
		.get(peer + "/info")
		.then(async function (peerInfo) {
			peerInfo = peerInfo.data;
			peerNodeId = peerInfo.nodeId;
			peerNodeUrl = peerInfo.nodeUrl;
			// Avoid connecting to self
			if (peerNodeUrl === Config.currentNodeURL) {
				res.status(StatusCodes.CONFLICT).json({
					errorMsg: "Cannot connect to self.",
				}); // Chain ID's must match
			} else if (peerInfo.blockchainId !== blockchain.blocks[0].blockHash) {
				res.status(StatusCodes.BAD_REQUEST).json({
					errorMsg: "Chain ID's must match",
				}); // Avoid double-connecting to same peer
			} else if (blockchain.peersMap.has(peerNodeId)) {
				res.status(StatusCodes.CONFLICT).json({
					errorMsg: `Already connected to peer: ${peerNodeUrl}`,
				});
			} else {
				// Remove any peer with the same URL
				blockchain.peersMap.forEach((peerUrl, peerId) => {
					if (peerUrl === peerNodeUrl) {
						blockchain.peersMap.delete(peerId);
					}
				});

				// 2. Register new peer with current node
				blockchain.peersMap.set(peerNodeId, peerNodeUrl);

				// 3. Register current node with new peer (bi-directional connection)
				await axios
					.post(peerNodeUrl + "/peers/connect", {
						peerUrl: blockchain.currentNodeURL,
					})
					.then(function () {})
					.catch(function () {});

				let endpoints = [];
				blockchain.peersMap.forEach((peerUrl) => {
					endpoints.push(peerUrl + "/register-broadcast-peer");
				});

				// 4. Broadcast and register peer to all network nodes
				await Promise.all(
					endpoints.map((endpoint) =>
						axios.post(endpoint, { peerNodeId, peerNodeUrl })
					)
				)
					.then(() => {
						// 5. Synchronize chains and transactions
						blockchain.syncBlockchainFromPeerChain(peerInfo);
						blockchain.syncPendingTransactionsFromPeerChain(peerInfo);
					})
					.catch(function (error) {
						console.log("Peer registration error", error);
					});

				// 6. Register all network nodes to new peer
				axios
					.post(peerNodeUrl + "/register-network-to-peer")
					.then(function () {})
					.catch(function () {});

				res.status(StatusCodes.OK).json({
					message: `Successfully connected to peer: ${peerNodeUrl}`,
				});
			}
		})
		.catch((error) => {
			res.status(StatusCodes.BAD_REQUEST).json({
				errorMsg: `Cannot connect to peer: ${peer}`,
			});
		});
});

// Notify Peers about New Block
app.post("/peers/notify-new-block", (req, res) => {
	blockchain.syncBlockchainFromPeerChain(req.body);
	res.json({ message: "Thank you for the notification." });
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
	console.log("peerMapBefore: ", blockchain.peersMap);
	let nodeIdNotUndefined = false;
	const peerNotPreExisting = !blockchain.peersMap.has(nodeId);
	const notCurrentNode = blockchain.currentNodeURL !== currentNodeURL;

	if (nodeId !== undefined) {
		nodeIdNotUndefined = true;
	} else {
		nodeIdNotUndefined = false;
	}

	if (nodeIdNotUndefined && peerNotPreExisting && notCurrentNode) {
		blockchain.peersMap.set(nodeId, currentNodeURL);
	}
	console.log("peerMapAfter: ", blockchain.peersMap);

	res.json({ message: "Peer already registered" });
});

// // >>>>>>>>>> Register the New Node <<<<<<<<<<
const nodeUrl = `http://localhost:${port}`;

axios
	.post(`${nodeUrl}/register-peer`, { nodeUrl })
	.then((res) => {
		console.log(res.data);
	})
	.catch((err) => {
		console.error(`Error registering node: ${err.message}`);
	});

// axios
// 	.post(`${nodeUrl}/register-broadcast-peer`, { nodeUrl })
// 	.then((res) => {
// 		console.log(res.data);
// 	})
// 	.catch((err) => {
// 		console.error(`Error registering node: ${err.message}`);
// 	});

// Start listening on the specified port
app.listen(port, function () {
	console.log(`Listening on port ${process.argv[2]}...`);
});
