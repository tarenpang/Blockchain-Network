const Config = require("./utils/config");
const CryptoUtils = require("./utils/cryptoUtils");

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
		if (this.blockDataHash === undefined) this.calculateBlockDataHash();

		this.nonce = nonce; // integer
		this.dateCreated = dateCreated; // ISO8601_string
		this.blockHash = blockHash; // hex_number[64]

		// Calculate the block hash if it is missing
		if (this.blockHash === undefined) this.calculateBlockHash();

		this.blockReward = blockReward; // integer
	}

	// static genesis() {
	// 	return new Block(GENESIS_DATA);
	// }

	// static mineBlock({ lastBlock, data }) {
	// 	let hash, timestamp;
	// 	// const timestamp = Date.now();
	// 	const lastHash = lastBlock.hash;
	// 	let { difficulty } = lastBlock;
	// 	let nonce = 0;

	// 	do {
	// 		nonce++;
	// 		timestamp = Date.now();
	// 		difficulty = Block.adjustDifficulty({
	// 			originalBlock: lastBlock,
	// 			timestamp,
	// 		});
	// 		hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
	// 	} while (
	// 		hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
	// 	);

	// 	return new this({ timestamp, lastHash, data, difficulty, nonce, hash });
	// }

	// static adjustDifficulty({ originalBlock, timestamp }) {
	// 	const { difficulty } = originalBlock;

	// 	if (difficulty < 1) return 1;

	// 	if (timestamp - originalBlock.timestamp > MINE_RATE) return difficulty - 1;

	// 	return difficulty + 1;
	// }

	calculateBlockDataHash() {
		let blockData = {
			index: this.index,
			transactions: this.transactions.map((trans) =>
				Object({
					from: trans.from,
					to: trans.to,
					value: trans.value,
					fee: trans.fee,
					dateCreated: trans.dateCreated,
					data: trans.data,
					senderPubKey: trans.senderPubKey,
					transactionDataHash: trans.transactionDataHash,
					senderSignature: trans.senderSignature,
					minedInBlockIndex: trans.minedInBlockIndex,
					transferSuccessful: trans.transferSuccessful,
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

Block.genesisBlock = function () {
	if (Config.currentNodeURL === Config.genesisNodeURL) {
		const genesisBlock = new Block(
			0, // index
			// [Transaction.genesisFaucetTransaction()], // transactions
			0, // difficulty
			0, // prevBlockHash
			Config.nullMinerAddress, // minedBy
			0, // blockDataHash
			0, // nonce
			Config.genesisDate, // dateCreated
			0 // blockHash
		);

		return [genesisBlock];
	} else {
		return;
	}
};

module.exports = Block;
