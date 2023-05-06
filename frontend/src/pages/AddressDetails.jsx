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
			<h3>Address: {`${address}`}</h3>
			<h3>Balance: {`${addressBalance.confirmedBalance}`}</h3>
			<div class="row-container">
				<div>
					<br></br>
					<div>
						<div class="outlined">
							<Container fluid>
								{addressTransactions.length > 0 &&
									addressTransactions.map((d, index) => (
										<Row>
											<Col>&nbsp;</Col>
											<Col>
												TxnHash: {`${d.transactionDataHash.slice(0, 20)}...`}
											</Col>
											<Col>To: {`${d.to.slice(0, 20)}...`}</Col>
											<Col>From: {`${d.from.slice(0, 20)}...`}</Col>
											<Col>Value: {`${d.value}`}</Col>
											<Col>Fee: {`${d.fee}`}</Col>
										</Row>
									))}
							</Container>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default AddressDetails;
