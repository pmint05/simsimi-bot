fetch("https://api.simsimi.net/v1/?lang=vi&cf=true&text=kiss")
	.then((response) => response.json())
	.then((data) => {
		console.log(data.messages[0].attachment.payload.url);
	});
