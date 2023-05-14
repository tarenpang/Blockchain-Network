const CryptoUtils = require("./cryptoUtils");
const Transaction = require("../transaction");
const Block = require("../block");

const initialDifficulty = 5;
const genesisDate = new Date(new Date().setDate(new Date().getDate() - 15));
const genesisTimestamp = new Date(
	new Date().setDate(new Date().getDate() - 15)
).getTime();
const blockReward = 5;
const host = "http://localhost";
const port = process.argv[2];
const currentNodeURL = `${host}:${port}`;
const genesisNodeURL = "http://localhost:3555";

// Genesis Data
const genesisData =
	"bbb2ec9588c98a8410010bd7ccd4ab3a2b25b3cd5182b81250f19a00a103bb9d";

// Null Address, Public Key, and Signature
const nullAddress = "0000000000000000000000000000000000000000";
const nullPubKey =
	"00000000000000000000000000000000000000000000000000000000000000000";
const nullSignature = [
	"00000000000000000000000000000000000000000000000000000000000000000",
	"00000000000000000000000000000000000000000000000000000000000000000",
];

// Faucet Private Key, Public Key, and Address
const faucetPrivKey =
	"3313b06752cd6276f9deb4fefef6f17e904b194808ea9dcf61f1125528b7f74a";
const faucetPubKey = CryptoUtils.privKeyToPubKey(faucetPrivKey);
const faucetAddress = CryptoUtils.pubKeyToAddress(faucetPubKey);

// Miner Private Key, Public Key, and Address
const minerPrivKey =
	"4aa83695f9f2552103281f266ea79de6611250a5d0e1ce1d3c00d39a453fa1c5";
const minerPubKey = CryptoUtils.privKeyToPubKey(faucetPrivKey);
const minerAddress = CryptoUtils.pubKeyToAddress(faucetPubKey);

const genesisFaucetTransaction = new Transaction(
	nullAddress, // from address
	faucetAddress, // to Address
	1000000000000, // value of transfer
	5, // fee for mining
	genesisDate, // dateCreated
	genesisData, // data (payload)
	nullPubKey, // senderPubKey
	undefined, // transactionDataHash
	nullSignature, // senderSignature
	0, // minedInBlockIndex
	true // transferSuccessful
);

const genesisBlock = new Block(
	0, // block index
	[genesisFaucetTransaction], // transactions array
	0, // currentDifficulty
	undefined, // previous block hash
	minerAddress, // mined by (address)
	undefined, // block data hash
	0, // nonce
	genesisDate, // date created
	undefined, // block hash
	0 // mining reward
);

const blockchainId = genesisBlock.blockHash;

// generate unique id using datetime and random number
const generateUniqueId = () => {
	const date = new Date();
	const random = Math.random().toString(36).substring(2, 15);
	return `${date.getTime()}-${random}`;
};

const nodeId = generateUniqueId();

module.exports = {
	blockchainId,
	blockReward,
	currentNodeURL,
	defaultServerHost: "localhost",
	defaultServerPort: 5555,
	faucetAddress,
	faucetPrivKey,
	faucetPubKey,
	generateUniqueId,
	genesisBlock,
	genesisDate,
	genesisData,
	genesisTimestamp,
	genesisNodeURL,
	initialDifficulty,
	minerPrivKey,
	minerPubKey,
	minerAddress,
	minTransactionFee: 1,
	maxTransactionFee: 1000000,
	maxTransferValue: 10000000000000,
	nodeId,
	nullAddress,
	nullPubKey,
	nullSignature,
	safeConfirmCount: 3,
};
