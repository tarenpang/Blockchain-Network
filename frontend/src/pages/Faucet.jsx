import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import axios from "axios";
import "react-circular-progressbar/dist/styles.css";
import purplecryptochart from "../assets/purplecryptochart.jpg";
function Faucet() {
	const [address, setAddress] = useState("");
	const [amount, setAmount] = useState("");
	const [faucetBalance, setFaucetBalance] = useState(1000000000000); // Initial faucet balance
	//const [loading, setLoading] = useState(false);
	//const [progress, setProgress] = useState(0);
	//const [disabled, setDisabled] = useState(false);
	//const [balance, setBalance] = useState(0);
	//let faucetBalance = 1000000000000;
	/* useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prevProgress) =>
          prevProgress >= 100 ? 0 : prevProgress + 1
        );
      }, 900);
      return () => {
        clearInterval(timer);
      };
    }, []);
    */
	const handleChange = (event) => {
		const { name, value } = event.target;
		if (name === "address") {
			setAddress(value);
		} else if (name === "amount") {
			setAmount(value);
		}
	};
	const handleClick = async () => {
		// Deduct the specified amount from the faucet balance
		setFaucetBalance((prevBalance) => prevBalance - parseInt(amount));
		// Send the transaction to the recipient wallet
		sendTransaction(wallet.address);
	};
	const sendTransaction = async () => {
		try {
			// Code to send the transaction to the recipient wallet
			// Replace this with your actual implementation using a web3 library or API
			console.log(`Transaction sent to ${wallet.address} for amount ${amount}`);
		} catch (error) {
			if (isNaN) console.log("Failed to send transaction:", error);
		}
	};
	/*const handleDonate = async () => {
          //
          const response = await fetch(`/donate`, {
            method: "GET",
          });
          setDisabled(false);
          setLoading(false);
          if (response.ok) {
            const data = await response.json();
            console.log(`Donation transaction hash: ${data.txHash}`);
            // display a success message to the user
          } else {
            console.error(`Failed to donate: ${response.statusText}`);
            // display an error message to the user
          }
        };
        const handleWithdrawal = async () => {
          setLoading(true);
          setDisabled(true);
          await axios.post("/api/faucet/withdraw", { address, amount });
          setLoading(false);
          setDisabled(false);
          startProgress();
        };
        const startProgress = () => {
          let intervalId;
          let count = 0;
          intervalId = setInterval(() => {
            count++;
            if (count > 100) {
              clearInterval(intervalId);
              setProgress(0);
              return;
            }
            setProgress(count);
          }, 900);
        };
        useEffect(() => {
          const fetchBalance = async () => {
            const response = await fetch(`/balance?address=${address}`);
            if (response.ok) {
              const data = await response.json();
              setBalance(data.balance);
            } else {
              console.error(`Failed to get balance: ${response.statusText}`);
              setBalance(0);
            }
          };
          if (address) {
            fetchBalance();
          }
        }, [address]);
      */
	//const addressBalance = balance > 0 ? `Balance: ${balance}` : "";
	return (
		<div>
			{/* <ToastContainer
				position="top-right"
				closeOnClick
				draggable
				pauseOnHover
				theme="light"
			/> */}
			<br />
			<h1>IndiGOLD Faucet</h1>
			<div className="center-img">
				<img
					style={{ width: 225, height: 200 }}
					src="../src/assets/faucet-85.png"
					alt="Pickaxe Image"
				></img>
			</div>
			<br />
			<div className="bg-glass-1 center-text">
				<h3>Available Balance: {faucetBalance} </h3>
			</div>
			<br />
			<div className="container-fluid">
				<div className="card-md-1">
					<div className="card-body-md-1">
						<div>
							<p />
							<p className="ln-ht">
								&#8226;&nbsp;IndiGOLD Faucet is a Free Service for Crypto
								Tokens.
							</p>
							<p className="ln-ht">
								&#8226;&nbsp;A 90 second waiting period is required between
								withdrawals.
							</p>
							<br />
							<div className="flex-justify-end">
								<Button
									className="custom-btn"
									style={{ width: "10rem", marginBottom: 5 }}
									variant="success"
									type="button"
									value="Submit"
									onClick={handleClick}
								>
									Donate
								</Button>
							</div>
						</div>
						<InputGroup className="mb-3">
							<InputGroup.Text id="basic-addon1">
								Recipient Address
							</InputGroup.Text>
							<Form.Control type="address" placeholder="Address" />
						</InputGroup>
						<div>
							<Card.Text></Card.Text>
						</div>
						<InputGroup className="mb-3">
							<InputGroup.Text id="basic-addon1">Amount</InputGroup.Text>
							<Form.Control type="address" placeholder="IndiGOLD Amount" />
						</InputGroup>
						{/* <FloatingLabel controlId="floatingInput" label="Amount">
									<Form.Control type="amount" placeholder="IndiGOLD Amount" />
								</FloatingLabel> */}
						<br />
						<Button type="button" onClick={handleClick}>
							Get Coins
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
export default Faucet;
