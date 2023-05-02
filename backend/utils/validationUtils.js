const config = require("./config");

const dateRegEx =
	/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{2,6}Z$/;

function isValidAddress(address) {
	if (typeof address !== "string") return false;
	return /^[0-9a-f]{40}$/.test(address);
}

function isValidPublicKey(pubKey) {
	if (typeof pubKey !== "string") return false;
	return /^[0-9a-f]{65}$/.test(pubKey);
}

function isValidPrivateKey(privateKey) {
	if (typeof privateKey !== "string") return false;
	const isValid = /[A-Fa-f0-9]{64}/g.test(privateKey);
	return isValid;
}

function isValidSignature(signature) {
	if (!Array.isArray(signature)) return false;
	if (signature.length !== 2) return false;
	let validNum0 = /^[0-9a-f]{1,65}$/.test(signature[0]);
	let validNum1 = /^[0-9a-f]{1,65}$/.test(signature[1]);
	return validNum0 && validNum1;
}

function isValidBlockIndex(index, previousBlockIndex) {
	if (typeof index !== "number") return false;
	if (!Number.isInteger(index)) return false;
	return index === previousBlockIndex + 1;
}

function isValidDifficulty(blockHash, difficulty) {
	for (let i = 0; i < difficulty; i++) if (blockHash[i] !== "0") return false;
	return true;
}

function isValidNonce(nonce) {
	if (typeof nonce !== "number") return false;
	if (!Number.isInteger(nonce)) return false;
	return nonce > 0;
}

function isValidDate(dateISO) {
	if (typeof dateISO !== "string") return false;
	if (!dateRegEx.test(dateISO)) return false;
	let date = new Date(dateISO);
	if (isNaN(date)) return false;
	let year = date.getUTCFullYear();
	return year >= 2022 && year <= 2100;
}

function isValidTransferValue(value) {
	if (typeof value !== "number") return false;
	if (!Number.isInteger(value)) return false;
	return value >= 0;
}

function isValidTransferFee(fee) {
	if (typeof fee !== "number") return false;
	if (!Number.isInteger(fee)) return false;
	return fee >= Config.minimumTransactionFee;
}

function isMissingFields(dataObject) {
	function calculateMissingFields(expectedFields) {
		let incomingFields = [];
		for (const field in dataObject) {
			incomingFields.push(field);
		}

		let missingFields = [];
		expectedFields.forEach((expected) => {
			if (!incomingFields.includes(expected)) missingFields.push(expected);
		});

		if (missingFields.length >= 1) {
			return missingFields.map((field) => `Missing field - '${field}'`);
		} else {
			return false;
		}
	}

	if (dataObject.blockHash) {
		const expectedFields = [
			"index",
			"transactions",
			"difficulty",
			"prevBlockHash",
			"minedBy",
			"blockDataHash",
			"nonce",
			"dateCreated",
			"blockHash",
		];

		calculateMissingFields(expectedFields);
	} else if (dataObject.transactionDataHash) {
		const expectedFields = [
			"from",
			"to",
			"value",
			"fee",
			"dateCreated",
			"data",
			"senderPubKey",
			"transactionDataHash",
			"senderSignature",
			"minedInBlockIndex",
			"transferSuccessful",
		];

		calculateMissingFields(expectedFields);
	} else {
		const expectedFields = [
			"to",
			"value",
			"fee",
			"dateCreated",
			"data",
			"senderPubKey",
			"transactionDataHash",
			"senderSignature",
			"senderPrivKey",
		];

		calculateMissingFields(expectedFields);
	}
}

const isValidFieldValues = (dataObject) => {
	function calculateValidFields(validFields) {
		let incomingFields = [];
		for (const field in dataObject) {
			// iterate dataObject object
			incomingFields.push(field);
		}

		let invalidFields = [];
		incomingFields.forEach((incoming, index) => {
			const isValidField = incoming !== validFields[index] ? false : true;
			if (!isValidField) invalidFields.push([incoming, isValidField]);
		});

		// invalidFields -->  [ ["str", bool], ["str", bool] ]   <-- array of arrays
		if (invalidFields.length >= 1) {
			return invalidFields
				.filter((invalid) => invalid[1] === false) // if index 1 is false
				.map((invalid) => `Invalid field - '${invalid[0]}'`); // return the false "str"
		} else {
			return false;
		}
	}

	if (dataObject.blockHash) {
		const validFields = [
			"index",
			"transactions",
			"difficulty",
			"prevBlockHash",
			"minedBy",
			"blockDataHash",
			"nonce",
			"dateCreated",
			"blockHash",
		];

		calculateValidFields(validFields);
	} else if (dataObject.transactionDataHash) {
		const validFields = [
			"from",
			"to",
			"value",
			"fee",
			"dateCreated",
			"data",
			"senderPubKey",
			"transactionDataHash",
			"senderSignature",
			"minedInBlockIndex",
			"transferSuccessful",
		];

		calculateValidFields(validFields);
	} else {
		const validFields = [
			"to",
			"value",
			"fee",
			"dateCreated",
			"data",
			"senderPubKey",
			"transactionDataHash",
			"senderSignature",
			"senderPrivKey",
		];

		calculateValidFields(validFields);
	}
};

module.exports = {
	isMissingFields,
	isValidAddress,
	isValidBlockIndex,
	isValidDate,
	isValidDifficulty,
	isValidFieldValues,
	isValidNonce,
	isValidPrivateKey,
	isValidPublicKey,
	isValidTransferFee,
	isValidTransferValue,
	isValidSignature,
};
