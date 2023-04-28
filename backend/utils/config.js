const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const date = new Date();

date.setDate(date.getDate() - 30);

const GENESIS_DATA = {
	// screen case syntax == hard coded global values
	timestamp: date,
	lastHash: "-----",
	hash: "hash-one",
	difficulty: INITIAL_DIFFICULTY,
	nonce: 0,
	data: [],
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = { address: "*authorized-reward*" };

const MINING_REWARD = 50;

module.exports = {
	GENESIS_DATA,
	MINE_RATE,
	INITIAL_DIFFICULTY,
	STARTING_BALANCE,
	REWARD_INPUT,
	MINING_REWARD,
};
