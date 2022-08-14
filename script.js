const server = "http://127.0.0.1:5000/";
document.getElementById(`apihome`).setAttribute("href", server);

var oldsubtile = document.getElementById(`subtitle`).innerHTML;
var errorsubtitle = `<p style="margin-top: 10px;" id="subtitle"><b>Chưa kết nối tới Server</b> | Chỉ sử dụng <a id="apihome" target=”_blank”>API</a> | <button onclick="getfull(); document.getElementById('fullupdate').textContent = 'Đang cập nhật...'; document.getElementById(\`fullupdate\`).setAttribute('disabled', true);" id="fullupdate">Cập nhật tất cả</button></p>`;
var isconnect = false;
var firstfullload = false;

function noconnect() {
	isconnect = false;
	console.error("Không thể kết nối với Server!")
	oldsubtile = document.getElementById(`subtitle`).innerHTML;
	document.getElementById(`subtitle`).innerHTML = errorsubtitle;
	document.getElementById(`send`).setAttribute("disabled", true);
	alert(
		'Không thể kết nối tới Server! Vui lòng nhấn nút "Cập nhật tất cả" để kết nối lại.'
	);
	document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p style="text-align: center; font-size: x-small; color: grey;">Mất kết nối với Server</p>`
}

function reconnected() {
	isconnect = true
	console.info("Đã kết nối lại với Server!");
	document.getElementById(`subtitle`).innerHTML = oldsubtile;
	document.getElementById(`send`).removeAttribute("disabled");
}

function send() {
	const username = document.getElementById(`username`).value;
	if (username.length < 1) {
		return alert("Biệt danh phải có ít nhất 1 ký tự");
	}
	if (username.length > 100) {
		return alert("Biệt danh có nhiều nhất 100 ký tự");
	}
	const content = document.getElementById(`noidung`).value;
	if (content.length < 1) {
		return alert("Nội dung tin nhắn phải có ít nhất 1 ký tự");
	}
	if (username.length > 4000) {
		return alert("Nội dung tin nhắn có nhiều nhất 4000 ký tự");
	}
	document.getElementById(`send`).textContent = "Đang gửi...";
	document.getElementById(`send`).setAttribute("disabled", true);

	fetch(server + `send/?name=${username}&content=${content}`)
		.then((r) => r.json())
		.then((r) => {
			if (r.sent === true) {
				console.log(`Đã gửi tin nhắn: [${username}: ${content}]`);
				document.getElementById(`content`).innerHTML =
					document.getElementById(`content`).innerHTML +
					`\n<p><div style="background-color: rgb(218, 255, 218); color: grey; text-align: right; border-right: 3.5px solid green"><b style="color: dark;"><details style="margin-right: 7px;"><summary style="color: black;">Gửi tin nhắn thành công</summary><p style="margin-right: 7px;">${content}<br><i style="font-size: smaller;">Bạn đã gửi lúc ${r.timestamp} dưới tên <b>${username}</b></i></p></p></details></div><br>`;
			} else {
				console.warn(`Gửi thất bại: [${username}: ${content}]`);
				document.getElementById(`content`).innerHTML =
					document.getElementById(`content`).innerHTML +
					`\n<p><div style="background-color: rgb(255, 181, 181); color: grey; text-align: right; border-right: 3.5px solid red"><b style="color: dark;"><details style="margin-right: 7px;"><summary style="color: black;">Gửi tin nhắn thất bại</summary><p style="margin-right: 7px;">${content}</p></p></details></div><br>`;
			}
			document.getElementById(`noidung`).value = "";
			document.getElementById(`send`).removeAttribute("disabled");
			document.getElementById(`send`).textContent = "Gửi";
			document.getElementById("content").scrollTop = document.getElementById("content").scrollHeight;
			// https://stackoverflow.com/questions/7063627/force-scrollbar-to-bottom
		})
		.catch((r) => {
			document.getElementById(`send`).textContent = "Gửi";
			noconnect();
		});
}

var msgcount;

function getfull() {
	if (autoupdatetimeout) {clearTimeout(autoupdatetimeout);}
	msgcount = 0;
	document.getElementById("content").innerHTML = `\n\t<!-- Chat will be shown here -->\n`;
	document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p style="text-align: center; font-size: x-small; color: grey;">Cập nhật toàn bộ tin nhắn</p>`
	fetch(server + `get/`)
		.then((r) => r.json())
		.then((r) => {
			if (isconnect === false) {
				reconnected();
			}
			isconnect = true;
			if (r.got === true) {
				for (const message of r.data) {
					msgcount++;
					if (message.name == document.getElementById(`username`).value) {
						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML +
					`\n<p style="text-align: right; margin-right: 7px;"><b>[${message.name}] </b>${message.content}<br><i style="font-size: smaller;">Đã được gửi vào lúc ${message.timestamp}</i></p>`;
					} else {
						document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML +
					`\n<p style="margin-left: 7px"><b>[${message.name}] </b>${message.content}<br><i style="font-size: smaller;">Đã được gửi vào lúc ${message.timestamp}</i></p>`;
					}
				}
				document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p style="text-align: center; font-size: x-small; color: grey;">Cập nhật toàn bộ tin nhắn thành công</p>`
				document.getElementById("content").scrollTop = document.getElementById("content").scrollHeight;
				document.getElementById(`fullupdate`).removeAttribute("disabled");
				document.getElementById("fullupdate").textContent = "Cập nhật tất cả";
				console.log("Đã cập nhật tất cả tin nhắn")
				autoupdate();
			} else {
				document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p style="text-align: center; font-size: x-small; color: grey;">Cập nhật toàn bộ tin nhắn thất bại</p>`
				alert("Cập nhật toàn bộ tin nhắn thất bại! Vui lòng thử lại!")
				console.warn("Cập nhật tất cả tin nhắn thất bại")
				document.getElementById(`subtitle`).innerHTML = `<p style="margin-top: 10px;" id="subtitle"><b>Cập nhật toàn bộ thất bại</b> | Chỉ sử dụng <a id="apihome" target=”_blank”>API</a> | <button onclick="getfull(); document.getElementById('fullupdate').textContent = 'Đang cập nhật...'; document.getElementById(\`fullupdate\`).setAttribute('disabled', true);" id="fullupdate">Cập nhật tất cả</button></p>`;;
				document.getElementById(`fullupdate`).removeAttribute("disabled");
				document.getElementById("fullupdate").textContent = "Cập nhật tất cả";
			}
		})
		.catch((r) => {
			document.getElementById(`fullupdate`).removeAttribute("disabled");
			document.getElementById("fullupdate").textContent = "Cập nhật tất cả";
			noconnect();
		});
}

function get() {
	document.getElementById("fullupdate").textContent = "Đang cập nhật...";
	document.getElementById(`fullupdate`).setAttribute("disabled", true);
	fetch(server + `get/`)
		.then((r) => r.json())
		.then((r) => {
			isconnect = true;
			if (r.got === true) {
				let count = 0;
				for (const message of r.data) {
					count++;
					if (count > msgcount) {
						msgcount++;
						if (message.name == document.getElementById(`username`).value) {
							document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML +
						`\n<p style="text-align: right; margin-right: 7px;"><b>[${message.name}] </b>${message.content}<br><i style="font-size: smaller;">Đã được gửi vào lúc ${message.timestamp}</i></p>`;
						} else {
							document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML +
						`\n<p style="margin-left: 7px"><b>[${message.name}] </b>${message.content}<br><i style="font-size: smaller;">Đã được gửi vào lúc ${message.timestamp}</i></p>`;
						}
					}
				}
				document.getElementById(`fullupdate`).removeAttribute("disabled");
				document.getElementById("fullupdate").textContent = "Cập nhật tất cả";
			} else {
				document.getElementById(`content`).innerHTML = document.getElementById(`content`).innerHTML + `<p style="text-align: center; font-size: x-small; color: grey;">Tự động cập nhật tin nhắn thất bại</p>`
				document.getElementById(`fullupdate`).removeAttribute("disabled");
				document.getElementById("fullupdate").textContent = "Cập nhật tất cả";
			}
			if (isconnect === false) {
				reconnected();
			}
		})
		.catch((r) => {
			document.getElementById(`fullupdate`).removeAttribute("disabled");
			document.getElementById("fullupdate").textContent = "Cập nhật tất cả";
			noconnect();
		});
	console.log("Đã tự động cập nhật tin nhắn");
}

var autoupdatetimeout;

function autoupdate() {
	autoupdatetimeout = setTimeout(() => {
		if (isconnect === true) {
			get();
		}
		autoupdate();
	}, document.getElementById('autoupdate').value*1000)	
}

document.getElementById("fullupdate").textContent = "Đang cập nhật...";
document.getElementById(`fullupdate`).setAttribute("disabled", true);
getfull();