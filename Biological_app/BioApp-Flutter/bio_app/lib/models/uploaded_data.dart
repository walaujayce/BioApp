class UploadedDataModel {
  int id;
  String name;
  String description;
  String photo;

  double lon;
  double lat;

  bool upload;
  DateTime time;

  UploadedDataModel.fromJson(Map<String, dynamic> json)
      : id = json["id"],
        name = json["name"] ?? "",
        description = json["description"] ?? "",
        photo = json["photo"],
        lon = json["lon"],
        lat = json["lat"],
        upload = json["upload"],
        time =
            DateTime.fromMillisecondsSinceEpoch(int.parse(json["time"]) * 1000);

  bool operator ==(Object other) {
    return this.id == (other as UploadedDataModel).id;
  }

  int get hashCode => id;
}
