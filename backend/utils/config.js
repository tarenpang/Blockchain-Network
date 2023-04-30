const CryptoUtils = require("./cryptoUtils");

const initialDifficulty = 3;
const genesisDate = "2023-03-21T00:00:00.000Z";
const blockReward = 5000000;

const faucetPrivKey =
	"3313b06752cd6276f9deb4fefef6f17e904b194808ea9dcf61f1125528b7f74a";

const initialFaucetTransaction = {
	from: "0".repeat(40),
	to: "0".repeat(40),
	value: 1000000000000,
	dateCreated: genesisDate,
	data: "genesis tx",
	senderPubKey: "0".repeat(65),
	transactionDataHash: "0".repeat(64),
	senderSignature: ["0".repeat(64), "0".repeat(64)],
	minedInBlockIndex: 0,
	transferSuccessful: true,
};

const genesisBlockData = {
	index: 0,
	transactions: [initialFaucetTransaction],
	difficulty: initialDifficulty,
	prevBlockHash: "0".repeat(64),
	minedBy: "0".repeat(40),
	blockDataHash: "0".repeat(64),
	nonce: 0,
	dateCreated: genesisDate,
	blockHash: "0".repeat(64),
	blockReward: blockReward,
};

module.exports = {
	genesisDate,
	genesisBlockData,
	initialDifficulty,
	blockReward,
};
