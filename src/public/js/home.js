fetch("https://api.simsimi.net/v1/?text=hi&lang=vi")
	.then((response) => response.json())
	.then((data) => console.log(data.success));
