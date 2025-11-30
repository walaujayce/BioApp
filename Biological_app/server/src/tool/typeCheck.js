function checkInt(num, a, b) {
	let reg = /^-?\d*$/;
	if(!reg.test(num))return false;
	if (a != undefined && b != undefined) {
		return !isNaN(num) && !isNaN(parseInt(num)) && a <= parseInt(num) && b >= parseInt(num);
	} else {

		return !isNaN(num) && !isNaN(parseInt(num));
	}
}

function checkBool(bool) {
	return String(bool).toLowerCase() == 'true' || String(bool).toLowerCase() == 'false'
}

function checkFloat(num, a, b) {
	let reg = /^-?\d+\.?\d*$/;
	if(!reg.test(num))return false;
	if (a != undefined && b != undefined) {
		return !isNaN(num) &&  !isNaN(parseFloat(num)) && a <= parseFloat(num) && b >= parseFloat(num);
	} else {

		return !isNaN(num) && !isNaN(parseFloat(num));
	}
}

function checkAccount(input) {
	let format = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,128}$/
	return format.test(input)
}

function checkPhone(input){
	let format = /^\+\d{2,21}$/
	return format.test(input)
}
module.exports = {
	checkInt,
	checkBool,
	checkFloat,
	checkPhone,
	checkAccount,
};