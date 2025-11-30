var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};
$("#sub").click(function () {
	accessToken = getUrlParameter("key")
	$.ajax({
		type: "POST",
		url: "https://bioapp-backend.yikuo.dev/api/resetPassword",
		data: JSON.stringify({ "password": $("#form1Example2").val() , "accessToken": accessToken}),
		// success: success,
		dataType: "json",
		contentType: "application/json;charset=utf-8",
	}).always(function (req) {
		if (req.status === "success") {
			alert( "Successful!" );
		} else if(req.status === "error"){
			alert(req.message)
		} else {
			alert("Server Error! Please connect administrator")
		}
	});;
});