fetch(
	"https://api.giphy.com/v1/gifs/random?api_key=0UTRbFtkMxAplrohufYco5IY74U8hOes&tag=funny"
)
	.then((response) => response.json())
	.then((data) => {
		console.log(data.data.image_original_url);
	});
