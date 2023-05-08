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
			<div class="container-fluid">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title">
							{/* Confirmed Blocks: {allConfirmedBlocks.length} */}
							Latest Blocks
						</h4>
						<div class="scrollable">
							{allConfirmedBlocks.length > 0 &&
								allConfirmedBlocks.map((d, index) => (
									<Row>
										<p>Index: {`${d.index}`}</p>
										<p>BlockHash: {`${d.blockHash.slice(0, 20)}...`}</p>
										<p>Mined By: {`${d.minedBy.slice(0, 20)}...`}</p>
										<hr />
									</Row>
								))}
						</div>
					</div>
				</div>

				<div class="card">
					<div class="card-body">
						<h4 class="card-title">
							{/* Confirmed Transactions: {allConfirmedTransactions.length} */}
							Latest Transactions
						</h4>
						<div class="scrollable">
							{allConfirmedBlocks.length > 0 &&
								allConfirmedBlocks.map((d, index) => (
									<Row>
										<p>TransactionHash: {`${d.index}`}</p>
										<p>To: {`${d.blockHash.slice(0, 20)}...`}</p>
										<p>From: {`${d.minedBy.slice(0, 20)}...`}</p>
										<hr />
									</Row>
								))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Explorer;
