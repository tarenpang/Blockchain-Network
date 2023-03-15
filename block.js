const { GENESIS_DATA } = require('./config');

class Block {
	constructor({ timestamp, lastHash, hash, data }) {
		this.timestamp = timestamp;
		this.lastHash = lastHash;
		this.hash = hash;
		this.data = data;
	}

	static genesis() {
		return new Block(GENESIS_DATA);
	}

	static mineBlock({ lastBlock, data }) {
		return new this({
			timestamp: Date.now(),
			lastHash: lastBlock.hash,
			data,
		});
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
