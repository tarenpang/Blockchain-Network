const crypto = require("crypto");
const EC = require("elliptic").ec;
const CryptoJS = require("crypto-js");

const secp256k1 = new EC("secp256k1");

const cryptoHash = (...inputs) => {
	const hash = crypto.createHash("sha256");

	hash.update(
		inputs
			.map((input) => JSON.stringify(input))
			.sort()
			.join(" ")
	);

	return hash.digest("hex");
};

function sha256(data) {
	return CryptoJS.SHA256(data).toString();
}

function pubKeyToAddress(pubKey) {
	let address = CryptoJS.RIPEMD160(pubKey).toString();
	return address;
}

function privKeyToPubKey(privKey) {
	let keyPair = secp256k1.keyFromPrivate(privKey);
	let pubKey =
		keyPair.getPublic().getX().toString(16) +
		(keyPair.getPublic().getY().isOdd() ? "1" : "0");
	return pubKey;
}

function privKeyToAddress(privKey) {
	let pubKey = privateKeyToPublicKey(privKey);
	let address = publicKeyToAddress(pubKey);
	return address;
}

function signData(data, privKey) {
	let keyPair = secp256k1.keyFromPrivate(privKey);
	let signature = keyPair.sign(data);
	return [signature.r.toString(16), signature.s.toString(16)];
}

// Transaction data hash
function calcTransactionDataHash(
	from,
	to,
	value,
	fee,
	dateCreated,
	data,
	senderPubKey
) {
	const transactionData = {
		from,
		to,
		value,
		fee,
		dateCreated,
		data,
		senderPubKey,
	};
	if (!transactionData.data) delete transactionData.data;
	const transactionDataJSON = JSON.stringify(transactionData)
		.split(" ")
		.join("");
	return sha256(transactionDataJSON).toString();
}

// Block data hash
function calcBlockDataHash(
	index,
	transactions,
	difficulty,
	prevBlockHash,
	minedBy
) {
	let blockData = {
		index,
		transactions: transactions.map((transaction) =>
			Object({
				from: transaction.from,
				to: transaction.to,
				value: transaction.value,
				fee: transaction.fee,
				dateCreated: transaction.dateCreated,
				data: transaction.data,
				senderPubKey: transaction.senderPubKey,
				transactionDataHash: transaction.transactionDataHash,
				senderSignature: transaction.senderSignature,
				minedInBlockIndex: transaction.minedInBlockIndex,
				transferSuccessful: transaction.transferSuccessful,
			})
		),
		difficulty,
		prevBlockHash,
		minedBy,
	};

	const blockDataJSON = JSON.stringify(blockData).split(" ").join("");

	return sha256(blockDataJSON).toString();
}

const verifySignature = ({ publicKey, data, signature }) => {
	const keyFromPublic = secp256k1.keyFromPublic(publicKey, "hex");

	return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = {
	calcBlockDataHash,
	calcTransactionDataHash,
	cryptoHash,
	sha256,
	secp256k1,
	pubKeyToAddress,
	privKeyToPubKey,
	privKeyToAddress,
	signData,
	verifySignature,
};
