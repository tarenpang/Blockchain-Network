import React, { useEffect } from "react";
import {
	loadCaptchaEnginge,
	LoadCanvasTemplate,
	validateCaptcha,
} from "react-simple-captcha";

const CaptchaTest = () => {
	useEffect(() => {
		loadCaptchaEnginge(6);
	}, []);

	const doSubmit = () => {
		let user_captcha = document.getElementById("user_captcha_input").value;
		if (validateCaptcha(user_captcha) === true) {
			alert("Captcha Matched");
			loadCaptchaEnginge(6);
			document.getElementById("user_captcha_input").value = "";
		} else {
			alert("Captcha Does Not Match");
			document.getElementById("user_captcha_input").value = "";
		}
	};

	return (
		<div>
			<div className="container">
				<div className="form-group">
					<div className="center-text">
						<LoadCanvasTemplate />
					</div>
					<div className="center-text">
						<div>
							<input
								placeholder="Enter Captcha Value"
								id="user_captcha_input"
								name="user_captcha_input"
								type="text"
							></input>
						</div>
					</div>
					<br />
					<div className="center-text">
						<div>
							<button className="btn btn-primary" onClick={doSubmit}>
								Submit
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CaptchaTest;
