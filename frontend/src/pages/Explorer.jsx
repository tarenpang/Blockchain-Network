import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SearchBar from "../navigation/SearchBar";

function Explorer() {
	const [allConfirmedTransactions, setAllConfirmedTransactions] = useState([]);
	const [allConfirmedBlocks, setAllConfirmedBlocks] = useState([]);

	useEffect(() => {
		(async function loadData() {
			const confirmedTransactions = await axios.get(
				`http://localhost:5555/transactions/confirmed`
			);
			setAllConfirmedTransactions(
				confirmedTransactions.data.reverse().slice(0, 10)
			);
			const confirmedBlocks = await axios.get(`http://localhost:5555/blocks`);
			setAllConfirmedBlocks(confirmedBlocks.data.reverse().slice(0, 10));
		})();
	}, []);

	return (
		<div>
			<br />
			<h1>IndiGold Explorer</h1>
			<br></br>
			<SearchBar></SearchBar>
			<br></br>
			<div class="row-container">
				<div>
					<div class="outlined">
						<Container fluid>
							<Col md="auto">Confirmed Blocks: {allConfirmedBlocks.length}</Col>
							{allConfirmedBlocks.length > 0 &&
								allConfirmedBlocks.map((d, index) => (
									<Row>
										<Col>&nbsp;</Col>
										<Col>Index: {`${d.index}`}</Col>
										<Col>BlockHash: {`${d.blockHash.slice(0, 20)}...`}</Col>
										<Col>Mined By: {`${d.minedBy.slice(0, 20)}...`}</Col>
									</Row>
								))}
						</Container>
					</div>
				</div>
				<br></br>
				<div>
					<div class="outlined">
						<Container fluid>
							<Col md="auto">
								Confirmed Transactions: {allConfirmedTransactions.length}
							</Col>
							{allConfirmedTransactions.length > 0 &&
								allConfirmedTransactions.map((d, index) => (
									<Row>
										<Col>&nbsp;</Col>
										<Col>
											TxnHash: {`${d.transactionDataHash.slice(0, 20)}...`}
										</Col>
										<Col>To: {`${d.to.slice(0, 20)}...`}</Col>
										<Col>From: {`${d.from.slice(0, 20)}...`}</Col>
									</Row>
								))}
						</Container>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Explorer;
