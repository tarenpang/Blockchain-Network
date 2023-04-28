const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("./utils/config");
path;
const { cryptoHash } = require("./utils/crypto-utils");

class Block {
	constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty;
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
}
// const genesis = (module.exports = Block);

// const block1 = new Block({
// 	lastHash: 'foo-lastHash',
// 	hash: 'foo-hash',
// 	data: 'foo-data',
// 	timestamp: '01/01/01',
// });

// console.log('block1', block1);

module.exports = Block;
