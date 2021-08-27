require("dotenv").config();
import request from "request";
import chatbotServices from "../services/chatbotServices";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let callSendAPI = async (sender_psid, response) => {
	// Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		message: response,
	};

	// Send the HTTP request to the Messenger Platform
	request(
		{
			uri: "https://graph.facebook.com/v2.6/me/messages",
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			if (!err) {
				console.log("message sent!");
			} else {
				console.error("Unable to send message:" + err);
			}
		}
	);
};

let getHomePage = (req, res) => {
	return res.render("homepage.ejs");
};
let postWebhook = (req, res) => {
	let body = req.body;

	// Checks this is an event from a page subscription
	if (body.object === "page") {
		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function (entry) {
			// Gets the body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);

			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log("Sender PSID: " + sender_psid);

			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};
let getWebhook = (req, res) => {
	// Your verify token. Should be a random string.
	let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

	// Parse the query params
	let mode = req.query["hub.mode"];
	let token = req.query["hub.verify_token"];
	let challenge = req.query["hub.challenge"];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {
		// Checks the mode and token sent is correct
		if (mode === "subscribe" && token === VERIFY_TOKEN) {
			// Responds with the challenge token from the request
			console.log("WEBHOOK_VERIFIED");
			res.status(200).send(challenge);
		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
};
// Handles messages events
async function handleMessage(sender_psid, received_message) {
	let response;
	if (
		received_message.quick_reply &&
		received_message.quick_reply.payload != ""
	) {
		let QR_payload = received_message.quick_reply.payload;
		let WjbuPayload = QR_payload.search("WIBU");
		let NSFWPayload = QR_payload.search("NSFW");
		let GifPayload = QR_payload.search("GIF");
		if (WjbuPayload != -1) {
			let title = received_message.text;
			await chatbotServices.sendWjbuContent(title, sender_psid);
		} else if (NSFWPayload != -1) {
			let title = received_message.text;
			await chatbotServices.sendNSFWContent(title, sender_psid);
		} else if (GifPayload != -1) {
			let title = received_message.text;
			await chatbotServices.sendGifContent(title, sender_psid);
		}
		// else if (QR_payload === "HELLO") {
		// 	await chatbotServices.handleSendFirstMessage(sender_psid);
		// }
		return;
	}
	// Checks if the message contains text
	if (received_message.text) {
		let message = received_message.text;
		if (message === "/wjbu") {
			await chatbotServices.sendWjbuTemplate(sender_psid);
		// } else if (message === "/nsfw") {
		// 	await chatbotServices.sendNSFWTemplate(sender_psid);
		} else if (message === "/gif") {
			await chatbotServices.sendGifTemplate(sender_psid);
		} else if (message === "/help") {
			await chatbotServices.sendHelpTemplate(sender_psid);
		} else {
			await chatbotServices.sendTypingOn(sender_psid);
			await chatbotServices.sendMarkReadMessage(sender_psid);
			response = await chatbotServices.reply(received_message.text);
		}
		// Create the payload for a basic text message, which
		// will be added to the body of our request to the Send API
	} else if (received_message.attachments) {
		// Get the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		response = {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "Is this the right picture?",
							subtitle: "Tap a button to answer.",
							image_url: attachment_url,
							buttons: [
								{
									type: "postback",
									title: "Yes!",
									payload: "yes",
								},
								{
									type: "postback",
									title: "No!",
									payload: "no",
								},
							],
						},
					],
				},
			},
		};
	}

	// Send the response message
	callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
	let response;

	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	switch (payload) {
		case "yes":
			response = { text: "Thanks!" };
			break;
		case "no":
			response = { text: "Oops, try sending another image." };
			break;
		case "RESTART_CHATBOT":
		case "GET_STARTED":
			await chatbotServices.handleGetStarted(sender_psid);
			break;
		case "ABOUT_PAGE":
			await chatbotServices.sendPageInfo(sender_psid);
			break;
		case "WJBU":
			await chatbotServices.sendWjbuTemplate(sender_psid);
			break;
		case "NSFW":
			await chatbotServices.sendNSFWTemplate(sender_psid);
			break;
		case "GIF":
			await chatbotServices.sendGifTemplate(sender_psid);
			break;
		case "HELP":
			await chatbotServices.sendHelpTemplate(sender_psid);
			break;

		default:
			response = { text: `Oops, Xin lỗi tôi không hiểu ${payload}` };
	}

	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
}
let setupProfile = async (req, res) => {
	//call profile facebook api
	// Construct the message body
	let request_body = {
		get_started: { payload: "GET_STARTED" },
		whitelisted_domains: ["https://simsimi-pmint05.herokuapp.com/"],
	};

	// Send the HTTP request to the Messenger Platform
	await request(
		{
			uri: `https://graph.facebook.com/v11.0/me/messenger_profile`,
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			console.log(body);
			if (!err) {
				console.log("Setup user profile succeeds!");
			} else {
				console.error("Unable to setup:" + err);
			}
		}
	);

	return res.send("Setup user profile succeeds!");
};
let setupPersistentMenu = async (req, res) => {
	//call profile facebook api
	// Construct the message body
	let request_body = {
		persistent_menu: [
			{
				locale: "default",
				composer_input_disabled: false,
				call_to_actions: [
					{
						type: "web_url",
						title: "AUTHOR",
						url: "fb.com/pmint05/",
					},
					{
						type: "postback",
						title: "/help",
						payload: "HELP",
					},
					{
						type: "postback",
						title: "Khởi động lại bot",
						payload: "RESTART_CHATBOT",
					},
				],
			},
		],
	};

	// Send the HTTP request to the Messenger Platform
	await request(
		{
			uri: `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: "POST",
			json: request_body,
		},
		(err, res, body) => {
			console.log(body);
			if (!err) {
				console.log("Setup persistent menu succeeds!");
			} else {
				console.error("Unable to setup:" + err);
			}
		}
	);

	return res.send("Setup persistent menu succeeds!");
};

module.exports = {
	getHomePage: getHomePage,
	postWebhook: postWebhook,
	getWebhook: getWebhook,
	setupProfile: setupProfile,
	setupPersistentMenu: setupPersistentMenu,
};
