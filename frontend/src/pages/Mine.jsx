import "../../custom.css";
import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
// import WebSocketService from "../WebSocketService";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

const WS_URL = "ws://localhost:5555";

function Mine() {
	const [node1Running, setNode1Running] = useState(false);
	const [node2Running, setNode2Running] = useState(false);
	const [node3Running, setNode3Running] = useState(false);
	const [node4Running, setNode4Running] = useState(false);
	const [node5Running, setNode5Running] = useState(false);
	const [pendingTransactions, setPendingTransactions] = useState([]);
	const [messages, setMessages] = useState([]);
	const [nonce, setNonce] = useState(0);
	// const [isValid, setIsValid] = useState(false);

	// const startTime = Date.now();
	// let nonceCount = 0;

	// useWebSocket(WS_URL, {
	// 	onOpen: () => {
	// 		console.log("WebSocket connection established.");
	// 	},
	// });

	const socket = new WebSocket(WS_URL); // Replace with your server URL

	/*socket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		const nonce = data.nonce;

		setNonce(nonce);
		// Process the received nonce as needed
	};*/

	useEffect(() => {
		(async function loadData() {
			const pendingTransactions = await axios.get(
				`http://localhost:5555/transactions/pending`
			);
			console.log(pendingTransactions.data);
			setPendingTransactions(pendingTransactions.data.reverse().slice(0, 10));
		})();
	}, []);

	const nodeToMine = `http://localhost:5555`;

	const handleMineClick = async nodeToMine => {
		// Check if pending transactions exist
		if (pendingTransactions.length === 0) {
			toast.error("No pending transactions to mine!", {
				position: "top-right",
				theme: "light",
			});
			return;
		} else {
			// Send the request to the node to start mining
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			const body = {
				minerAddress: secureLocalStorage.getItem("address"),
				difficulty: 3,
			};

			const miningResult = await axios.post(
				`http://localhost:5555/mine`,
				body,
				config
			);

			socket.onmessage = function (event) {
				const data = JSON.parse(event.data);
				const nonce = data.nonce;

				console.log("nonce: ", nonce);

				setNonce(nonce);
				// Process the received nonce as needed
			};

			setPendingTransactions([]);
			const result = miningResult.data.message;

			if (miningResult) {
				toast.success(result, {
					position: "top-right",
					theme: "light",
				});
			}
		}
	};

	const handleNode1 = () => {
		if (!node1Running) {
			setNode1Running(true);
		} else {
			setNode1Running(false);
		}
	};

	const handleNode2 = () => {
		if (!node2Running) {
			setNode2Running(true);
		} else {
			setNode2Running(false);
		}
	};

	const handleNode3 = () => {
		if (!node3Running) {
			setNode3Running(true);
		} else {
			setNode3Running(false);
		}
	};

	const handleNode4 = () => {
		if (!node4Running) {
			setNode4Running(true);
		} else {
			setNode4Running(false);
		}
	};

	const handleNode5 = () => {
		if (!node5Running) {
			setNode5Running(true);
		} else {
			setNode5Running(false);
		}
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
			<h1>Mine</h1>

			{/* {activePorts.length > 0 ? (
        <h3 className="center-text">Active Ports: {activePorts.join(", ")}</h3>
      ) : (
        <h3 className="center-text">Active Ports: None</h3>
      )} */}
			<div className="center-img">
				<img
					style={{ width: 225, height: 200 }}
					src="../src/assets/pickaxe-83.png"
					alt="Pickaxe Image"
				></img>
			</div>
			<br />
			<div className="bg-glass-6">
				<h5 className="center-text">
					Pending Transactions:
					<span style={{ fontSize: 16 }}>
						{" "}
						{pendingTransactions.length > 0
							? pendingTransactions.length
							: "None"}
					</span>
				</h5>
				<h5 className="center-text">
					Current Difficulty:<span style={{ fontSize: 16 }}> 3</span>
				</h5>
				<h5 className="center-text">
					Winning Miner:<span style={{ fontSize: 16 }}> TBD</span>
				</h5>
			</div>
			<br />

			<div className="bg-glass-0">
				<div>
					{/* <ul>
					{messages.map((message, index) => (
						<li key={index}>
							test
							<strong>{message.source}: </strong>
							{message.data}
						</li>
					))}
				</ul> */}
					<h5 className="center-text">
						Test:<span style={{ fontSize: 16 }}>{nonce}</span>
					</h5>
				</div>
			</div>
			<br />

			<div className="container-fluid">
				<div className="card-md-5">
					<div className="card-body-md-0">
						<h4 className="card-title-5">Mining Dashboard</h4>
						<p style={{ height: 0, marginTop: -5, marginBot: 0, padding: 0 }}>
							<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
							<span> Miner</span>
							<span>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</span>
							<span>Status</span>
							<span>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</span>
							<span>Workers</span>
							<span>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</span>
							<span>Hashrate</span>
							<span>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</span>
							<span>On / Off</span>
						</p>

						<hr
							style={{
								border: 0,
								clear: "both",
								display: "block",
								width: "92%",
								backgroundColor: "#FFFF",
								height: "1px",
								marginLeft: 12,
								marginBot: 40,
							}}
						/>
						<div className="scrollable-2">
							<div style={{ marginTop: -14 }}>
								<span className="current-box-dull">Node 1</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span className="text-status">
									{node1Running ? "On " : "Off"}
								</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<input
									type="number"
									defaultValue="1"
									min="1"
									max="4"
									style={{
										width: 40,
										backdropFilter: blur(5),
										border: "none",
										backgroundColor: "transparent",
									}}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span>{node1Running ? "268.75 H/s" : "000.00 H/s"}</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<div className="btn-justify-end">
									<Button
										style={{
											width: "7rem",
											height: "2rem",
											paddingTop: "0",
											backgroundColor: node1Running ? "#e551d7" : "",
										}}
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={() => handleSyncClick(5555)} // Pass the port associated with Node 1
										onClick={handleNode1}
									>
										{node1Running ? "Disable" : "Enable"}
									</Button>
								</div>
								<br />
								<br />
								<span className="current-box-dull">Node 2</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span className="text-status">
									{node2Running ? "On " : "Off"}
								</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<input
									type="number"
									defaultValue="1"
									min="1"
									max="4"
									style={{
										width: 40,
										backdropFilter: blur(5),
										border: "none",
										backgroundColor: "transparent",
									}}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span>{node2Running ? "333.33 H/s" : "000.00 H/s"}</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<div className="btn-justify-end">
									<Button
										style={{
											width: "7rem",
											height: "2rem",
											paddingTop: "0",
											backgroundColor: node2Running ? "#e551d7" : "",
										}}
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={() => handleSyncClick(5556)} // Pass the port associated with Node 2
										onClick={handleNode2}
									>
										{node2Running ? "Disable" : "Enable"}
									</Button>
								</div>
								<br />
								<br />
								<span className="current-box-dull">Node 3</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span className="text-status">
									{node3Running ? "On " : "Off"}
								</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<input
									type="number"
									defaultValue="1"
									min="1"
									max="4"
									style={{
										width: 40,
										backdropFilter: blur(5),
										border: "none",
										backgroundColor: "transparent",
									}}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span>{node3Running ? "268.77 H/s" : "000.00 H/s"}</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<div className="btn-justify-end">
									<Button
										style={{
											width: "7rem",
											height: "2rem",
											paddingTop: "0",
											backgroundColor: node3Running ? "#e551d7" : "",
										}}
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={() => handleSyncClick(5557)} // Pass the port associated with Node 3
										onClick={handleNode3}
									>
										{node3Running ? "Disable" : "Enable"}
									</Button>
								</div>
								<br />
								<br />
								<span className="current-box-dull">Node 4</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span className="text-status">
									{node4Running ? "On " : "Off"}
								</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<input
									type="number"
									defaultValue="1"
									min="1"
									max="4"
									style={{
										width: 40,
										backdropFilter: blur(5),
										border: "none",
										backgroundColor: "transparent",
									}}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span>{node4Running ? "268.78 H/s" : "000.00 H/s"}</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<div className="btn-justify-end">
									<Button
										style={{
											width: "7rem",
											height: "2rem",
											paddingTop: "0",
											backgroundColor: node4Running ? "#e551d7" : "",
										}}
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={() => handleSyncClick(5558)} // Pass the port associated with Node 4
										onClick={handleNode4}
									>
										{node4Running ? "Disable" : "Enable"}
									</Button>
								</div>
								<br />
								<br />
								<span className="current-box-dull">Node 5</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span className="text-status">
									{node5Running ? "On " : "Off"}
								</span>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<input
									type="number"
									defaultValue="1"
									min="1"
									max="4"
									style={{
										width: 40,
										backdropFilter: blur(5),
										border: "none",
										backgroundColor: "transparent",
									}}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								<span>{node5Running ? "268.79 H/s" : "000.00 H/s"}</span>
								<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
								<div className="btn-justify-end">
									<Button
										style={{
											width: "7rem",
											height: "2rem",
											paddingTop: "0",
											backgroundColor: node5Running ? "#e551d7" : "",
										}}
										variant="primary"
										size="md"
										type="button"
										value="Submit"
										// onClick={() => handleSyncClick(5559)} // Pass the port associated with Node 5
										onClick={handleNode5}
									>
										{node5Running ? "Disable" : "Enable"}
									</Button>
								</div>
								<br />
								<br />
							</div>
						</div>
					</div>
				</div>
			</div>
			<br />
			<div className="center-btn">
				<Button
					style={{ marginLeft: 20 }}
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
