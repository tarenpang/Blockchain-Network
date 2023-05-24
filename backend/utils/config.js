const CryptoUtils = require("./cryptoUtils");

const initialDifficulty = 5;
const genesisDate = new Date(new Date().setDate(new Date().getDate() - 15));
const genesisTimestamp = new Date(
  new Date().setDate(new Date().getDate() - 15)
).getTime();
const blockReward = 5;
const host = "http://localhost";
const port = process.argv[2];
// const currentNodeURL = `${host}:${port}`;
const currentNodeURL = process.argv[3];
const genesisNodeURL = "http://localhost:5555";

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
<<<<<<< HEAD
	"6e4edb05c3f086f8aa1bf848a12c82f25c51610f42543e794570bbbb8326f603";
=======
  "6e4edb05c3f086f8aa1bf848a12c82f25c51610f42543e794570bbbb8326f603";
>>>>>>> origin/main
const faucetPubKey = CryptoUtils.privKeyToPubKey(faucetPrivKey);
const faucetAddress = CryptoUtils.pubKeyToAddress(faucetPubKey);

// Miner Private Key, Public Key, and Address
const minerPrivKey =
  "4aa83695f9f2552103281f266ea79de6611250a5d0e1ce1d3c00d39a453fa1c5";
const minerPubKey = CryptoUtils.privKeyToPubKey(faucetPrivKey);
const minerAddress = CryptoUtils.pubKeyToAddress(faucetPubKey);

// const blockchainId = genesisBlock.blockHash;

// generate unique id using datetime and random number
<<<<<<< HEAD
const nodeId =
	new Date().getTime().toString(16) + Math.random().toString(16).substring(2);
=======
const generateUniqueId = () => {
  return (
    new Date().getTime().toString(16) + Math.random().toString(16).substring(2)
  );
};
>>>>>>> origin/main

// const generateUniqueId = () => {
// 	return (
// 		new Date().getTime().toString(16) + Math.random().toString(16).substring(2)
// 	);
// };

// const nodeId = generateUniqueId();

module.exports = {
<<<<<<< HEAD
	// blockchainId,
	blockReward,
	currentNodeURL,
	defaultServerHost: "localhost",
	defaultServerPort: port,
	faucetAddress,
	faucetPrivKey,
	faucetPubKey,
	// generateUniqueId,
	// genesisBlock,
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
	minTransactionFee: 1,
	maxTransferValue: 10000000000000,
	nodeId,
	nullAddress,
	nullPubKey,
	nullSignature,
	safeConfirmCount: 3,
=======
  // blockchainId,
  blockReward,
  currentNodeURL,
  defaultServerHost: "localhost",
  defaultServerPort: port,
  faucetAddress,
  faucetPrivKey,
  faucetPubKey,
  generateUniqueId,
  // genesisBlock,
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
>>>>>>> origin/main
};
