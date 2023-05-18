const Config = require("./utils/config");
const CryptoUtils = require("./utils/cryptoUtils");
const Transaction = require("./transaction");

function Block(
	index,
	transactions,
	difficulty,
	prevBlockHash,
	minedBy,
	blockDataHash,
	nonce,
	dateCreated,
	// timestamp,
	blockHash,
	blockReward
) {
	this.index = index; // integer
	this.transactions = transactions; // Transaction[]
	this.difficulty = difficulty; // integer
	this.prevBlockHash = prevBlockHash; // hex_number[64]
	this.minedBy = minedBy; // address (40 hex digits)
	this.blockDataHash = blockDataHash; // address (40 hex digits)

	// Calculate the block data hash if it is missing
	if (this.blockDataHash === undefined) this.calcBlockDataHash();

	this.nonce = nonce; // integer
	this.dateCreated = dateCreated || Config.genesisDate; // ISO8601_string
	// this.timestamp = timestamp; // Unix timestamp
	this.blockHash = blockHash; // hex_number[64]
	if (!blockHash) this.calculateBlockHash();

	this.blockReward = blockReward; // integer
}

// Calculate Block Data Hash
Block.prototype.calcBlockDataHash = function () {
	let blockData = {
		index: this.index,
		transactions: this.transactions.map((transaction) =>
			Object({
				from: transaction.from,
				to: transaction.to,
				value: transaction.value,
				fee: transaction.fee,
				dateCreated: transaction.dateCreated,
				// timestamp: transaction.dateCreated.getTime(),
				data: transaction.data,
				senderPubKey: transaction.senderPubKey,
				transactionDataHash: transaction.transactionDataHash,
				senderSignature: transaction.senderSignature,
				minedInBlockIndex: transaction.minedInBlockIndex,
				transferSuccessful: transaction.transferSuccessful,
			})
		),
		difficulty: this.difficulty,
		prevBlockHash: this.prevBlockHash,
		minedBy: this.minedBy,
	};
	let blockDataJSON = JSON.stringify(blockData);
	this.blockDataHash = CryptoUtils.sha256(blockDataJSON);
};

// Calculate Block Hash
Block.prototype.calculateBlockHash = function () {
	this.blockHash = CryptoUtils.sha256(
		this.blockDataHash + this.nonce + this.dateCreated
	).toString();
};

// Genesis Block
Block.genesisBlock = function () {
	if (Config.currentNodeURL === Config.genesisNodeURL) {
		const genesisBlock = new Block(
			0, // block index
			[Transaction.initialFaucetTransaction()], // transactions
			0, // current difficulty
			undefined, // prevBlockHash
			Config.minerAddress, // minedBy
			undefined, // blockDataHash
			0, // nonce
			Config.genesisDate, // dateCreated
			0, // blockHash
			5 // mining reward
		);

		return [genesisBlock];
	} else {
		return;
	}
};

module.exports = Block;
