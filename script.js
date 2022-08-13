const server = "ws://127.0.0.1:5000"

//? GlobalVariable: Các biến để lưu dữ liệu trong chương trình [socket, username, isConnected]
	var socket;
	var username = "";
	var isConnected = false;
//? HTMLQueryVariable: Các biến chứa nội dung HTML [savenamebutton, connectbutton, disconnectbutton, noconnect, connected]
var savenamebutton = `<button id="savenamebutton" onclick="saveusername()" hidden="true">Lưu</button>`
const connectbutton = "<button id=\"connect\" onclick=\"connect()\">Kết nối với Server</button>"
const disconnectbutton = "<button id=\"disconnect\" onclick=\"disconnect();\">Ngắt kết nối với Server</button>"
const noconnect = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username" disabled> ${savenamebutton} | <b>Trạng thái: </b>Chưa kết nối với Server | ` + connectbutton + "</p>"
const connected = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username"> ${savenamebutton} | <b>Trạng thái: </b>Đã kết nối với Server | ` + disconnectbutton + "</p>"

//? Method: Các Thủ tục gửi tin nhắn lên Server [nameaction(), get(), send()]
	function nameaction(name) {
		socket.send(`{"type":"name", "name":"${name}"}`)
	}
	function get() {
		socket.send(`{"type":"get"}`)
	}
	function send(content) {
		socket.send(`{"type":"send", "content":"${content}"}`)
	}	
//? SaveButton: Các thủ tục xoay quanh nút Lưu Biệt danh [hidesavebutton(), showsavebutton()]
	function hidesavebutton() {
		savenamebutton = `<button id="savenamebutton" onclick="saveusername() hidden="true">Lưu</button>`
		document.getElementById("savenamebutton").setAttribute("hidden", true)
	}
	
	function showsavebutton() {
		savenamebutton = `<button id="savenamebutton" onclick="saveusername()">Lưu</button>`
		document.getElementById("savenamebutton").removeAttribute("hidden")
	}	
//? UsernameMethod: Các thủ tục xoay quanh ô nhập Biệt danh [changeusername(), saveusername()]
	function changeusername(e) {
		if (username !== e.target.value) {
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
		username = document.getElementById('username').value;
		nameaction(username)
	}
//? SendMethod: Các thủ tục kích hoạt ô Gửi và nút Gửi [enablesend(), disablesend()]
	function enablesend() {
		document.getElementById("noidung").removeAttribute("disabled")
		document.getElementById("send").removeAttribute("disabled")
	}
	
	function disablesend(can_copy) {
		if (can_copy == true) 
		{
			document.getElementById("send").setAttribute("disabled", true)
		} else {
			document.getElementById("noidung").setAttribute("disabled", true)
			document.getElementById("send").setAttribute("disabled", true)
		}
	}	
//? AfterDisconnect: Các thủ tục xoay quanh sự kiện Bắt đầu Ngắt kết nối với Server [disconnect(), delayconnect()]
	function disconnect() {
		socket.close();
		document.getElementById("content").innerHTML = "\t<!-- Chat will be shown here -->"
		document.getElementById("alert").innerHTML = noconnect
		delayconnect();
	}

	function delayconnect() {
		document.getElementById("connect").textContent = "Vui lòng đợi 3s để có thể Kết nối lại"
		document.getElementById("connect").setAttribute("disabled", true)
		setTimeout(() => {
			document.getElementById("connect").textContent = "Kết nối với Server";
			document.getElementById("connect").removeAttribute("disabled")
		}, 3000);
	}

document.getElementById("alert").innerHTML = noconnect

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
		document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>Đã ngắt kết nối tới Server</b></p>`
		isConnected = false;
		document.getElementById("alert").innerHTML = noconnect
	})

	socket.addEventListener('open', (event) => {
		document.getElementById("alert").innerHTML = connected
		document.getElementById('username').addEventListener('change', changeusername)
		isConnected = true;
	});

	socket.addEventListener('message', (event) => {
		let data = JSON.parse(event.data)
		switch (data.type) {
			case "name":
				switch (data.status) {
					case true:
						switch (data.action) {
							case "register":
								document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Bạn đã đăng ký biệt danh "<b>${data.name}</b>" thành của mình</p>`;
								hidesavebutton();
								break;
							case "change":
								document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Bạn đã đổi biệt danh "<b>${data.oldname}</b>" của mình thành "<b>${data.newname}</b>"</p>`;
								hidesavebutton();
								break;
							}
						break;

					case false:
						switch (data.action) {
							case "register":

								break;
							case "change":

								break;
						}
						break;
					// TODO: Làm Switch Case lỗi cho Case False này
				}
				break;

			case "get":
				switch (data.status) {
					case true:
						// TODO: Cập nhật sau
						break;
				
					case false:
						switch (data.reason) {
							case "ErrorWhenGet":
								alert(`Không thể cập nhật full do đã xảy ra lỗi trên Server. Mở Console để biết thêm`)
								console.error("[Server] ErrorWhenGet: " + data.error);
								break;

							case "UnknownRegister":
								alert(`Bạn chưa đăng ký! Vui lòng đặt cho mình một biệt danh mới!`)
								break;
						
							default:
								alert("Đã xảy ra lỗi: " + data.reason)
								break;
						}
						break;
				}
				break;
		
		// TODO: Còn thiếu 2 case "send" và "receive"
		}
	});
}