require("dotenv").config();
import { text } from "body-parser";
import { response } from "express";

import request from "request";
const fetch = require("node-fetch");
import { URL } from "url";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = "https://i.postimg.cc/rs93Bgqg/avt-remake.png";

let callSendAPI = async (sender_psid, response) => {
	return new Promise(async (resolve, reject) => {
		try {
			// Construct the message body
			let request_body = {
				recipient: {
					id: sender_psid,
				},
				message: response,
			};
			await sendTypingOn(sender_psid);
			await sendMarkReadMessage(sender_psid);

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
						resolve("message sent!");
					} else {
						console.error("Unable to send message:" + err);
					}
				}
			);
		} catch (error) {
			reject(error);
		}
	});
};
let sendTypingOn = (sender_psid) => {
	// Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		sender_action: "typing_on",
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
				console.log("sendTypingOn sent!");
			} else {
				console.error("Unable to send sendTypingOn:" + err);
			}
		}
	);
};
let sendMarkReadMessage = (sender_psid) => {
	// Construct the message body
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		sender_action: "mark_seen",
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
				console.log("sendMarkReadMessage sent!");
			} else {
				console.error("Unable to send sendMarkReadMessage:" + err);
			}
		}
	);
};
let getUserName = (sender_psid) => {
	return new Promise((resolve, reject) => {
		// Send the HTTP request to the Messenger Platform
		request(
			{
				uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
				method: "GET",
			},
			(err, res, body) => {
				console.log(body);
				if (!err) {
					body = JSON.parse(body);
					// "first_name": "Peter",
					// "last_name": "Chang",
					let username = `${body.last_name} ${body.first_name}`;
					resolve(username);
				} else {
					console.error("Unable to send message:" + err);
					reject(err);
				}
			}
		);
	});
};
let getStartTemplate = (username) => {
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "generic",
				elements: [
					{
						title: `Chào mừng ${username} đã đến với Crazy Simsimi!🥰`,
						subtitle:
							"Crazy Simsimi được tạo ra với mục đích giải trí và thay thế cho Crush của bạn =))",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ABOUT AUTHOR",
								payload: "ABOUT_AUTHOR",
							},
						],
					},
				],
			},
		},
	};
	return response;
};
let getQuickStart = () => {
	let response = {
		text: "Hãy nói xin chào với Simsimi nào",
		quick_replies: [
			{
				content_type: "text",
				title: "Chào Simsimi",
				payload: "HELLO",
			},
		],
	};
	return response;
};
let handleGetStarted = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let username = await getUserName(sender_psid);
			let response1 = getStartTemplate(username);
			let response2 = getQuickStart();

			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let reply = async (message) => {
	let url = new URL(`https://api.simsimi.net/v1/?text=${message}&lang=vi_VN`);

	const options = {
		method: "GET",
		headers: {
			"Content-Type": "text/plain;charset=UTF-8",
		},
	};
	let response;
	await fetch(url, options)
		.then((res) => res.json())
		.then((data) => {
			response = {
				text: data.success,
			};
		});
	return response;

	// await request(
	// 	{
	// 		uri: `https://api.simsimi.net/v1/`,
	// 		qs: { text: message, lang: "vi_VN" },
	// 		method: "GET",
	// 	},
	// 	(err, res, body) => {
	// 		console.log(body.success);
	// 		if (!err) {
	// 			console.log("succeeds!");
	// 			let respone = {
	// 				text: body.success,
	// 			};
	// 			return respone;
	// 		} else {
	// 			console.error("Error :" + err);
	// 		}
	// 	}
	// );
};
let sendAuthorInfo = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getAuthorInfo();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getAuthorInfo = () => {
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "button",
				text: 'Page này được mình tạo ra với mục đích giải trí, giúp những bạn codon có người để tâm sự 😉\n▷ Hướng dẫn sử dụng: Hãy nhắn bất kỳ tin nhắn nào và Simsimi sẽ trả lời bạn. Chúc bạn một ngày mới tốt lành!\n"𝘍𝘰𝘭𝘭𝘰𝘸 𝘮𝘦 𝘢𝘯𝘥 𝘺𝘰𝘶\'𝘭𝘭 𝘯𝘦𝘷𝘦𝘳 𝘣𝘦 𝘢𝘭𝘰𝘯𝘦!"\nCreated by 𝐩𝐦𝐢𝐧𝐭𝟎𝟓 with ❤️',
				buttons: [
					{
						type: "web_url",
						url: "fb.com/pmint05",
						title: "AUTHOR",
					},
				],
			},
		},
	};
	return response;
};
let handleSendFirstMessage = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await reply("Chào Simsimi");

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let sendWjbuTemplate = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getWjbuTemplate();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let sendNSFWTemplate = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getNSFWTemplate();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getWjbuTemplate = () => {
	let respone = {
		text: "Wjbu content 🤫. Dưới đây là các lựa chọn cho bạn:",
		quick_replies: [
			{
				content_type: "text",
				title: "kiss",
				payload: "WIBU_KISS",
			},
			{
				content_type: "text",
				title: "lick",
				payload: "WIBU_LICK",
			},
			{
				content_type: "text",
				title: "hug",
				payload: "WIBU_HUG",
			},
			{
				content_type: "text",
				title: "baka",
				payload: "WIBU_BAKA",
			},
			{
				content_type: "text",
				title: "cry",
				payload: "WIBU_CRY",
			},
			{
				content_type: "text",
				title: "poke",
				payload: "WIBU_POKE",
			},
			{
				content_type: "text",
				title: "smug",
				payload: "WIBU_SMUG",
			},
			{
				content_type: "text",
				title: "slap",
				payload: "WIBU_SLAP",
			},
			{
				content_type: "text",
				title: "tickle",
				payload: "WIBU_TICKLE",
			},
			{
				content_type: "text",
				title: "pat",
				payload: "WIBU_PAT",
			},
			{
				content_type: "text",
				title: "laugh",
				payload: "WIBU_LAUGH",
			},
			{
				content_type: "text",
				title: "feed",
				payload: "WIBU_FEED",
			},
			{
				content_type: "text",
				title: "cuddle",
				payload: "WIBU_CUDDLE",
			},
		],
	};
	return respone;
};
let getNSFWTemplate = () => {
	let respone = {
		text: "NSFW content 🔞. Cảnh báo: Dưới đây là nội dung 18+",
		quick_replies: [
			{
				content_type: "text",
				title: "hentai",
				payload: "NSFW_HENTAI",
			},
			{
				content_type: "text",
				title: "pussy",
				payload: "NSFW_PUSSY",
			},
			{
				content_type: "text",
				title: "bj",
				payload: "NSFW_BJ",
			},
			{
				content_type: "text",
				title: "lesbian",
				payload: "NSFW_LESBIAN",
			},
			{
				content_type: "text",
				title: "lewd",
				payload: "NSFW_LEWD",
			},
		],
	};
	return respone;
};
let sendWjbuContent = (text, sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = {
				text: "Bạn chờ sim 1 xíu nha ...",
			};
			let response2 = await searchWjbuContent(text);

			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let sendNSFWContent = (text, sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = {
				text: "Bạn chờ sim 1 xíu nha ...",
			};
			let response2 = await searchWjbuContent(text);

			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let searchWjbuContent = async (message) => {
	let url = `https://api.simsimi.net/v1/?lang=vi&cf=true&text=${message}`;
	// const options = {
	// 	method: "GET",
	// 	headers: {
	// 		"Content-Type": "text/plain;charset=UTF-8",
	// 	},
	// };
	let response;
	await fetch(url)
		.then((res) => res.json())
		.then((data) => {
			response = {
				attachment: {
					type: "image",
					payload: {
						is_reusable: true,
						url: data.messages[0].attachment.payload.url,
					},
				},
			};
		});
	return response;
};
let sendGifTemplate = (sender_psid) => {};
let getGifTemplate = () => {
	let respone = {
		text: "Wjbu content 🤫. Dưới đây là các lựa chọn cho bạn:",
		quick_replies: [
			{
				content_type: "text",
				title: "anime",
				payload: "GIF_ANIME",
			},
			{
				content_type: "text",
				title: "action",
				payload: "GIF_ACTION",
			},
			{
				content_type: "text",
				title: "funny",
				payload: "GIF_FUNNY",
			},
			{
				content_type: "text",
				title: "fail",
				payload: "GIF_FAIL",
			},
			{
				content_type: "text",
				title: "like-a-boss",
				payload: "GIF_LIKE_A_BOSS",
			},
			{
				content_type: "text",
				title: "dank-memes",
				payload: "GIF_DARK_MEMES",
			},
			{
				content_type: "text",
				title: "memes",
				payload: "GIF_MEMES",
			},
			{
				content_type: "text",
				title: "loop",
				payload: "GIF_LOOP",
			},
			{
				content_type: "text",
				title: "animals",
				payload: "GIF_ANIMALS",
			},
			{
				content_type: "text",
				title: "pixel",
				payload: "GIF_PIXEL",
			},
			{
				content_type: "text",
				title: "timelapse",
				payload: "GIF_TIMELAPSE",
			},
		],
	};
	return respone;
};
let getGifUrl = (text) => {
	// https://api.giphy.com/v1/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&tag=fail&rating=pg-13
};
module.exports = {
	handleGetStarted: handleGetStarted,
	callSendAPI: callSendAPI,
	getUserName: getUserName,
	sendTypingOn: sendTypingOn,
	sendMarkReadMessage: sendMarkReadMessage,
	reply: reply,
	sendAuthorInfo: sendAuthorInfo,
	handleSendFirstMessage: handleSendFirstMessage,
	sendWjbuTemplate: sendWjbuTemplate,
	sendWjbuContent: sendWjbuContent,
	sendNSFWContent: sendNSFWContent,
	sendNSFWTemplate: sendNSFWTemplate,
	sendGifTemplate: sendGifTemplate,
};
