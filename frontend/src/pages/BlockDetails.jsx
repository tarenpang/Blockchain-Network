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
