import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect, useRef, useContext } from "react";
import { NetworkContext } from "../context/NetworkContext";
import { Button, Form, InputGroup } from "react-bootstrap";
import secureLocalStorage from "react-secure-storage";
import EC from "elliptic";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

var elliptic = EC.ec;
var secp256k1 = new elliptic("secp256k1");

const generateWallet = keyPair => {
	secureLocalStorage.clear();
	const privateKey = keyPair.getPrivate().toString(16);
	const publicKey =
		keyPair.getPublic().getX().toString(16) +
		(keyPair.getPublic().getY().isOdd() ? "1" : "0");
	const address = CryptoJS.RIPEMD160(publicKey).toString();
	// const address = pubKeyToAddress(publicKey);

	return {
		privateKey,
		publicKey,
		address,
	};
};

const recoverWallet = privateKey => {
	secureLocalStorage.clear();
	const keyPair = secp256k1.keyFromPrivate(privateKey);
	const publicKey =
		keyPair.getPublic().getX().toString(16) +
		(keyPair.getPublic().getY().isOdd() ? "1" : "0");
	const address = CryptoJS.RIPEMD160(publicKey).toString();

	return {
		privateKey,
		publicKey,
		address,
	};
};

function Wallet() {
	const [balance, setBalance] = useState([]);
	const [loggedIn, setLoggedIn] = useState(
		secureLocalStorage.getItem("loggedIn")
	);
	const [generatedKeys, setGeneratedKeys] = useState("");
	const [inputKey, setInputKey] = useState("");
	const [recipient, setRecipient] = useState("");
	const [value, setValue] = useState("");
	const [data, setData] = useState("");
	const [signedTx, setSignedTx] = useState("");
	const [isSigned, setIsSigned] = useState(false);
	const formRef = useRef(null);

	const { activePorts, setActivePorts } = useContext(NetworkContext);

	useEffect(() => {
		if (loggedIn) {
			setGeneratedKeys(
				"Private Key: " +
					secureLocalStorage.getItem("privKey") +
					"\n" +
					"\n" +
					"Public Key: " +
					secureLocalStorage.getItem("pubKey") +
					"\n" +
					"\n" +
					"Blockchain Address: " +
					secureLocalStorage.getItem("address")
			);
		}
	}, []);

	const handleReset = () => {
		formRef.current.reset();
		setValidated(false);
	};

	const handleLogin = () => {
		if (!loggedIn) {
			secureLocalStorage.setItem("loggedIn", true);
			setLoggedIn(true);
		} else if (loggedIn) {
			setLoggedIn(false);
			secureLocalStorage.clear();
			setGeneratedKeys("");
		}
	};

	const handleRecover = event => {
		secureLocalStorage.clear();

		const wallet = recoverWallet(inputKey);

		secureLocalStorage.setItem("privKey", wallet.privateKey);
		secureLocalStorage.setItem("pubKey", wallet.publicKey);
		secureLocalStorage.setItem("address", wallet.address);
		secureLocalStorage.setItem("loggedIn", true);

		setGeneratedKeys(
			"Private Key: " +
				wallet.privateKey +
				"\n" +
				"\n" +
				"Public Key: " +
				wallet.publicKey +
				"\n" +
				"\n" +
				"Blockchain Address: " +
				wallet.address
		);
		handleLogin();
		console.log("gen keys: " + wallet.privateKey);
	};

	const handleGeneration = () => {
		let keyPair = secp256k1.genKeyPair();
		const wallet = generateWallet(keyPair);
		console.log("New wallet:" + wallet);

		secureLocalStorage.setItem("privKey", wallet.privateKey);
		secureLocalStorage.setItem("pubKey", wallet.publicKey);
		secureLocalStorage.setItem("address", wallet.address);

		setGeneratedKeys(
			"Private Key: " +
				wallet.privateKey +
				"\n" +
				"\n" +
				"Public Key: " +
				wallet.publicKey +
				"\n" +
				"\n" +
				"Blockchain Address: " +
				wallet.address
		);
		handleLogin();
		console.log("gen keys: " + wallet.privateKey);
	};

	function signData(data, privKey) {
		const secp256k1 = new elliptic("secp256k1");
		let keyPair = secp256k1.keyFromPrivate(privKey);
		let signature = keyPair.sign(data);

		return [signature.r.toString(16), signature.s.toString(16)];
	}

	const signTransaction = () => {
		const validAddress = /^[0-9a-f]{40}$/.test(recipient);
		const validValue = /^\d*\.?\d*$/.test(value);

		if (!value || !recipient) {
			toast.error("Both Recipient and Value Required!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}

		if (!validAddress) {
			toast.error("Invalid Recipient Address!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}

		if (!validValue) {
			toast.error("Invalid Value!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}

		let transaction = {
			from: secureLocalStorage.getItem("address"),
			to: recipient,
			value: Number(value),
			fee: 1,
			// dateCreated: new Date().toISOString(),
			dateCreated: new Date(),
			data,
			senderPubKey: secureLocalStorage.getItem("pubKey"),
		};
		if (!transaction.data) delete transaction.data;

		let transactionJSON = JSON.stringify(transaction);
		transaction.transactionDataHash =
			CryptoJS.SHA256(transactionJSON).toString();

		transaction.senderSignature = signData(
			transaction.transactionDataHash,
			secureLocalStorage.getItem("privKey")
		);

		let signedTransaction = JSON.stringify(transaction);
		setSignedTx(signedTransaction);
		setIsSigned(true);
		toast.success("Transaction signed", {
			position: "top-right",
			theme: "light",
		});
	};

	const sendTransaction = async () => {
		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			activePorts.forEach(port => {
				axios.post(`http://localhost:${port}/transaction`, signedTx, config);
			});

			const error = result.data.error;
			if (error) {
				console.log("error" + error);
			} else {
				toast.success("Transaction sent", {
					position: "top-right",
					theme: "light",
				});
				setIsSigned(false);
				setRecipient("");
				setValue("");
				setData("");
				console.log("success");
			}
		} catch (error) {
			console.log("error2" + error);
		}
	};

	useEffect(() => {
		(async function loadData() {
			const balance = await axios.get(
				`http://localhost:5555/address/${secureLocalStorage.getItem(
					"address"
				)}/balance`
			);
			setBalance(balance.data);
		})();
	}, [handleGeneration, handleRecover]);

	return (
		<div>
			<ToastContainer
				position="top-right"
				closeOnClick
				draggable
				pauseOnHover
				theme="light"
			/>
			{/* Same as */}

			{!loggedIn && (
				<div>
					<h1>Welcome to the IndiGold Wallet</h1>

					<div className="center-img">
						<img
							style={{ width: 225, height: 200 }}
							src="../src/assets/wallet-85.png"
							alt="Wallet Image"
						></img>
					</div>
					<br />
					<div className="container-fluid">
						<div className="card">
							<div className="card-body-1">
								<h4 className="card-title">&nbsp;&nbsp;Create a New Wallet</h4>
								<p />
								<p className="ln-ht">
									&#8226;&nbsp;Click the button below to create a new wallet.
								</p>
								<p className="ln-ht-1">
									&#8226;&nbsp;Each wallet is generated with a new address
									&nbsp;&nbsp;&nbsp;used to send and store your IndiGold.
								</p>
								<p className="ln-ht-1">
									&#8226;&nbsp;You can recover your wallet at anytime with the
									&nbsp;&nbsp;&nbsp;generated privateKey.
								</p>
								<p className="ln-ht">
									&#8226;&nbsp;Don't forget to save your wallet credentials!{" "}
								</p>
								<br></br>
								<Button
									style={{ width: 310 }}
									onClick={handleGeneration}
									type="submit"
								>
									Create
								</Button>
							</div>
						</div>

						<div className="card">
							<div className="card-body-1">
								<h4 className="card-title">
									&nbsp;&nbsp;Open an Existing Wallet
								</h4>
								<p />
								<p className="ln-ht-1">
									Input the private key that was generated with the creation of
									your wallet into the field below to gain access to your
									wallet.{" "}
								</p>
								<br></br>
								<InputGroup className="mb-3">
									<Form.Control
										style={{ width: 310 }}
										placeholder="Private key"
										aria-label="Private key"
										aria-describedby="basic-addon2"
										onChange={e => {
											setInputKey(e.target.value);
											console.log(e.target.value);
										}}
									/>
									<Button
										onClick={handleRecover}
										className="center"
										type="submit"
									>
										Open Wallet
									</Button>
								</InputGroup>
							</div>
						</div>
					</div>
				</div>
			)}
			{loggedIn && (
				<div>
					<h1>Wallet</h1>
					<div className="center-img-2">
						<img
							style={{ width: 225, height: 200 }}
							src="../src/assets/wallet-85.png"
							alt="Wallet Image"
						></img>
					</div>
					<br />
					<div className="bg-glass">
						<h3 className="center-text">Balance: {balance.confirmedBalance}</h3>
						<h4 className="center-text">
							Address: {secureLocalStorage.getItem("address")}
						</h4>
					</div>
					<br></br>
					<div className="container-fluid-1">
						<div className="cred-card">
							<div className="card-body">
								<h4 className="card-title-1">Wallet Credentials</h4>
								<p />
								{/* <p style={{ fontSize: "12px" }}>{generatedKeys}</p> */}
								<p style={{ fontSize: "12px" }}>
									<b>{`Private Key: `}</b>
									{secureLocalStorage.getItem("privKey")}
								</p>
								<p />
								<p style={{ fontSize: "12px" }}>
									<b>{`Public Key: `}</b>
									{secureLocalStorage.getItem("pubKey")}
								</p>
								<p />
								<p style={{ fontSize: "12px" }}>
									<b>{`Blockchain Address: `}</b>
									{secureLocalStorage.getItem("address")}
								</p>
								<br />
								<Button onClick={handleLogin} type="submit">
									Log out
								</Button>
							</div>
						</div>

						<div className="card-wallet-txn">
							<div className="card-body">
								<h4 className="card-title">Send a Transaction</h4>
								<div>
									<InputGroup className="mb-3">
										<InputGroup.Text id="basic-addon1">
											Recipient
										</InputGroup.Text>
										<Form.Control
											placeholder="address"
											aria-label="address"
											aria-describedby="basic-addon1"
											onChange={e => {
												setRecipient(e.target.value);
												console.log(e.target.value);
											}}
										/>
									</InputGroup>
									<InputGroup className="mb-3">
										<InputGroup.Text id="basic-addon1">Value</InputGroup.Text>
										<Form.Control
											placeholder="value"
											aria-label="value"
											aria-describedby="basic-addon1"
											onChange={e => {
												setValue(e.target.value);
												console.log(e.target.value);
											}}
										/>
									</InputGroup>
									<InputGroup className="mb-3">
										<InputGroup.Text id="basic-addon1">Fee</InputGroup.Text>
										<Form.Control
											placeholder="1"
											aria-label="1"
											aria-describedby="basic-addon1"
											readOnly
										/>
									</InputGroup>
									<InputGroup>
										<InputGroup.Text>Data</InputGroup.Text>
										<Form.Control
											as="textarea"
											aria-label="With textarea"
											onChange={e => {
												setData(e.target.value);
												console.log(e.target.value);
											}}
										/>
									</InputGroup>
									<br />
									<div className="btn-pair">
										<Button variant="primary" onClick={signTransaction}>
											Sign Transaction
										</Button>
										<span></span>
										<Button
											variant="primary"
											disabled={!isSigned ? "disabled" : ""}
											onClick={sendTransaction}
										>
											Send Transaction
										</Button>
									</div>
								</div>
								<br></br>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Wallet;
