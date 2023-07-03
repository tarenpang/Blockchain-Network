const fs = require("fs");
const lockfile = require("proper-lockfile");

const filePath = "./store/state.json";
const data = { isMined: "true" };
const jsonData = JSON.stringify(data, null, 2);

lockfile
	.lock(filePath, { retries: { retries: 10, minTimeout: 100 } })
	.then(() => {
		// File lock acquired, perform the write operation
		fs.writeFile(filePath, jsonData, err => {
			if (err) {
				console.error("Error writing to file:", err);
			} else {
				console.log("Data written to file successfully.");
			}

			// Release the lock when done
			lockfile.unlock(filePath).catch(err => {
				console.error("Error releasing file lock:", err);
			});
		});
	})
	.catch(err => {
		console.error("Error acquiring file lock:", err);
	});
