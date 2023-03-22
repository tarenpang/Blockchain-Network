const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
	// screen case syntax == hard coded global values
	timestamp: 1,
	lastHash: '-----',
	hash: 'hash-one',
	difficulty: INITIAL_DIFFICULTY,
	nonce: 0,
	data: [],
};

module.exports = { GENESIS_DATA };
