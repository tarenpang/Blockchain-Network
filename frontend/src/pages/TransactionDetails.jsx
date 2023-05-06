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
			<div class="row-container">
				<div>
					<br></br>
					<div>
						<div class="outlined">
							<Container fluid>
								<Row>
									<Col>&nbsp;</Col>
									<Col>
										TxnHash: {`${currentTransaction.transactionDataHash}`}
									</Col>
									<Col>To: {`${currentTransaction.to}`}</Col>
									<Col>From: {`${currentTransaction.from}`}</Col>
									<Col>Amount: {`${currentTransaction.value}`}</Col>
									<Col>Date: {`${currentTransaction.dateCreated}`}</Col>
								</Row>
							</Container>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default TransactionDetails;
