import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";
function TransactionDetails() {
	const [currentTransaction, setCurrentTransaction] = useState([]);
	const { txHash } = useParams();
	useEffect(() => {
		(async function loadData() {
			const currentTransaction = await axios.get(
				`http://localhost:5555/transactions/${txHash}`
			);
			setCurrentTransaction(currentTransaction.data);
		})();
	}, []);
	return (
		<div>
			<br />
			<h1>Transaction Details</h1>
			<br></br>
			<div className="card-wide">
				<div>
					<br></br>
					<div>
						<div className="card-body-wide">
							{/* <Container fluid> */}
							<Row>
								<p>&nbsp;</p>
								<p>TxnHash: {`${currentTransaction.transactionDataHash}`}</p>
								<p>From: {`${currentTransaction.from}`}</p>
								<p>To: {`${currentTransaction.to}`}</p>
								<p>Amount: {`${currentTransaction.value}`}</p>
								<p>Date: {`${currentTransaction.dateCreated}`}</p>
							</Row>
							{/* </Container> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default TransactionDetails;
