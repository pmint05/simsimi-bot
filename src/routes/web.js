const express = require("express");
const homeController = require("../controllers/homeController");

let router = express.Router();

let initWebRoutes = (app) => {
	router.get("/", homeController.getHomePage);

	//setup getstarted button & whitelisted domain
	router.post("/setup-profile", homeController.setupProfile);
	//setup persistent menu
	router.post("/setup-persistent-menu", homeController.setupPersistentMenu);

	router.post("/webhook", homeController.postWebhook);
	router.get("/webhook", homeController.getWebhook);
	return app.use("/", router);
};

module.exports = initWebRoutes;
