import React, { useState, useEffect } from 'react';

function App() {
	const [walletInfo, setWalletInfo] = useState({});

	useEffect(() => {
		fetch('http://localhost:3000/api/wallet-info')
			.then((response) => response.json())
			.then((json) => setWalletInfo(json));
	}, []);

	const { address, balance } = walletInfo;

	return (
		<div>
			<div>Welcome to the blockchain...</div>
			<div>Address: {address}</div>
			<div>Balance: {balance}</div>
		</div>
	);
}

export default App;

// import React, { Component } from 'react';

// class App extends Component {
// 	state = { walletInfo: {} };

// 	componentDidMount() {
// 		fetch('http://localhost:3000/api/wallet-info')
// 			.then((response) => response.json())
// 			.then((json) => this.setState({ walletInfo: json }));
// 	}

// 	render() {
// 		const { address, balance } = this.state.walletInfo;

// 		return (
// 			<div>
// 				<div>Welcome to the blockchain...</div>
// 				<div>Address: {address}</div>
// 				<div>Balance: {balance}</div>
// 			</div>
// 		);
// 	}
// }

// export default App;
