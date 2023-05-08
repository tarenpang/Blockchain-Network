import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

function Wallet() {
	const [allConfirmedTransactions, setAllConfirmedTransactions] = useState([]);
	const [loggedIn, setLoggedIn] = useState(secureLocalStorage.getItem("loggedIn"));

	// useEffect(() => {
	// 	(async function loadData() {
	// 		const confirmedTransactions = await axios.get(
	// 			`http://localhost:5555/transactions/confirmed`
	// 		);
	// 		setAllConfirmedTransactions(
	// 			confirmedTransactions.data.reverse().slice(0, 10)
	// 		);
	// 	})();
	// }, []);

	// const trimAddress = (address) => {
	// 	const start = address.split("").slice(0, 14).join("");
	// 	const end = address.split("").slice(-6).join("");
	// 	return `${start}...${end}`;
	// };

	return (
		<div>
			<br />
			<h1>Welcome to the IndiGold Wallet</h1>
			<br></br>
			<div class="container-fluid">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title">
							Looking to create a new wallet? 
						</h4>
						<br></br>
						<p>Click the button below to create a new wallet. Each wallet is generated with a new address used to send and store your IndiGold. You can recover your wallet at anytime with the generated privateKey. Don't forget to save your wallet credentials!  </p>
						<br></br>
						<Button type="submit">Search</Button>
					</div>
				</div>

				<div class="card">
					<div class="card-body">
						<h4 class="card-title">
							Already have an existing wallet? 
						</h4>
						<br></br>
						<p>Input the private key that was generated with the creation of your wallet into the field below to gain access to your wallet. </p>
						<br></br>
						<InputGroup className="mb-3">
							<Form.Control
							placeholder="Private key"
							aria-label="Private key"
							aria-describedby="basic-addon2"
							/>
							<Button  className="center" type="submit">Open Wallet</Button>
						</InputGroup>
					</div>
				</div>
			</div>
		</div>	
	);
}

export default Wallet;
