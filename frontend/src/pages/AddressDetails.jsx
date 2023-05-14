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
			<div className="center-text bg-glass-2">
				<h4>Address: {`${address}`}</h4>
				<div className="center-text">
					<h4>Balance: {`${addressBalance.confirmedBalance}`}</h4>
				</div>
			</div>
			<br></br>
			<div className="card-wide-1">
				<div>
					<br></br>
					<div>
						<div className="card-body-wide-1">
							<div className="scrollable">
								{/* <Container fluid> */}
								{addressTransactions.length > 0 &&
									addressTransactions.map((d, index) => (
										<Row>
											<p className="ln-ht">
												<b>TxnHash:</b> {` ${d.transactionDataHash}`}
											</p>
											<p className="ln-ht">
												<b>Date:</b>
												{` ${d.dateCreated}`}
											</p>
											<p className="ln-ht">
												<b>From:</b> {` ${d.from}`}
											</p>
											<p className="ln-ht">
												<b>To:</b> {` ${d.to}`}
											</p>
											<p className="ln-ht">
												<b>Value:</b> {` ${d.value}`}
											</p>
											<p className="ln-ht">
												<b>Fee:</b> {` ${d.fee}`}
											</p>
											<hr />
										</Row>
									))}
								{/* </Container> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default AddressDetails;
