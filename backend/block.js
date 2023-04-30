const Config = require("./utils/config");
const CryptoUtils = require("./utils/cryptoUtils");

function Block(
	index,
	transactions,
	difficulty,
	prevBlockHash,
	minedBy,
	blockDataHash,
	nonce,
	dateCreated,
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
	this.dateCreated = dateCreated; // ISO8601_string
	this.blockHash = blockHash; // hex_number[64]

	// Calculate the block hash if it is missing
	if (this.blockHash === undefined) this.calcBlockHash();

	this.blockReward = blockReward; // integer
}

Block.prototype.calcBlockDataHash = function () {
	let blockData = {
		index: this.index,
		transactions: this.transactions.map((txns) =>
			Object({
				from: txns.from,
				to: txns.to,
				value: txns.value,
				fee: txns.fee,
				dateCreated: txns.dateCreated,
				data: txns.data,
				senderPubKey: txns.senderPubKey,
				transactionDataHash: txns.transactionDataHash,
				senderSignature: txns.senderSignature,
				minedInBlockIndex: txns.minedInBlockIndex,
				transferSuccessful: txns.transferSuccessful,
			})
		),
		difficulty: this.difficulty,
		prevBlockHash: this.prevBlockHash,
		minedBy: this.minedBy,
	};
	let blockDataJSON = JSON.stringify(blockData);
	this.blockDataHash = CryptoUtils.sha256(blockDataJSON);
};

Block.prototype.calcBlockHash = function () {
	let data = `${this.blockDataHash}|${this.dateCreated}|${this.nonce}`;
	this.blockHash = CryptoUtils.sha256(data);
};

module.exports = Block;
