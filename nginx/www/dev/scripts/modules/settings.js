import { fetcher } from "./fetcher.js"
import { removeModal } from "./navbar.js"
import { getSVG } from "./iconSVG.js"
import { initProfileMain } from "./settings_main.js"
import { initProfileInfoCard } from "./settings_profileInfo.js"
import { initPasswordChange } from "./settings_passChange.js"
import { updateOtpToggle } from "./settings_otp.js"

export async function generateSettings() {
	removeModal()
	document.querySelector('body').appendChild(createModalSettings())
	await initSettings();
}

function createModalSettings() {
	let settingsModal = document.createElement("div");
	settingsModal.classList.add("modal", "fade");
	settingsModal.id = "settingsModal";
	settingsModal.innerHTML = `
		<div class="modal-dialog">
			<div class="modal-content bg-dark">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="profileLabel">Settings</h1>
					<div class="btn-close" data-bs-dismiss="modal"></div>
				</div>
				<div class="modal-body">
					<div>
						<div id="profile-main" class="d-flex flex-column align-items-center">
							<div id="profile-picture-container">
								<img id="profilePicture" class="rounded-circle-border mx-auto d-block" alt="profilePicture"/>
								${getSVG.formSVG.updatePicture}
							</div>
							<span id="profile-main-username" class="fs-1"></span>
						</div>
						<hr style="width: 25%">
						<div id="profile-info">
							<h5>Profile info</h5>
							<div id="info-first-name" class="d-flex flex-column">
								<span class="fw-bold">First Name</span>
								<span class="user-dependent"></span>
							</div>
							<div id="info-last-name" class="d-flex flex-column">
								<span class="fw-bold">Last Name</span>
								<span class="user-dependent"></span>
							</div>
							<div id="info-email" class="d-flex flex-column">
								<span class="fw-bold">Email</span>
								<span class="user-dependent"></span>
							</div>
							<a id="info-edit-button" class="btn btn-primary">edit</a>
						</div>
						<hr style="width: 25%">
						<div id="pass-auth">
							<h5>Password and authentication</h5>
							<div id="pass-change">
							</div>
							<div id="auth-type" class="d-flex flex-column">
								<span class="fw-bold">Account type</span>
								<span class="user-dependent"></span>
							</div>
							<div id="otp-toggle">
								<span class="fw-bold">Two-factor authentication</span>
								<div class="user-dependent"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`
	return settingsModal;
}

async function initSettings() {
	await updateUserData();
	initProfileMain();
	initProfileInfoCard();
	initPasswordChange();
}

export async function updateUserData() {
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status >= 200 && res.status < 300) {
		updateProfileUsername(res.data);
		updateProfileInfo(res.data);
		updatePassAuth(res.data);
	}
	const imgElement = document.getElementById("profilePicture")
	const imageReply = await fetcher.get("api/profile/userpicture/")
	if (imageReply.status >= 200 && imageReply.status < 300 && imageReply.status != 202) {
//		const imageURL = URL.createObjectURL(imageReply.data.image)
		imgElement.src = imageReply.data.image
		imgElement.onload = () => {
			URL.revokeObjectURL(imageReply.data)
		}
	}
	else {
		imgElement.src = "images/avatar.png"
	}
}

function updateProfileUsername(data) {
	const usernameField = document.getElementById("profile-main-username");
	if (data.username) {
		usernameField.innerText = data.username;
	}
}

function updateProfileInfo(data) {
	const emailProfile = document.getElementById("info-email").querySelector(".user-dependent");
	if ("email" in data) {
		emailProfile.innerText = data.email
	}
	const firstName = document.getElementById("info-first-name").querySelector(".user-dependent");
	if ("first_name" in data) {
		firstName.innerText = data.first_name;
	}
	const lastName = document.getElementById("info-last-name").querySelector(".user-dependent");
	if ("last_name" in data) {
		lastName.innerText = data.last_name;
	}
}

export function updatePassAuth(data) {
	const authTypeField = document.querySelector("#auth-type").querySelector(".user-dependent");
	authTypeField.innerText = data.authType== "42" ? "Authenticating with 42" : "Standard";
	updateOtpToggle(data);
}
