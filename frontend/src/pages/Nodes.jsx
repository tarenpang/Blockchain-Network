import "../../custom.css";
import React from "react";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Row } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

function Mine() {
	const [pendingTransactions, setPendingTransactions] = useState([]);

	useEffect(() => {
		(async function loadData() {
			const pendingTransactions = await axios.get(
				`http://localhost:5555/transactions/pending`
			);
			setPendingTransactions(pendingTransactions.data.reverse().slice(0, 10));
		})();
	}, []);

	const nodeToMine = `http://localhost:5555`;

	const handleMineClick = async (nodeToMine) => {
		// Check if pending transactions exist
		// const allTransactions = await axios.get(`${nodeToMine}/transactions/all`);
		// const pendingTransactions = allTransactions.data.filter(
		// 	(transaction) => transaction.transferSuccessful !== true
		// ).length;

		// if (pendingTransactions === 0) {
		// 	toast.error("There are no pending transactions to mine.", {
		// 		position: "bottom-right",
		// 		theme: "colored",
		// 	});
		// 	return;
		// }

		// Ensure that user has a wallet address
		// if (!walletAddress) {
		//   toast.error("Require your mining address. Unlock your wallet.", {
		//     position: "bottom-right",
		//     theme: "colored",
		//   });
		//   return;
		// }

		// update the node list to show that the node is mining
		// let updateNodeList = allNodes.map((node) => {
		// 	if (node.url === nodeToMine) {
		// 		node.isMining = true;
		// 	}
		// 	return node;
		// });
		// setAllNodes(updateNodeList);

		// Send the request to the node to start mining
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		const body = {
			minerAddress: "2fddcc7a8d6b888497ea60aa0079d3ba0da170dd",
			difficulty: 5,
		};

		const miningResult = await axios.post(
			`http://localhost:5555/mine`,
			body,
			config
		);

		const result = miningResult.data.message;

		if (miningResult) {
			// let updateNodeList = allNodes.map((node) => {
			// 	if (node.url === nodeToMine) {
			// 		node.isMining = false;
			// 	}
			// 	return node;
			// });
			toast.success(result, {
				position: "bottom-right",
				theme: "colored",
			});

			// Update the node list
			// setAllNodes(updateNodeList);
		}
		// else {
		// 	toast.error("Unable to mine block.", {
		// 		position: "bottom-right",
		// 		theme: "colored",
		// 	});
		// }
	};

	return (
		<div>
			<ToastContainer
				position="top-right"
				closeOnClick
				draggable
				pauseOnHover
				theme="light"
			/>
			<br />
			<h1>Syncing the Network Nodes</h1>
			<div className="center-img">
				<img
					style={{ width: 225, height: 200 }}
					src="../src/assets/nodes-85.png"
					alt="Pickaxe Image"
				></img>
			</div>
			<br />
			<div className="container-fluid">
				<div className="card-md">
					<div className="card-body-md">
						<h4 className="card-title-1">Pending Transactions</h4>
						<div className="scrollable">
							{pendingTransactions.length > 0 &&
								pendingTransactions.map((d, index) => (
									<Row key={d.id}>
										<p>
											From:{" "}
											<span className="blue-text">{`${d.from.slice(
												0,
												12
											)}...${d.from.slice(28, 40)}`}</span>
										</p>
										<p>
											To:{" "}
											<span className="blue-text">{`${d.to.slice(
												0,
												12
											)}...${d.to.slice(28, 40)}`}</span>
										</p>
										<p>
											<span>
												Value: <span className="blue-text">{`${d.value}`}</span>
											</span>
										</p>
										<hr />
									</Row>
								))}
						</div>
					</div>
				</div>
			</div>
			<br />
			<div className="center-btn">
				<Button
					key="uniqueKey2"
					onClick={handleMineClick}
					type="submit"
					variant="primary"
					size="lg"
				>
					Mine
				</Button>
			</div>
		</div>
	);
}

export default Mine;
