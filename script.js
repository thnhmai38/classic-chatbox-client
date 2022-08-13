const server = "ws://127.0.0.1:5000"
const connectbutton = "<button id=\"connect\" onclick=\"connect()\">Kết nối với Server</button>"
const disconnectbutton = "<button id=\"disconnect\" onclick=\"disconnect()\">Ngắt kết nối với Server</button>"
const noconnect = "<p><b>Trạng thái: </b>Chưa kết nối với Server | " + connectbutton + "</p>"
const connected = "<p><b>Trạng thái: </b>Đã kết nối với Server | " + disconnectbutton + "</p>"
document.getElementById("alert").innerHTML = noconnect
var socket;

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
		document.getElementById("alert").innerHTML = noconnect
	})

	socket.addEventListener('open', (event) => {
		document.getElementById("alert").innerHTML = connected
		socket.send(`{"type":"get"}`)
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
	socket.close()
	document.getElementById("alert").innerHTML = noconnect
	delayconnect();
}