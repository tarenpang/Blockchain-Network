// import  * from "myBackend";
import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";
function AddressDetails() {
	const [addressBalance, setAddressBalance] = useState([]);
	const [addressTransactions, setAddressTransactions] = useState([]);
	const { address } = useParams();
	useEffect(() => {
		(async function loadData() {
			const balance = await axios.get(
				`http://localhost:5555/address/${address}/balance`
			);
			setAddressBalance(balance.data);
			const transactions = await axios.get(
				`http://localhost:5555/address/${address}/transactions`
			);
			setAddressTransactions(transactions.data.reverse().slice(0, 10));
		})();
	}, []);
	return (
		<div>
			<br />
			<h1>Address Details</h1>
			<br></br>
			<div className="center-text">
				<h4>Address: {`${address}`}</h4>
				<div className="center-text">
					<h4>Balance: {`${addressBalance.confirmedBalance}`}</h4>
				</div>
			</div>
			<br></br>
			<div className="card-wide">
				<div>
					<br></br>
					<div>
						<div className="card-body-wide">
							{/* <Container fluid> */}
							{addressTransactions.length > 0 &&
								addressTransactions.map((d, index) => (
									<Row>
										<p>&nbsp;</p>
										<p>TxnHash: {`${d.transactionDataHash.slice(0, 20)}...`}</p>
										<p>To: {`${d.to.slice(0, 20)}...`}</p>
										<p>From: {`${d.from.slice(0, 20)}...`}</p>
										<p>Value: {`${d.value}`}</p>
										<p>Fee: {`${d.fee}`}</p>
									</Row>
								))}
							{/* </Container> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default AddressDetails;
