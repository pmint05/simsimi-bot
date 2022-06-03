const express = require("express");
const bodyParser = require("body-parser");
const viewEngine = require("./src/configs/viewEngine");
const webRoutes = require("./src/routes/web");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);

webRoutes(app);

let port = process.env.PORT || 8888;

app.listen(port, () => {
	console.log("App is running at port: ", port);
});
