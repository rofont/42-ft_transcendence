import { fetcher } from "./fetcher.js"

async function preview_image() {
    const profileImageContainer = document.getElementById("profileImageContainer")
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

        profileImageContainer.classList.add("d-none")
        validation.innerHTML = ""
    } else if (res.status == 413) {
        validation.innerHTML = "Image is too large (> 1 mb)"
    } else {
        if (res.data['error'])
            validation.innerHTML = res.data['error']
    }
}

export function initSettings() {
    const profileImageField = document.getElementById("profileImageField")

    profileImageField.addEventListener("change", preview_image);
}


export function profileInfo()
{
	const settingsBtn = document.querySelector("#settingsButton")
	if (settingsBtn) {
		settingsBtn.addEventListener("click", async function (e) {
			document.querySelector("#profileUsername").disabled = true
			document.querySelector("#profileEmail").disabled = true
			document.querySelector("#profileSaveChanges").classList.add("d-none")
			document.querySelector("#profileImageContainer").classList.add("d-none")
			document.querySelector("#modifyProfile").classList.remove("d-none")
			const imgElement = document.getElementById("profilePicture")
			imgElement.src = "images/avatar.png"
			const imageReply = await fetcher.get("api/profile/userpicture/")
			if (imageReply.status == 200) {
				const imageURL = URL.createObjectURL(imageReply.data)
				imgElement.src = imageURL
				imgElement.onload = () => {
					URL.revokeObjectURL(imageReply.data)
				}
			}
			const res = await fetcher.get("api/profile/userinfo/")
			if (res.status == 200) {

				document.querySelector("#profileUsername").value = res.data['username']
				document.querySelector("#profileEmail").value = res.data['email']
			}
		})
	}
}

export function changeProfile()
{
	const modifySettingsBtn = document.querySelector("#modifyProfile")
	modifySettingsBtn.addEventListener("click", async function (e) {
		const profileUsername = document.querySelector("#profileUsername")
		const emailUsername = document.querySelector("#profileEmail")
		profileUsername.disabled = false
		emailUsername.disabled = false
		document.querySelector("#modifyProfile").classList.add("d-none")
		document.querySelector("#profileSaveChanges").classList.remove("d-none")
		document.querySelector("#profileImageContainer").classList.remove("d-none")
	})
}

export function authUpdateProfile()
{
	const modifyProfileForm = document.querySelector("#profileForm")
	modifyProfileForm.addEventListener("submit", function (e) {
		e.preventDefault()
		const data = new FormData(e.target)
		const url = e.target.action
		const body = {
			'username': data.get('username'),
			'email': data.get('email'),
		}
		sendUpdateProfileRequest(url, body)
	})
}

async function sendUpdateProfileRequest(url, body)
{
	const profileUsername = document.querySelector("#profileUsername")
	const profileEmail = document.querySelector("#profileEmail")
	const profileUsernameValidation = document.querySelector("#profileUsernameValidation")
	const profileEmailValidation = document.querySelector("#profileEmailValidation")

	const form = document.getElementById("profileForm")
	resetFormInput(form)

	const res = await fetcher.post(url, body)
	if (res.status == 201)
	{
		document.querySelector("#profileSaveChanges").classList.add("d-none")
		document.querySelector("#profileImageContainer").classList.add("d-none")
		document.querySelector("#modifyProfile").classList.remove("d-none")
		profileUsername.disabled = true
		profileEmail.disabled = true
		// alert test
		document.querySelector("#settingsModal").insertAdjacentHTML("afterbegin", `
		<div class="alert alert-success alert-dismissible fade show" role="alert">
			<strong>Success!</strong> Your information has been saved.
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>
		`)
	}
	else if (res.status == 400)
	{
		const data = res.data

		if (data['username'])
		{
			profileUsername.classList.add("is-invalid")
			profileUsernameValidation.classList.add("invalid-feedback")
			profileUsernameValidation.innerHTML = data['username']
		}
		if (data['email'])
		{
			profileEmail.classList.add("is-invalid")
			profileEmailValidation.classList.add("invalid-feedback")
			profileEmailValidation.innerHTML = data['email']
		}
	}
}

function resetFormInput(form) {
	const inputs = form.querySelectorAll("input")
	inputs.forEach(input => {
		input.classList.remove("is-invalid")
		input.classList.add("is-valid")
	})
	// Reset validations
}

export function generateModalSettings() {
	return `
	<div class="modal fade" id="settingsModal">
		<div class="modal-dialog modal-lg">
			<div class="modal-content bg-dark">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="profileLabel">Profile</h1>
					<div class="btn-close" data-bs-dismiss="modal"></div>
				</div>
				<div id="profilePictureContainer">
					<img id="profilePicture" class="rounded-circle border" alt="profilePicture" width="150" height="150" src="images/default-user-picture.png"/>
				</div>
				<div class="modal-body">
					<form id="profileForm" action="api/profile/updateprofile/" method="PATCH">
						<div id="profileImageContainer" class="mb-3 d-none">
							<label for="profileImageField" class="form-label">Profile picture</label>
							<input class="form-control" type="file" id="profileImageField">
							<div id="pictureUploadValidation" class="error text-danger"></div>
						</div>
						<div class="mb-3">
							<label for="profileUsername" class="col-md-3 col-form-label">Username</label>
							<input type="username" name="username" id="profileUsername" class="form-control" placeholder="username" disabled>
							<div id="profileUsernameValidation"></div>
						</div>
						<div class="mb-3">
							<label for="profileEmail" class="col-md-3 col-form-label">Email</label>
							<input type="email" name="email" id="profileEmail" class="form-control" placeholder="email" disabled>
							<div id="profileEmailValidation"></div>
						</div>
						<button type="button" class="btn btn-primary" id="modifyProfile">Modify</button>
						<button type="submit" class="btn btn-primary d-none" id="profileSaveChanges">Save changes</button>
					</form>
				</div>
			</div>
		</div>
	</div>
	`
}