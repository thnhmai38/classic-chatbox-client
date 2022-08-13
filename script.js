const server = "ws://127.0.0.1:5000"
var socket;

var savenamebutton = `<button id="savenamebutton" onclick="saveusername()" hidden="true">Lưu</button>`
const connectbutton = "<button id=\"connect\" onclick=\"connect()\">Kết nối với Server</button>"
const disconnectbutton = "<button id=\"disconnect\" onclick=\"disconnect();\">Ngắt kết nối với Server</button>"
const noconnect = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username" disabled> ${savenamebutton} | <b>Trạng thái: </b>Chưa kết nối với Server | ` + connectbutton + "</p>"
const connected = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username"> ${savenamebutton} | <b>Trạng thái: </b>Đã kết nối với Server | ` + disconnectbutton + "</p>"
document.getElementById("alert").innerHTML = noconnect

var username = "";
var isConnected = false;

function hidesavebutton() {
	savenamebutton = `<button id="savenamebutton" onclick="saveusername() hidden="true">Lưu</button>`
	document.getElementById("savenamebutton").setAttribute("hidden", true)
}

function showsavebutton() {
	savenamebutton = `<button id="savenamebutton" onclick="saveusername()">Lưu</button>`
	document.getElementById("savenamebutton").removeAttribute("hidden")
}

function changeusername(e) {
	if (username != e.target.value) {
		showsavebutton()
	} else {
		hidesavebutton()
	}
	if (e.target.value == "") {
		e.target.value = username
		hidesavebutton()
	} else {
		if (e.target.value.length > 100) {
			e.target.value = username
			hidesavebutton()
		}
	}
}

function saveusername() {
	if (!isConnected) return alert("Bạn chưa kết nối với Server!")
	hidesavebutton()
	username = document.getElementById('username').value;
	socket.send(`{"type":"change", "name":"${username}"}`)
}

document.getElementById('username').addEventListener('change', changeusername)

function delayconnect() {
	document.getElementById("connect").textContent = "Vui lòng đợi 3s để có thể Kết nối lại"
	document.getElementById("connect").setAttribute("disabled", true)
	setTimeout(() => {
		document.getElementById("connect").textContent = "Kết nối với Server";
		document.getElementById("connect").removeAttribute("disabled")
	}, 3000);
}

function connect() {
	document.getElementById("connect").textContent = "Đang kết nối..."
	document.getElementById("connect").setAttribute("disabled", true)

	socket = new WebSocket(server)

	socket.addEventListener('error', (event) => {
		alert("Không thể kết nối tới Server!")
		isConnected = false;
		document.getElementById("alert").innerHTML = noconnect
	})

	socket.addEventListener('close', (e) => {
		alert("Đã ngắt kết nối tới Server!")
		isConnected = false;
		document.getElementById("alert").innerHTML = noconnect
	})

	socket.addEventListener('open', (event) => {
		document.getElementById("alert").innerHTML = connected
		isConnected = true;
	});

	socket.addEventListener('message', (event) => {
		let data = JSON.parse(event.data)
		switch (data.type) {
			case "send":
				switch (data.status) {
					case true:

						break;
				
					case false:

						break;
					default: break;
				}
				break;
			
			case "get":
				switch (data.status) {
					case true:

						break;
				
					case false:

						break;
					default: break;
				}
				break;
			default: break;
		}
	});
}

function disconnect() {
	socket.close();
	document.getElementById("alert").innerHTML = noconnect
	delayconnect();
}