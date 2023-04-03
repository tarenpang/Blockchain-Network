// import React, { useState, useEffect } from 'react';

// function App() {
// 	const [walletInfo, setWalletInfo] = useState({});

// 	useEffect(() => {
// 		fetch('http://localhost:3000/api/wallet-info')
// 			.then((response) => response.json())
// 			.then((json) => setWalletInfo(json));
// 	}, []);

// 	const { address, balance } = walletInfo;

// 	return (
// 		<div>
// 			<div>Welcome to the blockchain...</div>
// 			<div>Address: {address}</div>
// 			<div>Balance: {balance}</div>
// 		</div>
// 	);
// }

// export default App;

import React, { Component } from 'react';
import Blocks from './Blocks';
import logo from '../assets/logo.png';

class App extends Component {
	state = { walletInfo: {} };

	componentDidMount() {
		fetch('http://localhost:3000/api/wallet-info')
			.then((response) => response.json())
			.then((json) => this.setState({ walletInfo: json }));
	}

	render() {
		const { address, balance } = this.state.walletInfo;

		return (
			<div className="App">
				<img className="logo" src={logo}></img>
				<br />
				<div>Welcome to the blockchain...</div>
				<br />
				<div className="WalletInfo">
					<div>Address: {address}</div>
					<div>Balance: {balance}</div>
				</div>
				<br />
				<Blocks />
			</div>
		);
	}
}

export default App;
