const config = require("./utils/config");
const Block = require("./block");
const Transaction = require("./transaction");
const { sha256 } = require("./utils/cryptoUtils");
const ValidationUtils = require("./utils/validationUtils");
const currentNodeUrl = process.argv[3];

function Blockchain() {
	this.chain = [config.genesisBlock];
	this.pendingTransactions = [];
	this.currentDifficulty = config.initialDifficulty;
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];
	this.miningJobs = {};
}

// Add New Block to the Blockchain
Blockchain.prototype.addBlock = function (txnData) {
	let txn = new Transaction(
		txnData.from,
		txnData.to,
		txnData.value,
		txnData.fee,
		txnData.dateCreated,
		txnData.data,
		txnData.senderPubKey,
		undefined, // transactionDataHash
		txnData.senderSignature
	);

	this.pendingTransactions.push(txn);
	return txn;
};

// Get Block Given the Block Hash
Blockchain.prototype.getBlock = function (blockHash) {
	let targetBlock = null;
	this.chain.forEach((block) => {
		if (block.blockHash === blockHash) {
			targetBlock = block;
		}
	});
	return targetBlock;
};

// Get Block Given the Block Index
Blockchain.prototype.getBlockByIndex = function (blockIndex) {
	let targetBlock = null;
	this.chain.forEach((block) => {
		if (block.blockIndex === blockIndex) {
			targetBlock = block;
		}
	});
	return targetBlock;
};

// Get Last Block of the Blockchain
Blockchain.prototype.getLastBlock = function () {
	return this.chain[this.chain.length - 1];
};

// Add Transaction Given the Transacton Data
Blockchain.prototype.addTransaction = function (txnData) {
	// Validate the transaction data
	if (!ValidationUtils.isValidAddress(txnData.from))
		return { errorMsg: "Invalid sender address: " + txnData.from };
	if (!ValidationUtils.isValidAddress(txnData.to))
		return { errorMsg: "Invalid recipient address: " + txnData.to };
	if (!ValidationUtils.isValidPublicKey(txnData.senderPubKey))
		return { errorMsg: "Invalid public key: " + txnData.senderPubKey };
	if (!ValidationUtils.isValidSignature(txnData.senderSignature))
		return {
			errorMsg:
				'Invalid or missing signature. Expected signature format: ["hexnum", "hexnum"]',
		};

	let newTransaction = new Transaction(
		txnData.from,
		txnData.to,
		txnData.value,
		txnData.fee,
		txnData.dateCreated,
		txnData.data,
		txnData.senderPubKey,
		undefined, // transactionDataHash
		txnData.senderSignature
	);

	// Check for duplicate transactions
	if (this.findTransactionByDataHash(tran.transactionDataHash))
		return { errorMsg: "Duplicated transaction: " + tran.transactionDataHash };

	if (!tran.verifySignature())
		return { errorMsg: "Invalid signature: " + tranData.senderSignature };

	let balances = this.getAccountBalance(tran.from);
	if (balances.confirmedBalance < tran.value + tran.fee)
		return { errorMsg: "Unsufficient sender balance at address: " + tran.from };

	this.pendingTransactions.push(newTransaction);

	return newTransaction;
};

// Find Transaction Given the Transaction Data Hash
Blockchain.prototype.findTransactionByDataHash = function (txnDataHash) {
	let allTransactions = this.getAllTransactions();
	let matchingTransactions = allTransactions.filter(
		(txn) => txn.txnDataHash === txnDataHash
	);
	return matchingTransactions[0];
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
	for (let block of this.chain) {
		transactions.push.apply(transactions, block.transactions);
	}
	return transactions;
};

// Get Transaction History of an Address
Blockchain.prototype.getAddressTransactions = function (address) {
	if (!ValidationUtils.isValidAddress(address)) {
		return { errorMsg: "Invalid address" };
	}

	let transactions = this.getAllTransactions();
	let transactionsByAddress = transactions.filter(
		(txn) => txn.from === address || txn.to === address
	);
	return transactionsByAddress;
};

// Get a Block's Transactions Given the Block Hash
Blockchain.prototype.getBlockTransactions = function (blockHash) {
	let targteBlockTxns = null;
	this.chain.forEach((block) => {
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
	this.chain.forEach((block) => {
		block.transactions.forEach((transaction) => {
			if (transaction.transactionDataHash === transactionHash) {
				targetTransaction = transaction;
				targetBlock = block;
			}
		});
	});

	// pending transactions
	this.pendingTransactions.forEach((transaction) => {
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

// Remove Invalid Transactions from the Array of Pending Transactions
Blockchain.prototype.removePendingTransactions = function (txnsToRemove) {
	let tranHashesToRemove = new Set();
	for (let t of txnsToRemove) txnHashesToRemove.add(t.transactionDataHash);
	this.pendingTransactions = this.pendingTransactions.filter(
		(t) => !txnHashesToRemove.has(t.transactionDataHash)
	);
};

// Calculate the Cumulative Difficulty of the Blockchain
Blockchain.prototype.calcCumulativeDifficulty = function () {
	let difficulty = 0;
	for (let block of this.chain) {
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
	const hash = sha256(dataAsString);
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

	// Extend the Blockchain if the New Block is Valid
	Blockchain.prototype.extendChain = function (newBlock) {
		if (newBlock.index !== this.chain.length)
			return {
				errorMsg: "The submitted block was already mined by someone else",
			};

		let prevBlock = this.chain[this.chain.length - 1];
		if (prevBlock.blockHash !== newBlock.prevBlockHash)
			return { errorMsg: "Incorrect prevBlockHash" };

		// The block is correct --> accept it
		this.chain.push(newBlock);
		this.miningJobs = {}; // Invalidate all mining jobs
		this.pendingTransactions = [];
		return newBlock;
	};

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
	let nextBlockIndex = this.chain.length;

	// Deep clone all pending transactions & sort them by fee
	let transactions = JSON.parse(JSON.stringify(this.pendingTransactions));
	transactions.sort((a, b) => b.fee - a.fee); // sort descending by fee

	// Prepare the coinbase transaction -> it will collect all tx fees
	let coinbaseTransaction = new Transaction(
		config.nullAddress, // from (address)
		minerAddress, // to (address)
		config.blockReward, // value (of transfer)
		0, // fee (for mining)
		new Date().toISOString(), // dateCreated
		"coinbase tx", // data (payload / comments)
		config.nullPubKey, // senderPubKey
		undefined, // transactionDataHash
		config.nullSignature, // senderSignature
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
			transactions = transactions.filter((t) => t !== tran);
		}
	}

	// Insert the coinbase transaction, holding the block reward + tx fees
	coinbaseTransaction.calculateDataHash();
	transactions.unshift(coinbaseTransaction);

	// Prepare the next block candidate (block template)
	let prevBlockHash = this.chain[this.chain.length - 1].blockHash;
	let blockReward = config.blockReward;
	let nextBlockCandidate = new Block(
		nextBlockIndex,
		transactions,
		this.currentDifficulty,
		prevBlockHash,
		minerAddress,
		undefined,
		blockReward
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

	let blockReward = config.blockReward;
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
		safeCount: config.safeConfirmCount,
	};
	for (let tran of transactions) {
		// Determine the number of blocks mined since the transaction was created

		let confimationCount = 0;
		if (typeof tran.minedInBlockIndex === "number") {
			confimationCount = this.chain.length - tran.minedInBlockIndex;
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
			if (confimationCount >= config.safeConfirmCount) {
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
				confimationCount >= config.safeConfirmCount &&
				tran.transferSuccessful
			)
				balance.safeBalance += Number(tran.value);
		}
	}

	return balance;
};

// Get the Transactions & Balance of an Address
Blockchain.prototype.getAddressData = function (address) {
	const addressTransactions = [];

	// Get all transactions from the blockchain
	this.chain.forEach((block) => {
		block.transactions.forEach((transaction) => {
			// Add the transaction to the list if it is from the given address
			if (transaction.to === address || transaction.from === address) {
				addressTransactions.push(transaction);
			}
		});
	});
	// Calculate the balance of the given address
	let balance = 0;
	addressTransactions.forEach((transaction) => {
		if (transaction.from === address) {
			balance -= Number(transaction.value);
		} else if (transaction.to === address) {
			balance += Number(transaction.value);
		}
	});
	return {
		transactions: addressTransactions,
		addressBalance: balance,
	};
};

// Get All Addresses with Transactions within the Blockchain
Blockchain.prototype.getAllAddresses = function () {
	let addresses = new Set();
	this.chain.forEach((block) => {
		block.transactions.forEach((transaction) => {
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
		balances[txn.from] = balances[txn.from] || 0;
		balances[txn.to] = balances[txn.to] || 0;
		balances[txn.from] -= txn.fee;
		if (txn.transferSuccessful) {
			balances[txn.from] -= txn.value;
			balances[txn.to] += txn.value;
		}
	}
	return balances;
};

module.exports = Blockchain;
