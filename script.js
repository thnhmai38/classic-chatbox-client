const server = "ws://127.0.0.1:5000"

//? GlobalVariable: Các biến để lưu dữ liệu trong chương trình [socket, username, isConnected, MessageQueue, connectdelay, Online]
	var socket;
	var username = "";
	var isConnected = false;
	var MessageQueue = [];
	var connectdelay = false;
	var Online = [];
//? HTMLQueryVariable: Các biến chứa nội dung HTML [savenamebutton, connectbutton, disconnectbutton, getbutton, noconnect, connected]
var savenamebutton = `<button id="savenamebutton" onclick="saveusername()" hidden="true">Lưu</button>`
const connectbutton = "<button id=\"connect\" onclick=\"connect()\">Kết nối với Server</button>"
const disconnectbutton = "<button id=\"disconnect\" onclick=\"disconnect();\">Ngắt kết nối với Server</button>"
const getbutton = "<button onclick=\"get()\" id=\"updatebutton\">Cập nhật</button>"
const noconnect = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username" disabled> ${savenamebutton} | <b>Trạng thái: </b>Chưa kết nối với Server | ` + connectbutton + "</p>"
const connected = `<p> <input class="chat" type="text" placeholder="Biệt danh" id="username"> ${savenamebutton} | <b>Trạng thái: </b>Đã kết nối với Server | ` + disconnectbutton + " " + getbutton + "</p>"
const defaultList = `<summary>Trực tuyến</summary>`

//? Method: Các Thủ tục gửi tin nhắn lên Server [nameaction(), get(), send()]
	function nameaction(name) {
		input = {
			"type": "name",
			"name": name
		}
		socket.send(JSON.stringify(input))
	}
	function get() {
		inupdate()
		socket.send(`{"type":"get"}`)
	}
	function send(content) {
		if (content.length < 1 || content.length > 4000) return alert("Nội dung tin nhắn có ít nhất 1 ký tự và nhiều nhất 4000 ký tự!")
		input = {
			"type": "send",
			"content": content
		}
		socket.send(JSON.stringify(input))
		MessageQueue.push({
			'name': username,
			'content': content
		})
		document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: right; margin-right: 7px;" class="QueueMessage"> <b>${escapeHtml(username)}:</b> ${escapeHtml(content)} <br> <i style="font-size: smaller;">Đang gửi...</i></p>`
		document.getElementById("noidung").value = "";
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
		if (username !== e.target.value && e.target.value.length>=1 && e.target.value.length<=100) {
			showsavebutton()
		} else {
			hidesavebutton()
		}
	}
	
	function saveusername() {
		if (!isConnected) return alert("Bạn chưa kết nối với Server!")
		nameaction(document.getElementById('username').value)
	}

	function RestoreUsername(e) {
		if (e.target.value.length<1 || e.target.value.length>100) {
			document.getElementById("username").value = username
		}
	}

//? SendMethod: Các thủ tục kích hoạt và Phím tắt ô Gửi và nút Gửi [enablesend(), disablesend(), SendEnter()]
	function enablesend() {
		document.getElementById("noidung").removeAttribute("disabled")
		document.getElementById("send").removeAttribute("disabled")
		document.getElementById("noidung").addEventListener("keydown", (event) => SendEnter(event))
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

	function SendEnter(event) {
		// Thanks https://stackoverflow.com/questions/905222/prevent-form-submission-on-enter-key-press
		if (event.keyCode == 13) {
			event.preventDefault();
			if (isConnected === true) {send(document.getElementById('noidung').value);}
		}
		if (event.keyCode == 116) {
			event.preventDefault();
			if (isConnected === true && !document.getElementById("updatebutton").hasAttribute("disabled")) {get();}
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
		connectdelay = true;
		RestoreListToDefault()
		document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>Đã ngắt kết nối tới Server</b></p>`
		isConnected = false;
		document.getElementById("alert").innerHTML = noconnect
		document.getElementById('username').removeEventListener('input', changeusername)
		hidesavebutton()
		showScrollButton()
		username = "";
		if (document.getElementById('noidung').value.length > 0) {
			disablesend(true)
			document.getElementById('noidung').addEventListener('input', disablecontentafterdisconnect)
		} else (disablesend(false))

		document.getElementById("connect").textContent = "Vui lòng đợi 3s để có thể Kết nối lại"
		document.getElementById("connect").setAttribute("disabled", true)
		setTimeout(() => {
			document.getElementById("connect").textContent = "Kết nối với Server";
			document.getElementById("connect").removeAttribute("disabled")
		}, 3000);
	}

	function disablecontentafterdisconnect() {
		if (isConnected == true) {
			document.getElementById('noidung').removeEventListener('input', disablecontentafterdisconnect)
		} else {
			if (document.getElementById('noidung').value.length === 0) {
				disablesend(false)
				document.getElementById('noidung').removeEventListener('input', disablecontentafterdisconnect)
			}
		}
	}

//? UpdateButton: Các thủ tục liên quan đến nút Cập nhật [inupdate(), afterupdate()]
	function inupdate() {
		document.getElementById("updatebutton").textContent = "Đang cập nhật..."
		document.getElementById("updatebutton").setAttribute("disabled", true)
	}

	function afterupdate() {
		document.getElementById("updatebutton").removeAttribute("disabled")
		document.getElementById("updatebutton").textContent = "Cập nhật"
	}
//? ListMethod: Các thủ tục liên quan đến danh sách trực tuyến [UpdateList(), RestoreListToDefault()]
	function UpdateList() {
		let tempHTML = `<summary>Trực tuyến (${Online.length})</summary>\n`;
		for (const nguoidung of Online) {
			tempHTML = tempHTML.concat((nguoidung == username) ? `<p style="word-wrap: break-word;">${escapeHtml(nguoidung)} <b>(Bạn)</b></p>` : `<p style="word-wrap: break-word;">${escapeHtml(nguoidung)}</p>`)
		}
		document.getElementById("list").innerHTML = tempHTML 
	}

	function RestoreListToDefault() {
		document.getElementById("list").innerHTML = defaultList
	}

//? ScrollButtonMethod: Các thủ tục liên quan đến nút Cuộn xuống ngay [showScrollButton()]
	// Thanks https://stackoverflow.com/a/54529438/16410937
	function showScrollButton() {
		if (document.getElementById('content').scrollTop + document.getElementById('content').clientHeight === document.getElementById('content').scrollHeight) {
			document.getElementById("ScrollButton").setAttribute("hidden", true)
		} else {
			document.getElementById("ScrollButton").removeAttribute("hidden")
		}
	}

function find(array, name, content) {
	const query = {
		'name': name,
		'content': content
	}
	return array.indexOf(query)
}

function escapeHtml(text) {
	// Thank this too much: https://stackoverflow.com/questions/1787322/what-is-the-htmlspecialchars-equivalent-in-javascript
	var map = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#039;'
	};
	
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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

	socket.addEventListener('close', (event) => {
		if (connectdelay === false) {
			RestoreListToDefault()
			document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>Đã ngắt kết nối tới Server</b></p>`
			isConnected = false;
			document.getElementById("alert").innerHTML = noconnect
			document.getElementById('username').removeEventListener('input', changeusername)
			hidesavebutton()
			showScrollButton()
			username = "";
			if (document.getElementById('noidung').value.length > 0) {
				disablesend(true)
				document.getElementById('noidung').addEventListener('input', disablecontentafterdisconnect)
			} else (disablesend(false))
		} else connectdelay = true;
	})

	socket.addEventListener('open', (event) => {
		document.getElementById("alert").innerHTML = connected
		document.getElementById('username').addEventListener('input', changeusername)
		document.getElementById('username').addEventListener('change', RestoreUsername)
		isConnected = true;
	});

	socket.addEventListener('message', (event) => {
		let data = JSON.parse(event.data)
		switch (data.type) {
			case "name":
				switch (data.status) {
					case true:
						enablesend();
						switch (data.action) {
							case "register":
								document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Bạn đã đăng ký biệt danh "<b>${escapeHtml(data.name)}</b>" thành của mình</p>`;
								username = data.name;
								hidesavebutton(); get();
								break;
							case "change":
								document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Bạn đã đổi biệt danh "<b>${escapeHtml(data.oldname)}</b>" của mình thành "<b>${escapeHtml(data.newname)}</b>"</p>`;
								username = data.newname;
								hidesavebutton();
								Online[Online.indexOf(data.oldname)] = data.newname;
								UpdateList()
								break;
							}
						break;
					case false:
						switch (data.action) {
							case "register":
								switch (data.reason) {
									case "NameAlreadyUsed":
										alert(`"${data.name}" đã được sử dụng. Vui lòng đặt một biệt danh khác.`)
										break;
								
									case "WrongFormatName":
										alert(`Biệt danh của bạn phải có ít nhất 1 ký tự và nhiều nhất 100 ký tự`)
										break;

									case "ErrorWhenRegister":
										alert("Đã xảy ra lỗi trên Server khi đăng ký cho bạn. Xem Console để biết thêm.")
										console.error(`[Server] ` + data.error)
									
									default:
										alert("Đã xảy ra lỗi khi đăng ký tên: \""+ data.reason + "\"")
										break;
								}
								break;
							case "change":
								switch (data.reason) {
									case "NameAlreadyUsed":
										alert(`"${data.name}" đã được sử dụng. Vui lòng đặt một biệt danh khác.`)
										break;
								
									case "WrongFormatName":
										alert(`Biệt danh của bạn phải có ít nhất 1 ký tự và nhiều nhất 100 ký tự`)
										break;

									case "ErrorWhenChange":
										alert("Đã xảy ra lỗi trên Server khi đổi biệt danh cho bạn. Xem Console để biết thêm.")
										console.error(`[Server] ` + data.error)
									
									default:
										alert("Đã xảy ra lỗi khi đổi biệt danh: \""+ data.reason + "\"")
										break;
								}
								break;
						}
						break;
				}
				break;

			case "get":
				switch (data.status) {
					case true:
						document.getElementById("content").innerHTML = "\t<!-- Chat will be shown here -->"
						for (const tinnhan of data.data.message) {
							if (tinnhan.name == username) {
								document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: right; margin-right: 7px;"> <b>${escapeHtml(tinnhan.name)}:</b> ${escapeHtml(tinnhan.content)} <br> <i style="font-size: smaller;">Gửi vào lúc ${tinnhan.timestamp}</i></p>`
							} else {
								document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: left; margin-left: 7px;"> <b>${escapeHtml(tinnhan.name)}:</b> ${escapeHtml(tinnhan.content)} <br> <i style="font-size: smaller;">Gửi vào lúc ${tinnhan.timestamp}</i></p>`
							}
						}
						Online = data.data.online;
						UpdateList()

						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;">Cập nhật tất cả</p>`;
						document.getElementById("content").scrollTop = document.getElementById("content").scrollHeight;
						break;
				
					case false:
						switch (data.reason) {
							case "ErrorWhenGet":
								alert(`Không thể cập nhật full do đã xảy ra lỗi trên Server. Mở Console để biết thêm`)
								console.error("[Server] ErrorWhenGet: " + escapeHtml(data.error));
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
				afterupdate();
				break;
		
			case "send":
				let arr = document.getElementsByClassName("QueueMessage")
				let pos = find(MessageQueue, data.name, data.content)
				switch (data.status) {
					case true:
						for (const html of arr) {
							if (html.innerHTML == ` <b>${escapeHtml(data.name)}:</b> ${escapeHtml(data.content)} <br> <i style="font-size: smaller;">Đang gửi...</i>`) {
								html.classList.remove("QueueMessage")
								html.innerHTML = ` <b>${escapeHtml(username)}:</b> ${escapeHtml(data.content)} <br> <i style="font-size: smaller;">Bạn đã gửi thành công vào lúc ${data.timestamp}</i>`
								MessageQueue.splice(pos, 1)
								break;
							}
						}
						break;
					case false:
						for (const html of arr) {
							if (html.innerHTML == ` <b>${escapeHtml(data.name)}:</b> ${escapeHtml(data.content)} <br> <i style="font-size: smaller;">Đang gửi...</i>`) {
								html.classList.remove("QueueMessage")
								let lydo = "";
								switch (data.reason) {
									case "UnknownRegister":
										lydo = "Bạn chưa đăng ký"
										break;
									
									case "ErrorWhenSend":
										lydo = "[Server] " + escapeHtml(data.error);
										break;

									case "WrongFormatContent":
										lydo = "Nội dung tin nhắn có ít nhất 1 ký tự và nhiều nhất 4000 ký tự"
										break;

									default:
										lydo = "Lỗi: " + data.reason
										break;
								}
								html.innerHTML = ` <b>${escapeHtml(username)}:</b> ${escapeHtml(content)} <br> <i style="font-size: smaller; color: red;">Bạn đã gửi tin nhắn thất bại: ${lydo}</i>`
								MessageQueue.splice(pos, 1)
								break;
							}
						}
						break;
				}
			case "receive":
				switch (data.datatype) {
					case "change":
						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>${escapeHtml(data.oldname)}</b> đã đổi biệt danh thành "<b>${escapeHtml(data.newname)}</b>"</p>`;
						Online[Online.indexOf(data.oldname)] = data.newname;
						UpdateList()
						break;
				
					case "register":
						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>${escapeHtml(data.name)}</b> đã tham gia chat</p>`;
						Online.push(data.name)
						UpdateList()
						break;

					case "message":
						document.getElementById('content').innerHTML = document.getElementById('content').innerHTML + `<p style="text-align: left; margin-left: 7px;"> <b>${escapeHtml(data.name)}:</b> ${escapeHtml(data.content)} <br> <i style="font-size: smaller;">Gửi vào lúc ${data.timestamp}</i></p>`
						break;

					case "leave":
						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p class="smalltext" style="text-align: center; font-size: x-small; color: grey;"><b>${escapeHtml(data.name)}</b> đã rời khỏi chat</p>`;
						Online.splice(Online.indexOf(data.name), 1)
						UpdateList()
						break;
				}

			default: break;
		}
		showScrollButton()
	});
}