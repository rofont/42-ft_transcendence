import { fetcher } from "./fetcher.js"
import { clearContent, sendAlert, closeCovering } from "./utils.js"
import { closeModal } from "./modalConnection.js"
import { removeModal } from "./navbar.js"
import { getSVG } from "./iconSVG.js"

export async function generateSettings() {
	removeModal()
	document.querySelector('body').appendChild(createModalSettings())
	await initSettings();
}

async function preview_image() {
    const validation = document.getElementById("pictureUploadValidation")

    const img = document.getElementById("profilePicture")
    const file = this.files[0]
    const formData = new FormData()

    formData.append('image', file)

    const res = await fetcher.post("api/profile/uploadimage/", formData)
    if (res.status == 201) {
        img.src = URL.createObjectURL(file)
        img.width = 150
        img.height = 150
        img.onload = () => {
            URL.revokeObjectURL(file)
        }
        validation.innerHTML = ""
    } else if (res.status == 413) {
        validation.innerHTML = "Image is too large (> 1 mb)"
    } else {
        if (res.data['error'])
            validation.innerHTML = res.data['error']
    }
}

async function initSettings() {
//    const profileImageField = document.getElementById("profileImageField")

//   profileImageField.addEventListener("change", preview_image);
	initProfileInfoCard();
	await updateUserData();
}

async function updateUserData() {
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status >= 200 && res.status < 300) {
		updateProfileUsername(res.data);
		updateProfileInfo(res.data);
		updatePassAuth(res.data);
	}
	const imgElement = document.getElementById("profilePicture")
	const imageReply = await fetcher.get("api/profile/userpicture/")
	if (imageReply.status >= 200 && imageReply.status < 300 && imageReply.status != 202) {
		const imageURL = URL.createObjectURL(imageReply.data)
		imgElement.src = imageURL
		imgElement.onload = () => {
			URL.revokeObjectURL(imageReply.data)
		}
	}
	else {
		imgElement.src = "images/avatar.png"
	}
}

async function sendUpdateProfileRequest(url, body)
{
	const res = await fetcher.post(url, body)
	if (res.status >= 200 && res.status < 300)
	{
		const form = document.getElementById("profileForm")
		const alert = sendAlert('success', 'Your information has been saved', 3000)
		updateUserData();
		closeCovering(form.parentElement);
	}
	else if (res.status >= 400 && res.status < 500)
	{
		const firstNameField = document.getElementById("info-form-first-name");
		const firstNameValidation = document.getElementById("info-form-first-name-validation");
		const lastNameField = document.getElementById("info-form-last-name");
		const lastNameValidation = document.getElementById("info-form-last-name-validation");
		const emailField = document.getElementById("info-form-email");
		const emailValidation = document.getElementById("info-form-email-validation");
		if (res.data['first_name'])
		{
			firstNameField.classList.add("is-invalid")
			firstNameValidation.classList.add("invalid-feedback")
			firstNameValidation.innerText = res.data['first_name']
		}
		if (res.data['last_name'])
		{
			lastNameField.classList.add("is-invalid")
			lastNameValidation.classList.add("invalid-feedback")
			lastNameValidation.innerText = res.data['last_name']
		}
		if (res.data['email'])
		{
			emailField.classList.add("is-invalid")
			emailValidation.classList.add("invalid-feedback")
			emailValidation.innerText = res.data['email']
		}
	}
}

function resetFormInput(form) {
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
	})
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
								<a>Change password</a>
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

// PROFILE MAIN
function updateProfileUsername(data) {
	const usernameField = document.getElementById("profile-main-username");
	if (data.username) {
		usernameField.innerText = data.username;
	}
}

// PROFILE INFO

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

async function editProfileInfoCard() {
	const imgElement = document.getElementById("profilePicture")
	const imageReply = await fetcher.get("api/profile/userpicture/")
	if (imageReply.status == 200) {
		const imageURL = URL.createObjectURL(imageReply.data)
		imgElement.src = imageURL
		imgElement.onload = () => {
			URL.revokeObjectURL(imageReply.data)
		}
	}
	else {
		imgElement.src = "images/avatar.png"
	}
	const res = await fetcher.get("api/profile/userinfo/")
	if (res.status >= 200 && res.status < 300) {
		const usr = document.querySelector(".userName")
		if (usr && res.data.username)
			usr.innerText = res.data.username
		const mail = document.querySelector(".cardEmail")
		if(mail && res.data.email)
			mail.innerText = res.data.email
		const firstName = document.querySelector(".firstName");
		if (firstName && res.data.first_name)
			firstName.innerText = res.data.first_name;
		const lastName = document.querySelector(".lastName");
		if (lastName && res.data.last_name)
			lastName.innerText = res.data.last_name;
		updatePassAuth(res.data);
	}
}

async function initProfileInfoCard() {
	const modalBody = document.querySelector('.modal-body')
	const buttonEdit = document.getElementById("info-edit-button")
	buttonEdit.addEventListener("click", (e) => {
		initProfileInfoForm();
	});
}

function addChangeSettings () {
	const modalBody = document.querySelector('.modal-body')
	modalBody.insertAdjacentHTML("afterbegin", createProfileInfoForm())
	profileInfo()
	initSettings();
	authUpdateProfile()
}


function initProfileInfoForm() {
	createProfileInfoForm();
	profileInfoFormInteractions();
}

function createProfileInfoForm() {
	const modal = document.getElementById("settingsModal").querySelector(".modal-body");
	let form = document.createElement("div");
	form.classList.add("covering");
	form.innerHTML = `
		<form id="profileForm" action="api/profile/updateprofile/" method="POST" novalidate>
			<div class="mb-3">
				<label for="info-form-first-name" class="col-md-3 col-form-label">First Name</label>
				<input type="text" name="firstName" id="info-form-first-name" class="form-control" placeholder="First Name">
				<div id="info-form-first-name-validation"></div>
			</div>
			<div class="mb-3">
				<label for="info-form-last-name" class="col-md-3 col-form-label">Last Name</label>
				<input type="text" name="lastName" id="info-form-last-name" class="form-control" placeholder="Last Name">
				<div id="info-form-last-name-validation"></div>
			</div>
			<div class="mb-3">
				<label for="info-form-email" class="col-md-3 col-form-label">Email</label>
				<input type="email" name="email" id="info-form-email" class="form-control" placeholder="email" pattern="^[\\w\\-\\.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$">
				<div id="info-form-email-validation"></div>
			</div>
			<button type="submit" class="btn btn-primary" id="info-form-save">Save changes</button>
			<button type="button" class="btn btn-light" id="info-form-cancel">Cancel</button>
		</form>
	`
	const currFirstName = document.getElementById("info-first-name").querySelector(".user-dependent").innerText;
	const currLastName = document.getElementById("info-last-name").querySelector(".user-dependent").innerText;
	const currEmail = document.getElementById("info-email").querySelector(".user-dependent").innerText;
	modal.appendChild(form);
	setTimeout(() => {form.classList.add("show");}, 25);
	if (currFirstName) {
		document.getElementById("info-form-first-name").setAttribute('value', currFirstName);
	}
	if (currLastName) {
		document.getElementById("info-form-last-name").setAttribute('value', currLastName);
	}
	if (currEmail) {
		document.getElementById("info-form-email").setAttribute('value', currEmail);
	}
	if (document.getElementById("auth-type").querySelector(".user-dependent").innerText.includes("42")) {
		const emailField = document.getElementById("info-form-email");
		emailField.disabled = true;
		emailField.classList.add(".form-control-disabled");
	}
	return form;
}

function profileInfoFormInteractions()
{
	const modifyProfileForm = document.getElementById("profileForm");
	const btnCancel = document.getElementById("info-form-cancel");

	btnCancel.addEventListener("click", function () {
		closeCovering(modifyProfileForm.parentElement);
	})

	modifyProfileForm.addEventListener("submit", async function (e) {
		e.preventDefault();
		if (profileInfoChanged()) {
			if (profileInfoFormIsValid(modifyProfileForm)) {
				let data;
				if (document.getElementById("info-form-email").disabled) {
					document.getElementById("info-form-email").disabled = false;
					data = new FormData(e.target);
					document.getElementById("info-form-email").disabled = true;
				} else {
					data = new FormData(e.target);
				}
				const url = e.target.action;
				const body = {
					'email': data.get('email'),
					'first_name': data.get('firstName'),
					'last_name': data.get('lastName'),
				}
				await sendUpdateProfileRequest(url, body)
			}
		} else {
			closeCovering(modifyProfileForm.parentElement);
		}
	})
}

function profileInfoChanged() {
	const currFirstName = document.getElementById("info-first-name").querySelector(".user-dependent").innerText;
	const currLastName = document.getElementById("info-last-name").querySelector(".user-dependent").innerText;
	const currEmail = document.getElementById("info-email").querySelector(".user-dependent").innerText;
	const formFirstName = document.getElementById("info-form-first-name").value;
	const formLastName = document.getElementById("info-form-last-name").value;
	const formEmail = document.getElementById("info-form-email").value;
	if (currFirstName != formFirstName || currLastName != formLastName || currEmail != formEmail)
		return true;
	return false;
}

function profileInfoFormIsValid() {
	const currFirstName = document.getElementById("info-first-name").querySelector(".user-dependent").innerText;
	const currLastName = document.getElementById("info-last-name").querySelector(".user-dependent").innerText;
	const currEmail = document.getElementById("info-email").querySelector(".user-dependent").innerText;
	const firstNameField = document.getElementById("info-form-first-name");
	const firstNameValidation = document.getElementById("info-form-first-name-validation");
	const lastNameField = document.getElementById("info-form-last-name");
	const lastNameValidation = document.getElementById("info-form-last-name-validation");
	const emailField = document.getElementById("info-form-email");
	const emailValidation = document.getElementById("info-form-email-validation");
	let toggle = true;

	if (currFirstName != firstNameField.value && firstNameField.value.length > 35) {
		firstNameField.classList.add("is-invalid")
		firstNameValidation.classList.add("invalid-feedback")
		firstNameValidation.innerText = "First name is too long"
		toggle = false;
	}
	if (currLastName != lastNameField.value && lastNameField.value.length > 35) {
		lastNameField.classList.add("is-invalid")
		lastNameValidation.classList.add("invalid-feedback")
		lastNameValidation.innerText = "Last name is too long"
		toggle = false;
	}
	if (currEmail != emailField.value && (!emailField.validity.valid || emailField.value.length < 3)) {
		emailField.classList.add("is-invalid")
		emailValidation.classList.add("invalid-feedback")
		emailValidation.innerText = "Email is not valid"
		toggle = false;
	}
	return toggle;
}

// PASSWORD AND AUTHENTICATION
function updatePassAuth(data) {
	updateAuthType(data);
	updateOtpToggle(data);
}

function updateAuthType(data) {
	const authTypeField = document.querySelector("#auth-type").querySelector(".user-dependent");
	authTypeField.innerText = data.authType== "42" ? "Authenticating with 42" : "Standard";
}

function updateOtpToggle(data) {
	const otpToggle = document.querySelector("#otp-toggle").querySelector(".user-dependent");
	clearContent(otpToggle);
	if (data.authType == 42) {
		const text = document.createElement("span");
		otpToggle.appendChild(text);
		text.innerText = "not available (42 user)"
	}
	else {
		const button = document.createElement("button");
		otpToggle.appendChild(button);
		button.classList.add("btn", "btn-primary");
		if (data.otp) {
			button.innerText = "Deactivate 2FA";
			button.addEventListener("click", async function() {
				let result = await fetcher.post("/api/auth/otp/deactivate");
				if (result.status >= 200 && result.status < 300) {
					const res = await fetcher.get("api/profile/userinfo/")
					if (res.status >= 200 && res.status < 300) {
						updatePassAuth(res.data);
					}
				}
			});

		} else {
			button.innerText = "Activate 2FA";
			button.addEventListener("click", async function() {
				const result = await fetcher.post("/api/auth/otp/activate");
				const qrcode = result.data.otpCode;
				activateOtp(qrcode);
			})
		}
	}
}

function activateOtp(qrcode) {
	const otpForm = createOtpForm(qrcode);
	otpForm.querySelector("#activate-otp-cancel").addEventListener("click", () => {
		closeCovering(otpForm);
	});
	otpForm.querySelector("input").addEventListener("input", (e) => {
		e.target.classList.remove("is-invalid");
	});
	otpForm.querySelector("form").addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(e.target);
		const code = data.get('otp-code');
		if (!code || !(/^\d+$/.test(code))) {
			otpForm.querySelector("input").classList.add("is-invalid");
			return;
		}
		const result = await fetcher.post("/api/auth/otp/activate/confirm", {'code': code});
		if (result.status >= 200 && result.status < 300) {
			const res = await fetcher.get("api/profile/userinfo/")
			if (res.status >= 200 && res.status < 300) {
				updatePassAuth(res.data);
			}
			closeCovering(otpForm);
		}
		else {
			otpForm.querySelector("input").classList.add("is-invalid");
		}
	});
}

function createOtpForm(qrcode) {
	const modal = document.querySelector("#settingsModal").querySelector(".modal-body");
	let otpForm = document.createElement("div");
	otpForm.classList.add("covering");
	otpForm.innerHTML = `
		${qrcode}
		<span>Please scan this QR code and enter your one-time password to enable 2FA</span>
		<form id="activate-otp-form" action="/api/auth/otp/activate/confirm" method="POST">
			<input class="form-control" name="otp-code" type="text"></input>
		</form>
		<div class="d-flex flex-row">
			<button type="submit" id="activate-otp-confirm" form="activate-otp-form" class="btn btn-primary">Enable</button>
			<button type="button" id="activate-otp-cancel" class="btn btn-danger">Cancel</button>
		</div>`
	otpForm.querySelector("svg").setAttribute("style", "fill:currentColor");
	otpForm.querySelector("svg").querySelector("path").removeAttribute("fill");
	modal.appendChild(otpForm);
	setTimeout(() => {otpForm.classList.add("show");}, 25);
	return otpForm;
}
