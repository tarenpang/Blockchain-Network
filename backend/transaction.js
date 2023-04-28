const CryptoUtils = require("./utils/cryptoUtils");

class Transaction {
	constructor(
		from,
		to,
		value,
		fee,
		dateCreated,
		data,
		senderPubKey,
		transactionDataHash,
		senderSignature,
		minedInBlockIndex,
		transferSuccessful
	) {
		this.from = from;
		this.to = to;
		this.value = value;
		this.fee = fee;
		this.dateCreated = dateCreated;
		this.data = data;
		this.senderPubKey = senderPubKey;
		this.transactionDataHash = transactionDataHash;

		if (this.transactionDataHash === undefined) this.calculateDataHash();

		this.senderSignature = senderSignature;
		this.minedInBlockIndex = minedInBlockIndex;
		this.transferSuccessful = transferSuccessful;
	}

	calculateDataHash() {
		let tranData = {
			from: this.from,
			to: this.to,
			value: this.value,
			fee: this.fee,
			dateCreated: this.dateCreated,
			data: this.data,
			senderPubKey: this.senderPubKey,
		};
		let tranDataJSON = JSON.stringify(tranData);
		this.transactionDataHash = CryptoUtils.sha256(tranDataJSON);
	}

	sign(privateKey) {
		this.senderSignature = CryptoUtils.signData(
			this.transactionDataHash,
			privateKey
		);
	}

	verifySignature() {
		return CryptoUtils.verifySignature(
			this.transactionDataHash,
			this.senderPubKey,
			this.senderSignature
		);
	}
}

module.exports = Transaction;
