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

// function decompressPublicKey(publicKeyCompressed) {
// 	let pubKeyX = publicKeyCompressed.substring(0, 64);
// 	let pubKeyYOdd = parseInt(publicKeyCompressed.substring(64));
// 	let pubKeyPoint = secp256k1.curve.pointFromX(pubKeyX, pubKeyYOdd);

// 	return pubKeyPoint;
// }

// function verifySignature(data, publicKey, signature) {
// 	let pubKeyPoint = decompressPublicKey(publicKey);
// 	let keyPair = secp256k1.keyPair({ pub: pubKeyPoint });
// 	let valid = keyPair.verify(data, { r: signature[0], s: signature[1] });
// 	return valid;
// }

const verifySignature = ({ publicKey, data, signature }) => {
	const keyFromPublic = secp256k1.keyFromPublic(publicKey, "hex");

	return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = {
	cryptoHash,
	sha256,
	secp256k1,
	pubKeyToAddress,
	privKeyToPubKey,
	privKeyToAddress,
	signData,
	verifySignature,
};
