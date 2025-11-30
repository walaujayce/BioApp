const dbp = require('../db/other.js');
const mail_sender = require('./mail.js')
function weeklySendMail() {
	var weeklySendMailIntervalID = setInterval(async function () {
			nowTime = new Date();
			if (nowTime.getDay() == 1 && nowTime.getHours() == 1) {
				let toMail = "632902@cpc.com.tw";
				let toMail2 = "g12332196@yahoo.com";
				let number = await dbp.getNotCheckData();
				number = number.count;
				if (number != 0) {
					mail_sender.sendRemindMail(toMail, number);
					mail_sender.sendRemindMail(toMail2, number);
				}
			}
		}, 3600000);
}

module.exports = {
	weeklySendMail
}