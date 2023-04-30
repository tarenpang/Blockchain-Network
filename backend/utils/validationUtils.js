const config = require("./config");

function isValidAddress(address) {
	if (typeof address !== "string") return false;
	if (address.length !== 40) return false;
	if (!address.match(/^[0-9a-fA-F]+$/)) return false;
	return true;
}

function isValidPublicKey(pubKey) {
	if (typeof pubKey !== "string") return false;
	if (pubKey.length !== 65) return false;
	if (!pubKey.match(/^[0-9a-fA-F]+$/)) return false;
	return true;
}

function isValidSignature(signature) {
	if (!Array.isArray(signature)) return false;
	if (signature.length !== 2) return false;
	if (typeof signature[0] !== "string") return false;
	if (typeof signature[1] !== "string") return false;
	if (signature[0].length !== 64) return false;
	if (signature[1].length !== 64) return false;
	if (!signature[0].match(/^[0-9a-fA-F]+$/)) return false;
	if (!signature[1].match(/^[0-9a-fA-F]+$/)) return false;
	return true;
}

function isValidDifficulty(blockHash, difficulty) {
	for (let i = 0; i < difficulty; i++) if (blockHash[i] !== "0") return false;
	return true;
}

module.exports = {
	isValidAddress,
	isValidPublicKey,
	isValidSignature,
	isValidDifficulty,
};
