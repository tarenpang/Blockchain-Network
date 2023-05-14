import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
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

	const howLongAgo = function (dateCreated) {
		const dt = new Date(dateCreated);
		const timestamp = dt.getTime();
		const now = new Date();
		const then = timestamp;
		const diff = now - then;
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(seconds / 3600);
		const days = Math.floor(seconds / 86400);
		const weeks = Math.floor(seconds / 604800);
		const months = Math.floor(seconds / 2629800);
		const years = Math.floor(seconds / 31557600);
		if (seconds < 60) {
			return `${seconds} seconds ago`;
		} else if (minutes < 60) {
			return `${minutes} minutes ago`;
		} else if (hours < 24) {
			return `${hours} hours ago`;
		} else if (days < 7) {
			return `${days} days ago`;
		} else if (weeks < 4) {
			return `${weeks} weeks ago`;
		} else if (months < 12) {
			return `${months} months ago`;
		} else {
			return `${years} years ago`;
		}
	};

	return (
		<div>
			<br />
			<h1>Block Details</h1>
			<p />
			<div className="center-text bg-glass-3">
				<h4>Block Hash: {`${currentBlock.blockHash}`}</h4>
			</div>
			<br />
			<div className="card-wide">
				<div>
					<div>
						<div class="card-body-wide">
							<div className="scrollable">
								<Row>
									<p>
										<b>Block Index:</b>
										{` ${currentBlock.index}`}
									</p>
									<details>
										<summary>
											<b>Transactions:</b>
										</summary>
									</details>
									<div className="text-indent">
										{currentBlock.transactions &&
											currentBlock.transactions.length > 0 &&
											currentBlock.transactions.map((d, index) => (
												<div>
													<details>
														<summary>
															<b>&#8226; Transaction {index + 1}</b>
														</summary>
														<div className="text-indent">
															<p>
																<b>From:</b> {`${d.from}`}
															</p>
															<p>
																<b>To:</b> {`${d.to}`}
															</p>
															<p>
																<b>Amount:</b> {`${d.value}`}
															</p>
															<p>
																<b>Fee:</b> {`${d.fee}`}
															</p>
															<p>
																<b>Date:</b> {`${d.dateCreated}`}
															</p>
															<p>
																<b>Transaction Data Hash:</b>{" "}
																{`${d.transactionDataHash}`}
															</p>
															<p>
																<b>Sender Signature:</b> {`${d.senderPubKey}`}
															</p>
															<p>
																<b>Transaction Hash:</b>{" "}
																{`${d.transactionHash}`}
															</p>
														</div>
														<hr />
													</details>
												</div>
											))}
									</div>

									<p>
										<b>Difficulty:</b> {`${currentBlock.difficulty}`}
									</p>
									<p>
										<b>PrevBlockHash:</b> {`${currentBlock.prevBlockHash}`}
									</p>
									<p>
										<b>Mined By:</b> {`${currentBlock.minedBy}`}
									</p>
									<p>
										<b>blockDataHash:</b> {`${currentBlock.blockDataHash}`}
									</p>
									<p>
										<b>nonce:</b> {`${currentBlock.nonce}`}
									</p>
									<p>
										<b>Date Created:</b> {`${currentBlock.dateCreated}`}
									</p>
									<p>
										<b>Block Reward:</b> {`${currentBlock.blockReward}`}
									</p>
								</Row>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BlockDetails;

{
	/* <div class="card-body"></div>; */
}
