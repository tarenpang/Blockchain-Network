import React, { useState, useEffect, useContext } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import EC from "elliptic";
import CryptoJS from "crypto-js";
import secureLocalStorage from "react-secure-storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NetworkContext } from "../context/NetworkContext";
// import CaptchaTest from "../components/CaptchaTest";

var elliptic = EC.ec;
var secp256k1 = new elliptic("secp256k1");

function Faucet() {
	const transactionTimeout = 90; // Timeout in seconds
	const [recipient, setRecipient] = useState("");
	const [value, setValue] = useState("");
	const [balance, setBalance] = useState("");
	const [walletBalance, setWalletBalance] = useState("");
	const [timeoutSeconds, setTimeoutSeconds] = useState(transactionTimeout);
	const [donationValue, setDonationValue] = useState("");
	const [signedTx, setSignedTx] = useState("");
	const [isSigned, setIsSigned] = useState(false);
	const [signedDonationTx, setSignedDonationTx] = useState("");
	const [isSignedDonation, setIsSignedDonation] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(
		secureLocalStorage.getItem("loggedIn")
	);
	const { activePorts, setActivePorts } = useContext(NetworkContext);

	useEffect(() => {
		(async function loadData() {
			const balance = await axios.get(
				`http://localhost:5555/address/732ad3cf41bd1d99a346af99501015b5fa2c256d/balance`
			);
			setBalance(balance.data);
			const walletBalance = await axios.get(
				`http://localhost:5555/address/${secureLocalStorage.getItem(
					"address"
				)}/balance`
			);
			setWalletBalance(walletBalance.data);
		})();
	}, []);

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
		if (
			value > balance.confirmedBalance ||
			balance.confirmedBalance - value < 0
		) {
			toast.error("Invalid Funds!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}
		if (value < 100) {
			toast.error("Withdrawal minimum is 100!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}

		if (value > 1000) {
			toast.error("Exceeded withdrawal limit of 1000!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}

		let faucetFrom = "732ad3cf41bd1d99a346af99501015b5fa2c256d";
		let faucetPubKey =
			"f35c1ba73028d161274b0988bb1b855866b051f8456819cbf1cc9a3bae6923ef0";
		let faucetPrivKey =
			"6e4edb05c3f086f8aa1bf848a12c82f25c51610f42543e794570bbbb8326f603";

		let transaction = {
			from: faucetFrom,
			to: recipient,
			value: Number(value),
			fee: 1,
			// dateCreated: new Date().toISOString(),
			dateCreated: new Date(),
			data: "foo",
			senderPubKey: faucetPubKey,
		};
		if (!transaction.data) delete transaction.data;

		let transactionJSON = JSON.stringify(transaction);
		transaction.transactionDataHash =
			CryptoJS.SHA256(transactionJSON).toString();

		transaction.senderSignature = signData(
			transaction.transactionDataHash,
			faucetPrivKey
		);

		let signedTransaction = JSON.stringify(transaction);
		setSignedTx(signedTransaction);
		console.log(signedTransaction);
		setIsSigned(true);
		toast.success("Pending withdrawal submitted", {
			position: "top-right",
			theme: "light",
		});
		let tranSend = signedTransaction;
		sendTransaction(tranSend);
	};
	const sendTransaction = async signedTx => {
		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			let promises = [];
			activePorts.forEach(async port => {
				let result = await axios.post(
					`http://localhost:${port}/transaction`,
					signedTx,
					config
				);
				promises.push(result);
			});
			Promise.all(promises).then(function (values) {
				console.log("values" + values);
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
				// setData("");
				console.log("success");
			}
		} catch (error) {
			console.log("error2" + error);
		}
	};

	const signDonationTransaction = () => {
		const validValue = /^\d*\.?\d*$/.test(donationValue);

		if (!validValue) {
			toast.error("Invalid Value!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}
		if (
			donationValue > walletBalance.confirmedBalance ||
			walletBalance.confirmedBalance - value < 0
		) {
			toast.error("Invalid Funds!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}
		if (donationValue === 0) {
			toast.error("Donation value can't be zero!", {
				position: "top-right",
				theme: "light",
			});
			return;
		}

		let faucetFrom = "732ad3cf41bd1d99a346af99501015b5fa2c256d";
		let faucetPubKey =
			"f35c1ba73028d161274b0988bb1b855866b051f8456819cbf1cc9a3bae6923ef0";
		let faucetPrivKey =
			"6e4edb05c3f086f8aa1bf848a12c82f25c51610f42543e794570bbbb8326f603";

		let transaction = {
			from: secureLocalStorage.getItem("address"),
			to: faucetFrom,
			value: Number(donationValue),
			fee: 1,
			// dateCreated: new Date().toISOString(),
			dateCreated: new Date(),
			data: "foo",
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
		setSignedDonationTx(signedTransaction);
		console.log(signedTransaction);
		setIsSignedDonation(true);
		toast.success("Pending donation submitted", {
			position: "top-right",
			theme: "light",
		});
		let donoTran = signedTransaction;
		sendDonationTransaction(donoTran);
	};

	const sendDonationTransaction = async signedDonoTran => {
		// () => signTransaction();
		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};
			let promises = [];
			activePorts.forEach(async port => {
				let result = await axios.post(
					`http://localhost:${port}/transaction`,
					signedDonoTran,
					config
				);
				promises.push(result);
			});
			Promise.all(promises).then(function (values) {
				console.log("values" + values);
			});
			// let result = await axios.post(
			// 	`http://localhost:5555/transaction`,
			// 	signedDonoTran,
			// 	config
			// );
			const error = result.data.error;
			if (error) {
				console.log("error" + error);
			} else {
				toast.success("Transaction sent", {
					position: "top-right",
					theme: "light",
				});
				setIsSignedDonation(false);

				setDonationValue("");
				// setData("");
				console.log("success");
			}
		} catch (error) {
			console.log("error2" + error);
		}
	};

	return (
		<div>
			<ToastContainer
				position="top-right"
				closeOnClick
				draggable
				pauseOnHover
				theme="light"
			/>
			<h1>IndiGOLD Faucet</h1>
			<div className="center-img-3">
				<img
					style={{ width: 225, height: 200 }}
					src="../src/assets/faucet-85.png"
					alt="Faucet Image"
				></img>
			</div>
			<br />
			<div className="bg-glass-1a center-text">
				<h3>Faucet Balance: {balance.confirmedBalance}</h3>
			</div>
			<br />
			<div className="container-fluid-2">
				<div className="card-md-3">
					<div className="card-body-md-1">
						<div>
							<p />
							<p className="ln-ht">
								&#8226;&nbsp;IndiGOLD Faucet is a Free Service for Crypto
								Tokens.
							</p>
							<p className="ln-ht">
								&#8226;&nbsp;Withdrawal must be between 100-1000 coins.
							</p>
							<br />
						</div>
						<InputGroup className="mb-3">
							<InputGroup.Text id="basic-addon1">
								Recipient Address
							</InputGroup.Text>
							<Form.Control
								type="recipient"
								id="recipient"
								name="recipient"
								value={recipient}
								onChange={e => {
									setRecipient(e.target.value);
									console.log(e.target.value);
								}}
								placeholder="Recipient"
							/>
						</InputGroup>
						<div>
							<Card.Text></Card.Text>
						</div>
						<InputGroup className="mb-3">
							<InputGroup.Text id="basic-addon1">Amount</InputGroup.Text>
							<Form.Control
								type="value"
								id="value"
								name="value"
								value={value}
								onChange={e => {
									setValue(e.target.value);
									console.log(e.target.value);
								}}
								placeholder="IndiGOLD Amount"
							/>
						</InputGroup>
						<br />

						{/* <div class="card">
							<div className="card-body-md-1">
								<h3 className="center-text">Please verify to continue:</h3>
								<CaptchaTest />
							</div>
						</div> */}

						<Button variant="primary" onClick={signTransaction}>
							Withdraw IndiGOLD
						</Button>
					</div>
				</div>
				<div className="card-md-4">
					<div className="card-body-md-1a">
						<p className="ln-ht">
							&#8226;&nbsp;Please return any unused IndiGOLD you no longer need
						</p>
						<p className="ln-ht">
							&#8226;&nbsp;Wallet must be active to donate funds
						</p>
						<div>
							<Card.Text></Card.Text>
						</div>
						<InputGroup className="mb-3">
							<InputGroup.Text id="basic-addon1">Amount</InputGroup.Text>
							<Form.Control
								type="donationValue"
								id="donationValue"
								name="donationValue"
								value={donationValue}
								onChange={e => {
									setDonationValue(e.target.value);
									console.log(e.target.value);
								}}
								placeholder="IndiGOLD Amount"
							/>
						</InputGroup>
						<br />
						<Button
							type="button"
							onClick={signDonationTransaction}
							disabled={!isLoggedIn ? "disabled" : ""}
							className="custom-btn"
						>
							Donate IndiGOLD
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
export default Faucet;
