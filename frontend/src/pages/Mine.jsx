import "../../custom.css";
import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import WebSocket, { w3cwebsocket as W3CWebSocket } from "websocket";
// import useWebSocket, { ReadyState } from "react-use-websocket";
// import WebSocketService from "../WebSocketService";
import axios from "axios";
import { NetworkContext } from "../context/NetworkContext";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
// import NonceDisplay from "../websocket/NonceDisplay";

const WS_URL = "ws://localhost:5555";

function Mine() {
	const [node1Running, setNode1Running] = useState(false);
	const [node2Running, setNode2Running] = useState(false);
	const [node3Running, setNode3Running] = useState(false);
	const [node4Running, setNode4Running] = useState(false);
	const [node5Running, setNode5Running] = useState(false);
	const [pendingTransactions, setPendingTransactions] = useState([]);
	// const [messages, setMessages] = useState([]);
	const [currentDifficulty, setCurrentDifficulty] = useState(3);
	const [activeMinerPorts, setActiveMinerPorts] = useState(new Map());
	const [node1Workers, setNode1Workers] = useState(1);
	const [node2Workers, setNode2Workers] = useState(1);
	const [node3Workers, setNode3Workers] = useState(1);
	const [node4Workers, setNode4Workers] = useState(1);
	const [node5Workers, setNode5Workers] = useState(1);

	const [nonce, setNonce] = useState("None");
	const [hashRate, setHashRate] = useState("");
	const [receivedHashRate, setReceivedHashRate] = useState("0000.00");
	// const [intervalId, setIntervalId] = useState(null);

	const { activePorts, setActivePorts } = useContext(NetworkContext);

	const wsRef = useRef();

	useEffect(() => {
		const intervalId = setInterval(() => {
			setHashRate(receivedHashRate);
		}, 3000);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

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

	const connectWebSocket = () => {
		if (wsRef.current) return; // Prevent connecting multiple times

		wsRef.current = new W3CWebSocket(WS_URL);

		wsRef.current.onerror = () => {
			console.log("Connection Error");
		};

		wsRef.current.onopen = () => {
			console.log("WebSocket connection established.");
		};

		wsRef.current.onclose = () => {
			console.log("WebSocket connection closed.");
			wsRef.current = null;
			clearInterval(intervalId);
			setIntervalId(null);
		};

		wsRef.current.onmessage = event => {
			const data = JSON.parse(event.data);
			// const receivedNonce = data.nonce;
			const receivedDateEnded = data.dateEnded;
			const receivedHashRate = data.hashRate;

			// setNonce(receivedNonce);
			setReceivedHashRate(receivedHashRate);
		};
	};

	const disconnectWebSocket = () => {
		if (wsRef.current) {
			wsRef.current.close();
		}
	};

	const handleMineClick = async nodeToMine => {
		// Check if pending transactions exist
		if (pendingTransactions.length === 0) {
			toast.error("No pending transactions to mine!", {
				position: "top-right",
				theme: "light",
			});
			return;
		} else {
			// Connect to WebSocket
			connectWebSocket();

			// Send the request to the node to start mining
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			const body = {
				minerAddress: secureLocalStorage.getItem("address"),
				difficulty: currentDifficulty,
			};

			// Start Mining
			const miningResult = await axios.post(
				`http://localhost:5555/mine`,
				body,
				config
			);

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
		if (activePorts.includes(5555)) {
			if (!node1Running) {
				setNode1Running(true);
				console.log("workers: ", node1Workers);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5555, node1Workers)
				);
				// console.log([...activeMinerPorts.entries()]);
			} else {
				setNode1Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5555);
					console.log("delete");
					return newMap;
				});
				// console.log([...activeMinerPorts.entries()]);
			}
		} else {
			toast.error("Node 1 is not an Active Port!", {
				position: "top-right",
				theme: "light",
			});
		}
	};

	const handleNode2 = () => {
		if (activePorts.includes(5556)) {
			if (!node2Running) {
				setNode2Running(true);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5556, node2Workers)
				);
			} else {
				setNode2Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5556);
					console.log("delete");
					return newMap;
				});
				// console.log([...activeMinerPorts.entries()]);
			}
		} else {
			toast.error("Node 2 is not an Active Port!", {
				position: "top-right",
				theme: "light",
			});
		}
	};

	const handleNode3 = () => {
		if (activePorts.includes(5557)) {
			if (!node3Running) {
				setNode3Running(true);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5557, node3Workers)
				);
				console.log("Test:" + activeMinerPorts);
				console.log([...activeMinerPorts.entries()]);
			} else {
				setNode3Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5557);
					console.log("delete");
					return newMap;
				});
				// console.log([...activeMinerPorts.entries()]);
			}
		} else {
			toast.error("Node 3 is not an Active Port!", {
				position: "top-right",
				theme: "light",
			});
		}
	};

	const handleNode4 = () => {
		if (activePorts.includes(5558)) {
			if (!node4Running) {
				setNode4Running(true);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5558, node4Workers)
				);
			} else {
				setNode4Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5558);
					console.log("delete");
					return newMap;
				});
				// console.log([...activeMinerPorts.entries()]);
			}
		} else {
			toast.error("Node 4 is not an Active Port!", {
				position: "top-right",
				theme: "light",
			});
		}
	};

	const handleNode5 = () => {
		if (activePorts.includes(5559)) {
			if (!node5Running) {
				setNode5Running(true);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5559, node5Workers)
				);
			} else {
				setNode5Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5559);
					console.log("delete");
					return newMap;
				});
				// console.log([...activeMinerPorts.entries()]);
			}
		} else {
			toast.error("Node 5 is not an Active Port!", {
				position: "top-right",
				theme: "light",
			});
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
					<span>Set Current Difficulty: </span>
					<input
						type="number"
						defaultValue="3"
						min="1"
						max="6"
						style={{
							width: 40,
							height: 24,
							backdropFilter: blur(5),
							// show 1px border
							border: "2px solid rgba(255, 255, 255, 0.18)",
							backgroundColor: "transparent",
						}}
						onChange={e => setCurrentDifficulty(e.target.value)}
					/>
				</h5>

				<h5 className="center-text">
					Successful Miner: <span style={{ fontSize: 16 }}>{null}</span>
				</h5>
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
										border: "1.6px solid rgba(255, 255, 255, 0.18)",
										backgroundColor: "transparent",
									}}
									onChange={e => setNode1Workers(e.target.value)}
									disabled={node1Running ? "disabled" : ""}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>
								{/* <span>{node1Running ? "268.75 H/s" : "000.00 H/s"}</span> */}
								<span className="text-hash">{receivedHashRate}</span>
								<span className="text-hs">&nbsp;&nbsp;H/s</span>
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
										border: "1.6px solid rgba(255, 255, 255, 0.18)",
										backgroundColor: "transparent",
									}}
									onChange={e => setNode2Workers(e.target.value)}
									disabled={node2Running ? "disabled" : ""}
								/>
								<span>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</span>

								<span className="text-hash">
									{node2Running ? { receivedHashRate } : "0000.00"}
								</span>
								{/* <span className="text-hash">{receivedHashRate}</span> */}
								<span className="text-hs">&nbsp;&nbsp;H/s</span>

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
										border: "1.6px solid rgba(255, 255, 255, 0.18)",
										backgroundColor: "transparent",
									}}
									onChange={e => setNode3Workers(e.target.value)}
									disabled={node3Running ? "disabled" : ""}
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
										border: "1.6px solid rgba(255, 255, 255, 0.18)",
										backgroundColor: "transparent",
									}}
									onChange={e => setNode4Workers(e.target.value)}
									disabled={node4Running ? "disabled" : ""}
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
										border: "1.6px solid rgba(255, 255, 255, 0.18)",
										backgroundColor: "transparent",
									}}
									onChange={e => setNode5Workers(e.target.value)}
									disabled={node5Running ? "disabled" : ""}
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
					style={{
						height: 36,
						paddingTop: 5,
						textAlign: "center",
						marginLeft: 20,
					}}
					key="uniqueKey2"
					onClick={handleMineClick}
					// onClick={() => console.log(activeMinerPorts)}
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
