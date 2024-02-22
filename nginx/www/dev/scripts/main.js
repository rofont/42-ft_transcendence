import { fetcher } from "./modules/fetcher.js";
import * as bootstrap from "./bootstrap/bootstrap.bundle.min.js";
import { initAuth } from "./modules/auth.js";
import { createButton } from "./modules/buttonNav.js";
import { initSettings } from "./modules/settings.js";
import { initRouter } from "./modules/router.js";
import { createNavBar } from "./modules/navbar.js";
import { generateModal } from "./modules/modal.js";

import { render_game_board } from "./modules/pong.js";



(async function(){
	render_game_board()
	createNavBar();
	generateModal();
	await createButton();
	initAuth();
	initSettings();
	initRouter();
})();
