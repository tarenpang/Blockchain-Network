const axios = require("axios");
const Config = require("./utils/config");
const Block = require("./block");
const Transaction = require("./transaction");
const CryptoUtils = require("./utils/cryptoUtils");
const ValidationUtils = require("./utils/validationUtils");

function Blockchain() {
	this.blocks = Block.genesisBlock();
	this.pendingTransactions = [];
	this.currentDifficulty = Config.initialDifficulty;
	this.currentNodeUrl = Config.currentNodeUrl;
	this.peersMap = new Map(); // MAP of peer nodes in the network
	if (this.peersMap.size === 0) {
		this.peersMap.set(Config.nodeId, Config.currentNodeURL);
	}
	this.miningJobs = {};
}

// Add New Block to the Blockchain
Blockchain.prototype.addBlock = function (transactionData) {
	let transaction = new Transaction(
		transactionData.from,
		transactionData.to,
		transactionData.value,
		transactionData.fee,
		transactionData.dateCreated,
		transactionData.data,
		transactionData.senderPubKey,
		undefined, // transactionDataHash
		transactionData.senderSignature
	);

	this.pendingTransactions.push(transaction);
	return transaction;
};

// Get Block Given the Block Hash
Blockchain.prototype.getBlock = function (blockHash) {
	let targetBlock = null;
	this.blocks.forEach(block => {
		if (block.blockHash === blockHash) {
			targetBlock = block;
		}
	});
	return targetBlock;
};

// Get Block Given the Block Index
Blockchain.prototype.getBlockByIndex = function (blockIndex) {
	let targetBlock = null;
	this.blocks.forEach(block => {
		if (block.blockIndex === blockIndex) {
			targetBlock = block;
		}
	});
	return targetBlock;
};

// Get Last Block of the Blockchain
Blockchain.prototype.getLastBlock = function () {
	return this.blocks[this.blocks.length - 1];
};

// Add Transaction to the Array of Pending Transactions
Blockchain.prototype.addTransactionToPendingTransactions = function (
	transactionObj
) {
	console.log("transactionObj", transactionObj);
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()["index"] + 1;
};

// Add New Transaction & Push to Pending Txn Pool Given the Txn Data
Blockchain.prototype.addNewTransaction = function (txnData) {
	// Validate the transaction data
	// const isValidTransaction = this.validateTransaction(txnData);
	// if (isValidTransaction.errorMsg) return isValidTransaction;
	// Validate the transaction & add it to the pending transactions
	if (!ValidationUtils.isValidAddress(txnData.from))
		return { errorMsg: "Invalid sender address: " + txnData.from };
	if (!ValidationUtils.isValidAddress(txnData.to))
		return { errorMsg: "Invalid recipient address: " + txnData.to };
	if (!ValidationUtils.isValidPublicKey(txnData.senderPubKey))
		return { errorMsg: "Invalid public key: " + txnData.senderPubKey };
	let senderAddr = CryptoUtils.pubKeyToAddress(txnData.senderPubKey);
	if (senderAddr !== txnData.from)
		return { errorMsg: "The public key should match the sender address" };
	if (!ValidationUtils.isValidTransferValue(txnData.value))
		return { errorMsg: "Invalid transfer value: " + txnnData.value };
	if (!ValidationUtils.isValidTransferFee(txnData.fee))
		return { errorMsg: "Invalid transaction fee: " + txnData.fee };
	if (!ValidationUtils.isValidDate(txnData.dateCreated))
		return { errorMsg: "Invalid date: " + txnData.dateCreated };
	if (!ValidationUtils.isValidSignature(txnData.senderSignature))
		return {
			errorMsg:
				'Invalid or missing signature. Expected signature format: ["hexnum", "hexnum"]',
		};

	let newTrans = new Transaction(
		txnData.from,
		txnData.to,
		txnData.value,
		txnData.fee,
		txnData.dateCreated,
		txnData.data,
		txnData.senderPubKey,
		txnData.transactionDataHash, // transactionDataHash
		txnData.senderSignature
	);

	// Check for Duplicate Transactions
	if (this.getTransactionByDataHash(newTrans.transactionDataHash))
		return {
			errorMsg: "Duplicated transaction: " + newTrans.transactionDataHash,
		};

	if (!newTrans.verifySignature())
		return { errorMsg: "Invalid signature: " + txnData.senderSignature };

	// Check for Sufficient Sender Balance
	let balances = this.getAccountBalance(newTrans.from);
	if (
		Number(balances.confirmedBalance) <
		Number(newTrans.value) + Number(newTrans.fee)
	)
		return {
			errorMsg: "Unsufficient sender balance.",
		};

	this.pendingTransactions.push(newTrans);

	return newTrans;
};

// Get Transaction Given the Transaction Data Hash
Blockchain.prototype.getTransactionByDataHash = function (txnHash) {
	const allTransactions = this.getAllTransactions();
	let targetTransaction = allTransactions.filter(
		transaction => transaction.transactionDataHash === txnHash
	);

	return targetTransaction[0];
};

// Add New Transaction to the Array of Pending Transactions
Blockchain.prototype.addNewTxnToPendingTxns = function (transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()["index"] + 1;
};

// Get All Transactions in the Blockchain
Blockchain.prototype.getAllTransactions = function () {
	let transactions = this.getConfirmedTransactions();
	transactions.push.apply(transactions, this.pendingTransactions);
	return transactions;
};

// Get Confirmed Transactions in the Blockchain
Blockchain.prototype.getConfirmedTransactions = function () {
	let transactions = [];
	for (let block of this.blocks) {
		transactions.push.apply(transactions, block.transactions);
	}
	return transactions;
};

// Add New Transaction to the Array of Pending Transactions
Blockchain.prototype.addNewTransactionToPendingTransactions = function (
	transactionObject
) {
	this.pendingTransactions.push(transactionObject); // Add to pending transactions pool

	return this.getLastBlockOnChain().index + 1; // Return index of the next block on blockchain
};

// Get All Pending Transactions
Blockchain.prototype.getPendingTransactions = function () {
	return this.pendingTransactions;
};

// Get Transaction History Given the Address
Blockchain.prototype.getTransactionHistory = function (address) {
	if (!ValidationUtils.isValidAddress(address))
		return { errorMsg: "Invalid address" };

	const transactions = this.getAllTransactions();
	let transactionsByAddress = transactions.filter(
		transaction => transaction.from === address || transaction.to === address
	);
	// // Sort the transactions by date
	// transactionsByAddress.sort((a, b) =>
	// 	a.dateCreated.localeCompare(b.dateCreated)
	// );

	return transactionsByAddress;
};

// Get a Block's Transactions Given the Block Hash
Blockchain.prototype.getBlockTransactions = function (blockHash) {
	let targteBlockTxns = null;
	this.blocks.forEach(block => {
		if (block.blockHash === blockHash) {
			targetBlockTxns = block.transactions;
		}
	});
	return targetBlockTxns;
};

// Get Transaction Given the Transaction Hash
Blockchain.prototype.getTransactionByTxnHash = function (transactionHash) {
	let targetTransaction = null;
	let targetBlock = null;

	// confirmed transactions
	this.blocks.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.transactionDataHash === transactionHash) {
				targetTransaction = transaction;
				targetBlock = block;
			}
		});
	});

	// pending transactions
	this.pendingTransactions.forEach(transaction => {
		if (transaction.transactionDataHash === transactionHash) {
			targetTransaction = transaction;
		}
	});

	if (!targetTransaction) {
		return null;
	} else {
		return { transaction: targetTransaction, block: targetBlock };
	}
};

// Validate Transaction
Blockchain.prototype.validateTransaction = function (txnData) {
	const missingFields = ValidationUtils.isMissingFields(txnData);
	if (missingFields) return { errorMsg: missingFields };

	const invalidFields = ValidationUtils.isValidFieldValues(txnData);
	if (invalidFields) return { errorMsg: invalidFields };

	const isValidRecipient = ValidationUtils.isValidAddress(txnData.to);
	if (!isValidRecipient) return { errorMsg: "Invalid Recipient Address" };

	const isValidTransferValue = ValidationUtils.isValidTransferValue(
		txnData.value
	);
	if (!isValidTransferValue) return { errorMsg: "Invalid transfer value" };

	const isValidTransferFee = ValidationUtils.isValidTransferFee(txnData.fee);
	if (!isValidTransferFee) return { errorMsg: "Invalid transfer fee" };

	const isValidPublicKey = ValidationUtils.isValidPublicKey(
		txnData.senderPubKey
	);
	if (!isValidPublicKey) return { errorMsg: "Invalid Public Key" };

	if (txnData.transactionDataHash) {
		const recalculatedDataHash = CryptoUtils.calcTransactionDataHash(
			txnData.from,
			txnData.to,
			txnData.value,
			txnData.fee,
			txnData.dateCreated,
			txnData.data,
			txnData.senderPubKey
		);

		if (txnData.transactionDataHash !== recalculatedDataHash) {
			return { errorMsg: "Invalid data hash" };
		}

		const isValidSender = ValidationUtils.isValidAddress(txnData.from);
		if (!isValidSender) return { errorMsg: "Invalid Sender Address" };

		const signature = txnData.senderSignature;
		const isValidSignature = ValidationUtils.isValidSignature(signature);
		if (!isValidSignature) return { errorMsg: "Invalid Signature" };

		if (
			!CryptoUtils.verifySignature(
				txnData.transactionDataHash,
				txnData.senderPubKey,
				txnData.senderSignature
			)
		) {
			return { errorMsg: `Signature failed verification: ${signature}` };
		}

		const transactionDataHash = txnData.transactionDataHash;
		const checkForCollisions =
			this.getTransactionByTxnHash(transactionDataHash);
		if (checkForCollisions) {
			return { errorMsg: `Duplicate transaction: ${transactionDataHash}` };
		}
	}

	return true;
};

// Remove Invalid Transactions from the Array of Pending Transactions
Blockchain.prototype.removePendingTransactions = function (txnsToRemove) {
	let transactionHashesToRemove = new Set();
	for (let t of transactionHashesToRemove)
		txnHashesToRemove.add(t.transactionDataHash);
	this.pendingTransactions = this.pendingTransactions.filter(
		t => !transactionHashesToRemove.has(t.transactionDataHash)
	);
};

// Calculate the Cumulative Difficulty of the Blockchain
Blockchain.prototype.calcCumulativeDifficulty = function () {
	let difficulty = 0;
	for (let block of this.blocks) {
		difficulty += 16 ** block.difficulty;
	}
	return difficulty;
};

// Hash the Block Given the Block Data
Blockchain.prototype.hashBlock = function (
	previousBlockHash,
	currentBlockData,
	nonce
) {
	const dataAsString =
		previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = CryptoUtils.sha256(dataAsString);
	return hash;
};

// Check If the Blockchain is Valid
Blockchain.prototype.chainIsValid = function (blockchain) {
	let validChain = true;

	for (let i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i - 1];

		// Check if the hash (data) of the current block is correct
		const blockHash = this.hashBlock(
			previousBlock["hash"],
			{
				transactions: currentBlock["transactions"],
				index: currentBlock["index"],
			},
			currentBlock["nonce"]
		);
		if (blockHash.substring(0, 4) !== this.difficulty) {
			validChain = false;
		}

		// Check if the previous block hash is correct
		if (currentBlock["previousBlockHash"] !== previousBlock["hash"]) {
			validChain = false;
		}
	}

	// Check if the genesis block is valid
	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock["nonce"] === 0;
	const correctPreviousBlockHash = genesisBlock["previousBlockHash"] === "0";
	const correctHash = genesisBlock["hash"] === "0";
	const correctTransactions = genesisBlock["transactions"].length === 0;
	if (
		!correctNonce ||
		!correctPreviousBlockHash ||
		!correctHash ||
		!correctTransactions
	) {
		validChain = false;
	}

	return validChain;
};

// Get the Mining Job for the Next Block
Blockchain.prototype.getMiningJob = function (minerAddress) {
	let nextBlockIndex = this.blocks.length;

	// Deep clone all pending transactions & sort them by fee
	let transactions = JSON.parse(JSON.stringify(this.pendingTransactions));
	transactions.sort((a, b) => b.fee - a.fee); // sort descending by fee

	// Prepare the coinbase transaction -> it will collect all tx fees
	let coinbaseTransaction = new Transaction(
		Config.nullAddress, // from (address)
		minerAddress, // to (address)
		Config.blockReward, // value (of transfer)
		0, // fee (for mining)
		new Date().toISOString(), // dateCreated
		"coinbase tx", // data (payload / comments)
		Config.nullPubKey, // senderPubKey
		undefined, // transactionDataHash
		Config.nullSignature, // senderSignature
		nextBlockIndex, // minedInBlockIndex
		true
	);

	// Execute all pending transactions (after paying their fees)
	// Transfer the requested values if the balance is sufficient
	let balances = this.calcAllConfirmedBalances();
	for (let tran of transactions) {
		balances[tran.from] = balances[tran.from] || 0;
		balances[tran.to] = balances[tran.to] || 0;
		if (balances[tran.from] >= tran.fee) {
			tran.minedInBlockIndex = nextBlockIndex;

			// The transaction sender pays the processing fee
			balances[tran.from] -= tran.fee;
			coinbaseTransaction.value += tran.fee;

			// Transfer the requested value: sender -> recipient
			if (balances[tran.from] >= tran.value) {
				balances[tran.from] -= tran.value;
				balances[tran.to] += tran.value;
				tran.transferSuccessful = true;
			} else {
				tran.transferSuccessful = false;
			}
		} else {
			// The transaction cannot be mined due to insufficient
			// balance to pay the transaction fee -> drop it
			this.removePendingTransactions([tran]);
			transactions = transactions.filter(t => t !== tran);
		}
	}

	// Insert the coinbase transaction, holding the block reward + tx fees
	coinbaseTransaction.calculateDataHash();
	transactions.unshift(coinbaseTransaction);

	// Prepare Next Block Candidate
	let prevBlockHash = this.blocks[this.blocks.length - 1].blockHash;
	let blockReward = Config.blockReward;
	let nextBlockCandidate = new Block(
		nextBlockIndex, // index (integer)
		transactions, // transactions (array)
		this.currentDifficulty, // difficulty (integer)
		prevBlockHash, // prevBlockHash (hex_number[64])
		minerAddress, // minedBy (address -> 40 hex digits)
		undefined,
		blockReward // integer
	);

	this.miningJobs[nextBlockCandidate.blockDataHash] = nextBlockCandidate;
	return nextBlockCandidate;
};

// Prepare, Mine & Submit the Next Block
Blockchain.prototype.mineNextBlock = function (minerAddress, difficulty) {
	// Prepare the next block for mining
	let oldDifficulty = this.currentDifficulty;
	this.currentDifficulty = difficulty;
	let nextBlock = this.getMiningJob(minerAddress);
	this.currentDifficulty = oldDifficulty;

	// Mine the next block
	nextBlock.dateCreated = new Date().toISOString();
	nextBlock.nonce = 0;
	do {
		nextBlock.nonce++;
		nextBlock.calculateBlockHash();
		console.log("nonce: ", nextBlock.nonce);
		console.log("blockHash: ", nextBlock.blockHash);
	} while (!ValidationUtils.isValidDifficulty(nextBlock.blockHash, difficulty));

	// Submit the mined block
	let newBlock = this.submitMinedBlock(
		nextBlock.blockDataHash,
		nextBlock.dateCreated,
		nextBlock.nonce,
		nextBlock.blockHash
	);
	return newBlock;
};

// Submit a Mined Block
Blockchain.prototype.submitMinedBlock = function (
	blockDataHash,
	dateCreated,
	nonce,
	blockHash
) {
	// Find the block candidate by its data hash
	let newBlock = this.miningJobs[blockDataHash];
	if (newBlock === undefined)
		return { errorMsg: "Block not found or already mined" };

	// Build the new block
	newBlock.dateCreated = dateCreated;
	newBlock.nonce = nonce;
	newBlock.calculateBlockHash();

	let blockReward = Config.blockReward;
	newBlock.blockReward = blockReward;

	// Validate the block hash + the proof of work
	if (newBlock.blockHash !== blockHash)
		return { errorMsg: "Block hash is incorrectly calculated" };
	if (
		!ValidationUtils.isValidDifficulty(newBlock.blockHash, newBlock.difficulty)
	)
		return {
			errorMsg: "The calculated block hash does not match the block difficulty",
		};

	//update local node
	newBlock = this.extendChain(newBlock);

	return newBlock;
};

// Extend the Blockchain if the New Block is Valid
Blockchain.prototype.extendChain = function (newBlock) {
	// Validate Block
	if (newBlock.index !== this.blocks.length)
		return {
			errorMsg: "The submitted block was already mined by someone else",
		};

	let prevBlock = this.blocks[this.blocks.length - 1];
	if (prevBlock.blockHash !== newBlock.prevBlockHash)
		return { errorMsg: "Incorrect prevBlockHash" };

	// Accept the New Block
	this.blocks.push(newBlock);
	this.miningJobs = {}; // Invalidate all mining jobs
	this.pendingTransactions = [];
	return newBlock;
};

// Get the Balance of an Address
Blockchain.prototype.getAccountBalance = function (address) {
	if (!ValidationUtils.isValidAddress(address)) {
		return { errorMsg: "Invalid address" };
	}

	let transactions = this.getTransactionHistory(address);
	// return transactions;
	let balance = {
		safeBalance: 0,
		confirmedBalance: 0,
		pendingBalance: 0,
	};
	for (let tran of transactions) {
		// Determine the number of blocks mined since the transaction was created

		let confimationCount = 0;
		if (typeof tran.minedInBlockIndex === "number") {
			confimationCount = this.blocks.length - tran.minedInBlockIndex;
		}

		// Calculate the address balance
		if (tran.from === address) {
			// Funds spent -> subtract value and fee (FROM)
			if (!tran.transferSuccessful) {
				balance.pendingBalance -= Number(tran.fee);
				balance.pendingBalance -= Number(tran.value);
			}
			if (confimationCount > 0) {
				balance.confirmedBalance -= Number(tran.fee);
				if (tran.transferSuccessful)
					balance.confirmedBalance -= Number(tran.value);
			}
			if (confimationCount >= Config.safeConfirmCount) {
				balance.safeBalance -= Number(tran.fee);
				if (tran.transferSuccessful) balance.safeBalance -= Number(tran.value);
			}
		}
		if (tran.to === address) {
			// Funds received --> add value and fee (TO)
			if (!tran.transferSuccessful)
				balance.pendingBalance += Number(tran.value);
			if (confimationCount > 0) balance.confirmedBalance += Number(tran.value);
			if (
				confimationCount >= Config.safeConfirmCount &&
				tran.transferSuccessful
			)
				balance.safeBalance += Number(tran.value);
		}
	}

	return balance;
};

// Get All Addresses with Transactions within the Blockchain
Blockchain.prototype.getAllAddresses = function () {
	let addresses = new Set();
	this.blocks.forEach(block => {
		block.transactions.forEach(transaction => {
			// Add the transaction to the list if it is from the given address
			addresses.add(transaction.to);
			addresses.add(transaction.from);
			if (transaction.to) {
			}
			if (transaction.from) {
			}
		});
	});
	return Array.from(addresses);
};

// Calculate the Total Balance of All Confirmed Transactions
Blockchain.prototype.calcAllConfirmedBalances = function () {
	let transactions = this.getConfirmedTransactions();
	let balances = {};
	for (let tran of transactions) {
		balances[tran.from] = balances[tran.from] || 0;
		balances[tran.to] = balances[tran.to] || 0;
		balances[tran.from] -= tran.fee;
		if (tran.transferSuccessful) {
			balances[tran.from] -= tran.value;
			balances[tran.to] += tran.value;
		}
	}
	return balances;
};

// Reset the Blockchain
Blockchain.prototype.resetChain = function () {
	this.blocks = [Config.genesisBlock];
	this.miningJobs = {};
	this.pendingTransactions = [];
	this.difficulty = Config.initialDifficulty;
	this.miningJobs = {};
	this.peersMap = new Map();
	this.peersMap.set(this.nodeId, this.nodeUrl);
	this.peers = [];
	this.peers.push(this.nodeUrl);
	this.peersData = {};
	this.peersData[this.nodeId] = this.nodeUrl;
};

// Get Peers Info
Blockchain.prototype.getPeersInfo = function () {
	const peers = this.peersMap.entries();

	let peersObj = {};
	for (let [key, value] of peers) {
		peersObj[`${key}`] = value;
	}
	return peersObj;
};

// Broadcast New Peer to Network
Blockchain.prototype.broadcastNewPeerToNetwork = async function (
	endpoints,
	peerNodeId,
	peerNodeUrl
) {
	await Promise.all(
		endpoints.map(endpoint => axios.post(endpoint, { peerNodeId, peerNodeUrl }))
	)
		.then(function () {})
		.catch(function (error) {
			console.log("Peer registration error", error);
		});
};

// Register All Nodes to Peer
// Alternate Method - Attempt to Fix Async Loop (Not Working)
// Blockchain.prototype.registerAllNodesToPeer = async function (allPeers) {
// 	for (const peerUrl of allPeers) {
// 		try {
// 			const response = await axios.get(peerUrl + "/info");
// 			const peerInfo = response.data;
// 			const peers = peerInfo.peersMap;

// 			for (const id in peers) {
// 				const url = peers[id];
// 				const peerNotPreExisting = !this.peersMap.has(id);
// 				const notCurrentNode = this.currentNodeURL !== url;

// 				if (peerNotPreExisting && notCurrentNode) {
// 					await axios.post(this.currentNodeURL + "/peers/connect", {
// 						peerUrl: peerInfo.nodeUrl,
// 					});
// 					return {
// 						message: "Successfully registered network nodes to new peer",
// 					};
// 				}
// 			}
// 		} catch (error) {
// 			console.log("ERROR:", error);
// 			return { errorMsg: "Error registering network to new peer node." };
// 		}
// 	}
// };

// Register All Nodes to Peer - 2
// Original Method - !!! Flawed Async Loop?
// Issue: axios.get request not completing before moving to next iteration
Blockchain.prototype.registerAllNodesToPeer = async function (allPeers) {
	allPeers.forEach(peerUrl => {
		axios
			.get(peerUrl + "/info")
			.then(data => {
				const peerInfo = data.data;
				const peers = peerInfo.peersMap;

				for (let data in peers) {
					const id = data;
					const url = peers[id];
					const peerNotPreExisting = !this.peersMap.has(id);
					const notCurrentNode = this.currentNodeURL !== url;

					if (peerNotPreExisting && notCurrentNode) {
						axios
							.post(this.currentNodeURL + "/peers/connect", {
								peerUrl: peerInfo.nodeUrl,
							})
							.then(function () {})
							.catch(function () {});

						return {
							message: "Successfully registered network nodes to new peer",
						};
					}
				}
			})
			.catch(error => {
				console.log("ERROR:", error);

				return { errorMsg: "Error registering network to new peer node." };
			});
	});
};

// Broadcast the New Block to All Peers
Blockchain.prototype.broadcastNewBlockToPeers = function () {
	const notification = {
		blocksCount: this.blocks.length,
		cumulativeDifficulty: this.cumulativeDifficulty(),
		nodeUrl: this.currentNodeURL,
	};

	this.peersMap.forEach(peerUrl => {
		axios
			.post(peerUrl + "/peers/notify-new-block", notification)
			.then(function () {})
			.catch(function () {});
	});
};

// Synchronize the Blockchain from Peer Chain
Blockchain.prototype.syncBlockchainFromPeerChain = async function (
	peerChainInfo
) {
	// console.log("peerChainInfo Sync Chain", peerChainInfo);
	// console.log("Cumulative Difficulty", peerChainInfo.cumulativeDifficulty);

	// Check Peer's Cumulative Difficulty in GET /info
	// if (peerChainInfo.cumulativeDifficulty === undefined) {
	//   return { errorMsg: "Peer's cumulative difficulty is undefined" };
	// }

	// Calc and compare cumulative difficulties
	let currentChainCumulativeDifficulty = this.calcCumulativeDifficulty();
	let peerChainCumulativeDifficulty = peerChainInfo.cumulativeDifficulty;

	// Validate Longest Chain & Replace if Valid
	if (peerChainCumulativeDifficulty > currentChainCumulativeDifficulty) {
		try {
			// Get peer blocks
			const peerChainBlocks = (
				await axios.get(peerChainInfo.nodeUrl + "/blocks")
			).data;

			// Validate Chain
			const isValid = this.validateChain(peerChainBlocks);
			if (isValid.errorMsg) return isValid;

			// Recalculate cumulative difficulties
			currentChainCumulativeDifficulty = this.calcCumulativeDifficulty();
			peerChainCumulativeDifficulty = peerChainInfo.cumulativeDifficulty;

			// Sync to peer if they have longer chain
			if (peerChainCumulativeDifficulty > currentChainCumulativeDifficulty) {
				this.blocks = peerChainBlocks;
				this.miningJobs = {};
			}

			this.removePendingTransactions(this.getConfirmedTransactions());

			// NOTIFY PEERS EVERY SYNC (when new block mined or received / longer chain arrival)
			this.broadcastNewBlockToPeers();
		} catch (error) {
			console.error(`Error synchronizing the chain: ${error}`);
			return { errorMsg: error.message };
		}
	}
};

// Validate the Blockchain
Blockchain.prototype.validateChain = function (peerChainBlocks) {
	peerChainBlocks.forEach((block, index) => {
		if (index === 0 && block[index] !== this.blocks[0]) {
			return { errorMsg: "Invalid Chain. Genesis blocks must match" };
		}

		const isValidBlock = this.validateBlock(block);
		if (isValidBlock.errorMsg) return isValidBlock;
	});

	return true;
};

Blockchain.prototype.syncPendingTransactionsFromPeerChain = async function (
	peerChainInfo
) {
	try {
		if (peerChainInfo.pendingTransactions > 0) {
			console.log(
				`Pending transactions sync started. Peer: ${peerChainInfo.nodeUrl}`
			);
			let transactions = (
				await axios.get(peerChainInfo.nodeUrl + "/transactions/pending")
			).data;
			for (let tran of transactions) {
				let addedTran = this.chain.addNewTransaction(tran);
				if (addedTran.transactionDataHash) {
					// Added a new pending tx --> broadcast it to all known peers
					this.broadcastTransactionToPeers(addedTran);
				}
			}
		}
	} catch (err) {
		console.log("Error loading the pending transactions: " + err);
	}
};

// Broadcast New Transaction to Peers
Blockchain.prototype.broadcastTransactionToPeers = async function (
	transaction
) {
	let endpoints = [];
	this.peersMap.forEach(peerUrl => {
		endpoints.push(peerUrl + "/addToPendingTransactions");
	});

	await Promise.all(
		endpoints.map(endpoint => axios.post(endpoint, transaction))
	)
		.then(function () {})
		.catch(function (error) {
			console.log("ERROR:: ", error);
		});
};

module.exports = Blockchain;
