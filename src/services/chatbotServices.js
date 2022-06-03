require("dotenv").config();

const request = require("request");
const fetch = require("node-fetch");
import { URL } from "url";

const ytdl = require("ytdl-core");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED =
	"https://github.com/pmint05/Symee/blob/main/assets/images/simava_origin.jpg?raw=true";

let callSendAPI = async (sender_psid, response) => {
	return new Promise((resolve, reject) => {
		try {
			// Construct the message body
			let request_body = {
				recipient: {
					id: sender_psid,
				},
				message: response,
			};
			sendTypingOn(sender_psid);
			sendMarkReadMessage(sender_psid);

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
let callSendAttachment = async (sender_psid, response) => {
	return new Promise((resolve, reject) => {
		try {
			// Construct the message body
			let request_body = {
				recipient: {
					id: sender_psid,
				},
				message: response,
			};
			sendTypingOn(sender_psid);
			sendMarkReadMessage(sender_psid);

			// Send the HTTP request to the Messenger Platform
			request(
				{
					uri: "https://graph.facebook.com/v14.0/me/message_attachments",
					qs: { access_token: PAGE_ACCESS_TOKEN },
					method: "POST",
					json: request_body,
				},
				(err, res, body) => {
					if (!err) {
						console.log(body);
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
	// let response = {
	// 	attachment: {
	// 		type: "template",
	// 		payload: {
	// 			template_type: "generic",
	// 			elements: [
	// 				{
	// 					title: `Chào mừng ${username} đã đến với Crazy Simsimi!🥰`,
	// 					subtitle:
	// 						"Crazy Simsimi được tạo ra với mục đích giải trí và thay thế cho Crush của bạn =))",
	// 					image_url: IMAGE_GET_STARTED,
	// 					buttons: [
	// 						{
	// 							type: "postback",
	// 							title: "ABOUT PAGE",
	// 							payload: "ABOUT_PAGE",
	// 						},
	// 						{
	// 							type: "postback",
	// 							title: "/help",
	// 							payload: "HELP",
	// 						},
	// 					],
	// 				},
	// 			],
	// 		},
	// 	},
	// };
	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "generic",
				elements: [
					{
						title: `👋 Hi ${username}, welcome to Crazy Simsimi!`,
						subtitle:
							"Crazy Simsimi is created for entertainment purposes only. Hope you have the best experience ❤️",
						image_url: IMAGE_GET_STARTED,
						buttons: [
							{
								type: "postback",
								title: "ABOUT PAGE",
								payload: "ABOUT_PAGE",
							},
							{
								type: "postback",
								title: "/help",
								payload: "HELP",
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
	// let response = {
	// 	text: "Hãy nói xin chào với Simsimi nào 👋",
	// 	quick_replies: [
	// 		{
	// 			content_type: "text",
	// 			title: "Chào Simsimi",
	// 			payload: "",
	// 		},
	// 	],
	// };
	let response = {
		text: "Let say hi 👋",
		quick_replies: [
			{
				content_type: "text",
				title: "Hi Simsimi",
				payload: "",
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
	// getUserLocation();
	//api
	// https://api.Simsimi.net/v2/?text=hello&lc=en&cf=false
	let url = new URL(
		`https://api.Simsimi.net/v2/?text=${message}&lc=en&cf=false`
	);

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
	// 		uri: `https://api.Simsimi.net/v2/`,
	// 		qs: { text: message, lang: "vn_VN" },
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
let sendPageInfo = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getPageInfo();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getPageInfo = () => {
	// let text = 'Page này được mình tạo ra với mục đích giải trí, giúp những bạn codon có người để tâm sự 😉.Chúc bạn một ngày mới tốt lành!\n"𝘍𝘰𝘭𝘭𝘰𝘸 𝘮𝘦 𝘢𝘯𝘥 𝘺𝘰𝘶\'𝘭𝘭 𝘯𝘦𝘷𝘦𝘳 𝘣𝘦 𝘢𝘭𝘰𝘯𝘦!"\nCreated by 𝐩𝐦𝐢𝐧𝐭𝟎𝟓 with ❤️';
	let text =
		'A funny chatbot made with ❤️ by ᴘᴍɪɴᴛ05 aka ʀʜɪɴᴢᴏ.\n"𝘍𝘰𝘭𝘭𝘰𝘸 𝘮𝘦 𝘢𝘯𝘥 𝘺𝘰𝘶\'𝘭𝘭 𝘯𝘦𝘷𝘦𝘳 𝘣𝘦 𝘢𝘭𝘰𝘯𝘦!"';

	let response = {
		attachment: {
			type: "template",
			payload: {
				template_type: "button",
				text: text,
				buttons: [
					{
						type: "web_url",
						url: "https://fb.com/pmint05",
						title: "AUTHOR",
					},
					{
						type: "postback",
						payload: "HELP",
						title: "/help",
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
let sendAnimeTemplate = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getAnimeTemplate();

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
let getAnimeTemplate = () => {
	let response = {
		text: "Anime 🤫. Please choose a tag.",
		quick_replies: [
			{
				content_type: "text",
				title: "kiss",
				payload: "ANIME_KISS",
			},
			{
				content_type: "text",
				title: "lick",
				payload: "ANIME_LICK",
			},
			{
				content_type: "text",
				title: "hug",
				payload: "ANIME_HUG",
			},
			{
				content_type: "text",
				title: "baka",
				payload: "ANIME_BAKA",
			},
			{
				content_type: "text",
				title: "cry",
				payload: "ANIME_CRY",
			},
			{
				content_type: "text",
				title: "poke",
				payload: "ANIME_POKE",
			},
			{
				content_type: "text",
				title: "smug",
				payload: "ANIME_SMUG",
			},
			{
				content_type: "text",
				title: "slap",
				payload: "ANIME_SLAP",
			},
			{
				content_type: "text",
				title: "tickle",
				payload: "ANIME_TICKLE",
			},
			{
				content_type: "text",
				title: "pat",
				payload: "ANIME_PAT",
			},
			{
				content_type: "text",
				title: "laugh",
				payload: "ANIME_LAUGH",
			},
			{
				content_type: "text",
				title: "feed",
				payload: "ANIME_FEED",
			},
			{
				content_type: "text",
				title: "cuddle",
				payload: "ANIME_CUDDLE",
			},
		],
	};
	return response;
};
let getNSFWTemplate = () => {
	let response = {
		text: "NSFW 🔞. Warning: 18+ content!",
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
			{
				content_type: "text",
				title: "4K",
				payload: "NSFW_4K",
			},
			{
				content_type: "text",
				title: "wallpapers",
				payload: "NSFW_WALLPAPERS",
			},
			{
				content_type: "text",
				title: "spank",
				payload: "NSFW_SPANK",
			},
			{
				content_type: "text",
				title: "boobs",
				payload: "NSFW_BOOBS",
			},
			{
				content_type: "text",
				title: "cum",
				payload: "NSFW_CUM",
			},
		],
	};
	return response;
};
let sendAnimeContent = (text, sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = {
				text: "Wait me a second ...",
			};
			let response2 = await searchAnimeContent(text);
			let response3 = {
				text: "Once more?",
				quick_replies: [
					{
						content_type: "text",
						title: "kiss",
						payload: "ANIME_KISS",
					},
					{
						content_type: "text",
						title: "lick",
						payload: "ANIME_LICK",
					},
					{
						content_type: "text",
						title: "hug",
						payload: "ANIME_HUG",
					},
					{
						content_type: "text",
						title: "baka",
						payload: "ANIME_BAKA",
					},
					{
						content_type: "text",
						title: "cry",
						payload: "ANIME_CRY",
					},
					{
						content_type: "text",
						title: "poke",
						payload: "ANIME_POKE",
					},
					{
						content_type: "text",
						title: "smug",
						payload: "ANIME_SMUG",
					},
					{
						content_type: "text",
						title: "slap",
						payload: "ANIME_SLAP",
					},
					{
						content_type: "text",
						title: "tickle",
						payload: "ANIME_TICKLE",
					},
					{
						content_type: "text",
						title: "pat",
						payload: "ANIME_PAT",
					},
					{
						content_type: "text",
						title: "laugh",
						payload: "ANIME_LAUGH",
					},
					{
						content_type: "text",
						title: "feed",
						payload: "ANIME_FEED",
					},
					{
						content_type: "text",
						title: "cuddle",
						payload: "ANIME_CUDDLE",
					},
				],
			};
			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);
			await callSendAPI(sender_psid, response3);

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
				text: "Wait me a second ...",
			};
			let response2 = await searchNSFWGif(text);
			let response3 = {
				text: "Once more?",
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
					{
						content_type: "text",
						title: "4K",
						payload: "NSFW_4K",
					},
					{
						content_type: "text",
						title: "wallpapers",
						payload: "NSFW_WALLPAPERS",
					},
					{
						content_type: "text",
						title: "spank",
						payload: "NSFW_SPANK",
					},
					{
						content_type: "text",
						title: "boobs",
						payload: "NSFW_BOOBS",
					},
					{
						content_type: "text",
						title: "cum",
						payload: "NSFW_CUM",
					},
				],
			};

			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);
			await callSendAPI(sender_psid, response3);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let searchAnimeContent = async (message) => {
	let url = `http://api.nekos.fun:8080/api/${message}`;
	let response;
	await fetch(url)
		.then((res) => res.json())
		.then((data) => {
			console.log(data.image);
			response = {
				attachment: {
					type: "image",
					payload: {
						is_reusable: true,
						url: data.image,
					},
				},
			};
		});
	console.log(response);
	return response;
};
let sendGifTemplate = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getGifTemplate();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let searchNSFWGif = async (message) => {
	let api = `http://api.nekos.fun:8080/api/${message}`;
	let response;
	await fetch(api)
		.then((res) => res.json())
		.then((data) => {
			response = {
				attachment: {
					type: "image",
					payload: {
						is_reusable: true,
						url: data.image,
					},
				},
			};
		});
	return response;
};
let getGifTemplate = () => {
	let response = {
		text: "Please choose a tag/category:",
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
	return response;
};
let sendGifContent = (text, sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = {
				text: "Wait me a second ...",
			};
			let response2 = await getGifUrl(text);
			let response3 = {
				text: "Once more?",
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

			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);
			await callSendAPI(sender_psid, response3);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getGifUrl = async (text) => {
	// https://api.giphy.com/v2/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&tag=fail&rating=pg-13
	let url = ` https://api.giphy.com/v1/gifs/random?api_key=xadFVE62O9xIpP2JUtsOkqxqv7ex6b86&tag=${text}`;
	let response;
	await fetch(url)
		.then((res) => res.json())
		.then((data) => {
			// console.log(data);
			response = {
				attachment: {
					type: "image",
					payload: {
						is_reusable: true,
						url: data.data.images.original.url,
					},
				},
			};
		});
	return response;
};
let sendHelpTemplate = (sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = getHelpTemplate();

			//send generic template message
			await callSendAPI(sender_psid, response);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getHelpTemplate = () => {
	// let response = {
	// 	text: "Một số câu lệnh chính:\n• /help: Simsimi sẽ gửi cho bạn đống tin nhắn này.\n• /gif: Sim sẽ gửi gif ngẫu nhiên với tag mà bạn chọn.\n• /wjbu: Gif hoặc ảnh cho mấy bạn wjbu 😉.\n ... \nCác tính năng hay ho khác vẫn đang được cập nhật\n→ Note: Do lưu lượng truy cập khá lớn nên Simsimi có thể sẽ rep chậm (30s - 1p). Các bạn chịu khó đợi Simsimi rep nha. Cảm ơn các bạn đã ghé thăm CS. Yêu các bạn ❤️🥰!",
	// };
	let response = {
		text: "Currently supported languages: ᴇɴɢʟɪꜱʜ.\nMulti-language: Updating ...\nCommands:\n• /help: Help messages\n• /gif: Simsimi will send you a random gif with the tag you selected.\n• /anime: Simsimi will send you a random anime gif/image with the tag you selected.\n ...\nHave a nice day ❤️.\n© 2020 • ᴄʀᴀᴢʏ ꜱɪᴍꜱɪᴍɪ",
	};
	//\n• /nsfw: Content 18+ 🔞.
	return response;
};
let sendMp3Link = (link, sender_psid) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response1 = {
				text: "🔍 Searching for mp3 link...",
			};
			let urls = await searchMp3Link(link);
			let response2 = await getMp3Link(link);
			let response3 = {
				text: urls == [] ? "" : urls[0],
			};
			//send generic template message
			await callSendAPI(sender_psid, response1);
			await callSendAPI(sender_psid, response2);
			await callSendAPI(sender_psid, response3);

			resolve("done");
		} catch (e) {
			reject(e);
		}
	});
};
let getMp3Link = async (link) => {
	let response;
	let urls = await searchMp3Link(link);
	if (urls.length == 0) {
		response = {
			text: "Sorry, I can't find any mp3 link for this video. Please try another video.",
		};
	} else {
		response = {
			attachment: {
				type: "audio",
				payload: {
					url: urls[0],
					is_reusable: true,
				},
			},
		};
		console.log(response);
	}
	// let url = `https://ytdl-pmint05.herokuapp.com/mp3link?vndeoUrl=${link}`;
	// await fetch(url)
	// 	.then((res) => res.json())
	// 	.then((data) => {
	// 		response = {
	// 			// text: data.mp3_link[0],
	// 			attachment: {
	// 				type: "video",
	// 				payload: {
	// 					url: data.mp3_link[0],
	// 				},
	// 			},
	// 		};
	// 	});
	return response;
};
let searchMp3Link = async (link) => {
	let urls = [];
	let info = await ytdl.getInfo(link);
	for (let j = 0; j < info.formats.length; j++) {
		if (
			info.formats[j].hasAudio == true &&
			info.formats[j].hasVideo == false &&
			info.formats[j].audioCodec == "mp4a.40.2"
		) {
			urls.push(info.formats[j].url);
		}
	}
	// for (let i = 0; i < info.formats.length; i++) {
	// 	if (info.formats[i].audioQuality != "AUDIO_QUALITY_MEDIUM") {
	// 		continue;
	// 	} else {
	// 		urls.push(info.formats[i].url);
	// 	}
	// }
	return urls;
};
let getUserLocation = (sender_psid) => {
	return new Promise((resolve, reject) => {
		// Send the HTTP request to the Messenger Platform
		request(
			{
				uri: `https://graph.facebook.com/${sender_psid}?fields=locale&access_token=${PAGE_ACCESS_TOKEN}`,
				method: "GET",
			},
			(err, res, body) => {
				console.log(body);
				if (!err) {
					body = JSON.parse(body);
					console.log(body);
					resolve("hehe");
				} else {
					console.error("Unable to send message:" + err);
					reject(err);
				}
			}
		);
	});
};
module.exports = {
	handleGetStarted: handleGetStarted,
	callSendAPI: callSendAPI,
	getUserName: getUserName,
	sendTypingOn: sendTypingOn,
	sendMarkReadMessage: sendMarkReadMessage,
	reply: reply,
	sendPageInfo: sendPageInfo,
	handleSendFirstMessage: handleSendFirstMessage,
	sendAnimeTemplate: sendAnimeTemplate,
	sendAnimeContent: sendAnimeContent,
	sendNSFWContent: sendNSFWContent,
	sendNSFWTemplate: sendNSFWTemplate,
	sendGifTemplate: sendGifTemplate,
	sendGifContent: sendGifContent,
	sendHelpTemplate: sendHelpTemplate,
	sendMp3Link: sendMp3Link,
};
