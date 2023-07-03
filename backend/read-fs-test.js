const fs = require("fs");
const filePath = "./store/state.json";

// Read from the shared state file
fs.readFile(filePath, "utf8", function (err, data) {
	if (err) throw err;
	const state = JSON.parse(data);
	receivedValue = state.isMined;
	console.log("isMined:", receivedValue);
});
