import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../env.example.dart';

class ApiResponse {
  late http.Response response;
  String? status;
  List<dynamic>? data;
  int? code;
  String? total;
  String? message;

  ApiResponse.fromResponse(http.Response res) {
    response = res;

    final _json = jsonDecode(res.body);
    status = _json['status'];
    data = _json['data'];
    code = _json['code'];
    message = _json['message'];
    total = _json['total'];
  }
}

enum ApiMethod {
  GET,
  POST,
  PUT,
  DELETE,
}

Future<ApiResponse> callApi(
    {required String endpoint,
    required ApiMethod method,
    Map<String, dynamic>? body,
    String? accessToken}) async {
  try {
    switch (method) {
      case ApiMethod.GET:
        final _headers = Map<String, String>();
        if (accessToken != null)
          _headers["Authorization"] = "Bearer $accessToken";

        final res = await http.get(
          Uri.parse("$apiEndpointBase/$endpoint"),
          headers: _headers,
        );

        return ApiResponse.fromResponse(res);

      case ApiMethod.POST:
        final _headers = {'Content-Type': 'application/json; charset=UTF-8'};
        if (accessToken != null)
          _headers["Authorization"] = "Bearer $accessToken";

        final res = await http.post(Uri.parse("$apiEndpointBase/$endpoint"),
            headers: _headers, body: jsonEncode(body));

        return ApiResponse.fromResponse(res);

      case ApiMethod.PUT:
        final _headers = {'Content-Type': 'application/json; charset=UTF-8'};
        if (accessToken != null)
          _headers["Authorization"] = "Bearer $accessToken";

        final res = await http.put(Uri.parse("$apiEndpointBase/$endpoint"),
            headers: _headers, body: jsonEncode(body));

        return ApiResponse.fromResponse(res);

      case ApiMethod.DELETE:
        final _headers = {'Content-Type': 'application/json; charset=UTF-8'};
        if (accessToken != null)
          _headers["Authorization"] = "Bearer $accessToken";

        final res = await http.delete(Uri.parse("$apiEndpointBase/$endpoint"),
            headers: _headers, body: jsonEncode(body));

        return ApiResponse.fromResponse(res);
    }
  } on SocketException {
    return Future.error("無法連接伺服器 :(");
  }
}

Future<String> uploadToImgur(String img_path) async {
  int retries = 10;
  while (retries > 0) {
    final request = await http.MultipartRequest(
        "POST", Uri.parse("https://api.imgur.com/3/image"))
      ..files.add(await http.MultipartFile.fromPath('image', img_path))
      ..headers.addAll({"Authorization": "Client-ID $imgurClientId"});
    final res = await http.Response.fromStream(await request.send());

    if (res.statusCode == 200) {
      return jsonDecode(res.body)["data"]["link"];
    } else {
      print(res.body);
      retries--;
    }
  }

  return Future.error("圖片上傳失敗! :(");
}
