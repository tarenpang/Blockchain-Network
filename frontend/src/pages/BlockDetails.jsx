import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";

function BlockDetails() {
	const [currentBlock, setCurrentBlock] = useState([]);
	const { blockHash } = useParams();

	useEffect(() => {
		(async function loadData() {
			const currentBlock = await axios.get(
				`http://localhost:5555/block/${blockHash}`
			);
			setCurrentBlock(currentBlock.data);
		})();
	}, []);

	return (
		<div>
			<br />
			<h1>Block {`${currentBlock.index}`} Details</h1>
			<br></br>
			<div class="row-container">
				<div>
					<br></br>
					<div>
						<div class="outlined">
							<Container fluid>
								<Row>
									<Col>&nbsp;</Col>
									<Col>BlockHash: {`${currentBlock.blockHash}`}</Col>
									<Col>Mined By: {`${currentBlock.minedBy}`}</Col>
									<Col>Difficulty: {`${currentBlock.difficulty}`}</Col>
									<Col>Date: {`${currentBlock.dateCreated}`}</Col>
								</Row>
							</Container>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BlockDetails;
