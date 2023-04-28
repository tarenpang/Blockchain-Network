const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("./utils/config");
path;
const { cryptoHash } = require("./utils/cryptoUtils");

class Block {
	constructor(
		index,
		transactions,
		difficulty,
		prevBlockHash,
		minedBy,
		blockDataHash,
		nonce,
		dateCreated,
		blockHash
	) {
		this.index = index;
		this.transactions = transactions;
		this.difficulty = difficulty;
		this.prevBlockHash = prevBlockHash;
		this.minedBy = minedBy;
		this.blockDataHash = blockDataHash;

		// Calculate the block data hash if it is missing
		if (this.blockDataHash === undefined) this.calculateBlockDataHash();

		this.nonce = nonce;
		this.dateCreated = dateCreated;
		this.blockHash = blockHash;
	}

	static genesis() {
		return new Block(GENESIS_DATA);
	}

	static mineBlock({ lastBlock, data }) {
		let hash, timestamp;
		// const timestamp = Date.now();
		const lastHash = lastBlock.hash;
		let { difficulty } = lastBlock;
		let nonce = 0;

		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty({
				originalBlock: lastBlock,
				timestamp,
			});
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
		} while (
			hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
		);

		return new this({ timestamp, lastHash, data, difficulty, nonce, hash });
	}

	static adjustDifficulty({ originalBlock, timestamp }) {
		const { difficulty } = originalBlock;

		if (difficulty < 1) return 1;

		if (timestamp - originalBlock.timestamp > MINE_RATE) return difficulty - 1;

		return difficulty + 1;
	}

	calculateBlockDataHash() {
		let blockData = {
			index: this.index,
			transactions: this.transactions.map((txn) =>
				Object({
					from: txn.from,
					to: txn.to,
					value: txn.value,
					fee: txn.fee,
					dateCreated: txn.dateCreated,
					data: txn.data,
					senderPubKey: txn.senderPubKey,
					transactionDataHash: txn.transactionDataHash,
					senderSignature: txn.senderSignature,
					minedInBlockIndex: txn.minedInBlockIndex,
					transferSuccessful: txn.transferSuccessful,
				})
			),
			difficulty: this.difficulty,
			prevBlockHash: this.prevBlockHash,
			minedBy: this.minedBy,
		};
		let blockDataJSON = JSON.stringify(blockData);
		this.blockDataHash = CryptoUtils.sha256(blockDataJSON);
	}

	calculateBlockHash() {
		let data = `${this.blockDataHash}|${this.dateCreated}|${this.nonce}`;
		this.blockHash = CryptoUtils.sha256(data);
	}
}

module.exports = Block;
