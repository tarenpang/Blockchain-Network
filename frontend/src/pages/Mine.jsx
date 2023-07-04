import "../../custom.css";
import React from "react";
import { useState, useEffect, useContext } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import axios from "axios";
import { NetworkContext } from "../context/NetworkContext";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

function Mine() {
	const [node1Running, setNode1Running] = useState(false);
	const [node2Running, setNode2Running] = useState(false);
	const [node3Running, setNode3Running] = useState(false);
	const [node4Running, setNode4Running] = useState(false);
	const [node5Running, setNode5Running] = useState(false);

	const [node1Workers, setNode1Workers] = useState(0);
	const [node2Workers, setNode2Workers] = useState(0);
	const [node3Workers, setNode3Workers] = useState(0);
	const [node4Workers, setNode4Workers] = useState(0);
	const [node5Workers, setNode5Workers] = useState(0);

	const [pendingTransactions, setPendingTransactions] = useState([]);
	const [currentDifficulty, setCurrentDifficulty] = useState(3);
	const [activeMinerPorts, setActiveMinerPorts] = useState(new Map());
	const [numberOfProcesses, setNumberOfProcesses] = useState(0);
	const [nonce, setNonce] = useState("None");

	const [hashRate, setHashRate] = useState("0000.00");
	// const [receivedHashRate, setReceivedHashRate] = useState("0000.00");
	const [receivedHashRates, setReceivedHashRates] = useState(new Map());
	const [receivedHashRatesInterval, setReceivedHashRatesInterval] =
		useState(null);
	// const [blockTime, setBlockTime] = useState("TBD");

	const { activePorts, setActivePorts } = useContext(NetworkContext);

	// const wsRef = useRef();
	const urls = [];
	const websockets = urls.map(url => new W3CWebSocket(url));
	let receivedWinner = null;

	useEffect(() => {
		const intervalId = setInterval(() => {
			for (let i = 0; i < websockets.length; i++) {
				const websocket = websockets[i];
				const port = Array.from(activeMinerPorts.keys())[i];
				websocket.send(JSON.stringify({ command: "getHashRate" }));
			}
		}, 5000);

		return () => {
			clearInterval(intervalId);
		};
	}, [activeMinerPorts]);

	useEffect(() => {
		(async function loadData() {
			const pendingTransactions = await axios.get(
				`http://localhost:5555/transactions/pending`
			);
			console.log(pendingTransactions.data);
			setPendingTransactions(pendingTransactions.data.reverse().slice(0, 10));
		})();
	}, []);

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

			let promises = [];
			let isResolved = false;
			const cancelTokenSource = axios.CancelToken.source();

			for (const [key, value] of activeMinerPorts.entries()) {
				const body = {
					minerAddress: value,
					difficulty: currentDifficulty,
				};
				let miningResult = axios.post(`http://localhost:${key}/mine`, body, {
					config,
					cancelToken: cancelTokenSource.token,
				});

				const promise = new Promise((resolve, reject) => {
					miningResult.then(resolve).catch(reject);
				});

				promises.push(promise);
			}

			Promise.race(promises).then(() => {
				isResolved = true;
				toast.success("Block is successfully mined!", {
					position: "top-right",
					theme: "light",
				});
			});

			// Update the state when the mining results are received
			useEffect(() => {
				if (isResolved) {
					setPendingTransactions([]);
					setHashRate(receivedHashRates.get(nodeToMine));
				}
			}, [receivedHashRates, nodeToMine, isResolved]);
		}
	};

	const connectWebSocket = () => {
		// Connect to WebSocket
		const urls = [];
		activeMinerPorts.forEach((address, port) => {
			urls.push(`ws://localhost:${port}`);
		});

		const receivedHashRatesMap = new Map();
		const promises = [];
		const websockets = urls.map(url => new WebSocket(url));

		// Clear the previous interval (if any)
		const previousInterval = receivedHashRatesInterval;
		if (previousInterval !== null) {
			clearInterval(previousInterval);
		}

		// Reset the receivedHashRates map
		setReceivedHashRates(new Map());

		for (let i = 0; i < websockets.length; i++) {
			const websocket = websockets[i];
			const port = Array.from(activeMinerPorts.keys())[i];

			const promise = new Promise((resolve, reject) => {
				websocket.onerror = () => {
					reject(new Error("Connection Error"));
				};

				websocket.onopen = () => {
					console.log(`WebSocket connection established for port ${port}`);
				};

				websocket.onclose = () => {
					console.log(`WebSocket connection closed for port ${port}`);
					resolve();
				};

				websocket.onmessage = event => {
					const data = JSON.parse(event.data);
					const receivedHashRate = data.hashRate;
					const receivedDateCreated = data.dateCreated;
					const receivedDateEnded = data.dateEnded;
					const receivedBlockTime = data.blockTime;
					// set hash rate to the received hash rate
					setReceivedHashRates(prevHashRates => {
						const updatedHashRates = new Map(prevHashRates);
						updatedHashRates.set(port, receivedHashRate);
						return updatedHashRates;
					});
					setHashRate(receivedHashRate);
					// set blockTime to received blockTime
					// setBlockTime(receivedBlockTime);
				};
			});

			promises.push(promise);
		}

		return () => {
			// Clean up WebSocket connections and interval when component unmounts
			websockets.forEach(websocket => websocket.close());
			clearInterval(intervalId);
		};
	};

	const handleNode1 = async () => {
		if (activePorts.includes(5555)) {
			if (!node1Running) {
				setNode1Running(true);
				console.log("workers: ", node1Workers);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5555, "538fc05fd0e0c92a03189844f1f4938605154988")
				);
				try {
					await axios.post("http://localhost:5555/spawn-child-processes", {
						numberOfProcesses,
					});
					console.log("Worker threads spawned successfully.");
				} catch (error) {
					console.error("Error while spawning worker threads:", error);
				}
			} else {
				setNode1Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5555);
					console.log("Node 1 has been disabled.");
					return newMap;
				});
			}
		} else {
			toast.error("Node 1 is not an Active Port!", {
				position: "top-right",
				theme: "light",
			});
		}
	};

	const handleNode2 = async () => {
		if (activePorts.includes(5556)) {
			if (!node2Running) {
				setNode2Running(true);
				console.log("workers: ", node2Workers);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5556, "2fddcc7a8d6b888497ea60aa0079d3ba0da170dd")
				);
				try {
					await axios.post("http://localhost:5556/spawn-child-processes", {
						numberOfProcesses,
					});
					console.log("Worker threads spawned successfully.");
				} catch (error) {
					console.error("Error while spawning worker threads:", error);
				}
			} else {
				setNode2Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5556);
					console.log("Node 2 has been disabled.");
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

	const handleNode3 = async () => {
		if (activePorts.includes(5557)) {
			if (!node3Running) {
				setNode3Running(true);
				console.log("workers: ", node3Workers);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5557, "2b798f6d6e8dce62f73a85f9447f4626af969cdd")
				);
				try {
					await axios.post("http://localhost:5557/spawn-child-processes", {
						numberOfProcesses,
					});
					console.log("Worker threads spawned successfully.");
				} catch (error) {
					console.error("Error while spawning worker threads:", error);
				}
				console.log("Test:" + activeMinerPorts);
				console.log([...activeMinerPorts.entries()]);
			} else {
				setNode3Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5557);
					console.log("Node 3 has been disabled.");
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

	const handleNode4 = async () => {
		if (activePorts.includes(5558)) {
			if (!node4Running) {
				setNode4Running(true);
				console.log("workers: ", node4Workers);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5558, "4d2845293163c8411ac459cecfdc076e897be0a6")
				);
				try {
					await axios.post("http://localhost:5558/spawn-child-processes", {
						numberOfProcesses,
					});
					console.log("Worker threads spawned successfully.");
				} catch (error) {
					console.error("Error while spawning worker threads:", error);
				}
			} else {
				setNode4Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5558);
					console.log("Node 4 has been disabled.");
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

	const handleNode5 = async () => {
		if (activePorts.includes(5559)) {
			if (!node5Running) {
				setNode5Running(true);
				console.log("workers: ", node5Workers);
				setActiveMinerPorts(prevMap =>
					new Map(prevMap).set(5559, "e38b9313293c7e3772900a38a4b1a39900d11db7")
				);
				try {
					await axios.post("http://localhost:5559/spawn-child-processes", {
						numberOfProcesses,
					});
					console.log("Worker threads spawned successfully.");
				} catch (error) {
					console.error("Error while spawning worker threads:", error);
				}
			} else {
				setNode5Running(false);
				setActiveMinerPorts(prevMap => {
					const newMap = new Map(prevMap);
					newMap.delete(5559);
					console.log("Node 5 has been disabled.");
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
				{/* 
				<h5 className="center-text">
					Block Time:{" "}
					<span style={{ fontSize: 16 }}>{blockTime ? blockTime : "TBD"}</span>
				</h5> */}
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
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</span>
							<span>Child_P</span>
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
									defaultValue="0"
									min="0"
									max="8"
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

								{receivedHashRates.has(5555) ? (
									<span className="text-hash">
										{receivedHashRates.get(5555)}
									</span>
								) : (
									<span className="text-hash">0000.00</span>
								)}

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
									defaultValue="0"
									min="0"
									max="8"
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

								{receivedHashRates.has(5556) ? (
									<span className="text-hash">
										{receivedHashRates.get(5556)}
									</span>
								) : (
									<span className="text-hash">0000.00</span>
								)}

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
									defaultValue="0"
									min="0"
									max="8"
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

								{receivedHashRates.has(5557) ? (
									<span className="text-hash">
										{receivedHashRates.get(5557)}
									</span>
								) : (
									<span className="text-hash">0000.00</span>
								)}

								<span className="text-hs">&nbsp;&nbsp;H/s</span>

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
									defaultValue="0"
									min="0"
									max="8"
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

								{receivedHashRates.has(5558) ? (
									<span className="text-hash">
										{receivedHashRates.get(5558)}
									</span>
								) : (
									<span className="text-hash">0000.00</span>
								)}

								<span className="text-hs">&nbsp;&nbsp;H/s</span>

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
									defaultValue="0"
									min="0"
									max="8"
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

								{receivedHashRates.has(5559) ? (
									<span className="text-hash">
										{receivedHashRates.get(5559)}
									</span>
								) : (
									<span className="text-hash">0000.00</span>
								)}

								<span className="text-hs">&nbsp;&nbsp;H/s</span>

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
