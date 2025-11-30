import 'dart:io';
import 'dart:async';

import 'package:bio_app/utils/api_caller.dart';
import 'package:bio_app/views/uploaded_list.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:loading_overlay/loading_overlay.dart';
import 'package:intl/intl.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

// import 'package:image_size_getter/image_size_getter.dart';
// import 'package:image_size_getter/file_input.dart';

import '../utils/get_location.dart';
import '../user_repository.dart';
import '../models/uploaded_data.dart';

enum DataViewType { Upload, View }

final isLoadingProvider = StateProvider.autoDispose((ref) => false);
final loadingMessageProvider = StateProvider.autoDispose((ref) => "上傳中...");

final isNameModifiedProvider = StateProvider.autoDispose((ref) => false);
final isDescModifiedProvider = StateProvider.autoDispose((ref) => false);

class ConfirmDataPage extends HookConsumerWidget {
  final DataViewType type;
  final UploadedDataModel? existingData;
  final String? uploadImagePath;

  const ConfirmDataPage(
      {Key? key, required this.type, this.uploadImagePath, this.existingData})
      : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _screenSize = MediaQuery.of(context).size;
    final _isLoading = ref.watch(isLoadingProvider);
    final _loadingMessage = ref.watch(loadingMessageProvider);

    final imagePath =
        type == DataViewType.Upload ? uploadImagePath! : existingData!.photo;

    final time = type == DataViewType.Upload
        ? ref.watch(timeProvider)
        : existingData!.time;

    final existingPosition = type == DataViewType.Upload
        ? null
        : LatLng(existingData!.lat, existingData!.lon);

    final _isModified =
        ref.watch(isNameModifiedProvider.select((value) => value)) ||
            ref.watch(isDescModifiedProvider.select((value) => value));

    final formKey = GlobalKey<FormState>();

    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        body: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              snap: false,
              floating: false,
              expandedHeight: _screenSize.height * 0.7,
              flexibleSpace: FlexibleSpaceBar(
                title: Text(type == DataViewType.Upload ? "確認上傳資料" : "詳細資訊"),
                background: kIsWeb || type != DataViewType.Upload
                    ? CachedNetworkImage(
                        imageUrl: imagePath,
                        progressIndicatorBuilder:
                            (context, url, downloadProgress) => Center(
                                child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: CircularProgressIndicator(
                              value: downloadProgress.progress),
                        )),
                        errorWidget: (context, url, error) => Icon(Icons.error),
                      )
                    : Image.file(File(imagePath), fit: BoxFit.cover),
              ),
            ),
            SliverPadding(
              padding: EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  SpeciesNameInput(existingData?.name),
                  SizedBox(height: 20.0),
                  FoundTimeText(time),
                  SizedBox(height: 20.0),
                  FoundPositionText(existingPosition),
                  SizedBox(height: 12.0),
                  FoundPositionMap(existingPosition),
                  SizedBox(height: 28.0),
                  DescriptionInput(existingData?.description),
                  SizedBox(height: 20.0),
                  if (type == DataViewType.Upload)
                    SubmitButton(
                      isUpload: true,
                      imagePath: imagePath,
                      formKey: formKey,
                    ),
                  if (type == DataViewType.View && _isModified)
                    SubmitButton(
                      isUpload: false,
                      existingData: existingData,
                      formKey: formKey,
                    ),
                ]),
              ),
            )
          ],
        ),
      ),
      progressIndicator: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 12),
          Text(
            _loadingMessage,
            style: TextStyle(
                color: Colors.black,
                fontSize: 18,
                decoration: TextDecoration.none),
          )
        ],
      ),
    );
  }
}

class DataLabel extends StatelessWidget {
  final String body;
  const DataLabel(this.body);

  @override
  Widget build(BuildContext context) {
    return Text(
      body,
      style: TextStyle(fontSize: 20),
    );
  }
}

final speciesNameInputProvider = StateProvider((ref) => "");
final speciesNameInputErrorProvider =
    StateProvider.autoDispose<String?>((ref) => null);

class SpeciesNameInput extends HookConsumerWidget {
  final String? existingName;
  const SpeciesNameInput(this.existingName);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final errorText = ref.watch(speciesNameInputErrorProvider);

    return TextFormField(
      decoration: InputDecoration(
          border: OutlineInputBorder(),
          labelText: '物種名稱',
          errorText: errorText),
      initialValue: existingName,
      style: TextStyle(fontSize: 20),
      onChanged: (text) {
        ref.read(speciesNameInputProvider.state).state = text;
        ref.read(isNameModifiedProvider.state).state = true;

        if (text.isNotEmpty)
          ref.read(speciesNameInputErrorProvider.state).state = null;
      },
    );
  }
}

final timeProvider = StateProvider.autoDispose((ref) => DateTime.now());

class FoundTimeText extends HookWidget {
  final DateTime time;
  const FoundTimeText(this.time);

  @override
  Widget build(BuildContext context) {
    final _formattedTime = DateFormat('yyyy/MM/dd kk:mm').format(time);

    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          "發現時間",
          style: TextStyle(fontSize: 20, color: Colors.black54),
        ),
        Text(
          _formattedTime,
          style: TextStyle(fontSize: 18, color: Colors.black),
        ),
      ]),
    );
  }
}

final locationProvider = FutureProvider.autoDispose(
    (ref) => determinePosition(LocationAccuracy.best));

final mapControllerCompleterProvider =
    Provider<Completer<GoogleMapController>>((ref) => Completer());

class FoundPositionText extends HookConsumerWidget {
  final LatLng? existingPosition;
  const FoundPositionText(this.existingPosition);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _position = ref.watch(locationProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 0, 8, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          "發現地點",
          style: TextStyle(fontSize: 20, color: Colors.black54),
        ),
        FittedBox(
            fit: BoxFit.fitWidth,
            child: existingPosition != null
                ? Text(
                    "${existingPosition!.latitude}, ${existingPosition!.longitude}")
                : Text(
                    _position.when(
                        data: (res) {
                          () async {
                            final _controller = await ref
                                .read(mapControllerCompleterProvider)
                                .future;

                            _controller.animateCamera(
                                CameraUpdate.newCameraPosition(CameraPosition(
                                    target: LatLng(res.latitude, res.longitude),
                                    zoom: 15)));
                          }();

                          return "${res.latitude}, ${res.longitude}";
                        },
                        loading: () => "取得位置中...",
                        error: (err, st) {
                          ref.refresh(locationProvider);

                          switch (err) {
                            case DeterminePositionError.serviceDisabled:
                              return "定位服務已關閉！請至設定開啟定位服務！";
                            case DeterminePositionError.deniedForever:
                              return "位置權限已被拒絕！請至設定許可位置權限！";
                            case DeterminePositionError.denied:
                              return "請許可位置權限！";
                            default:
                              return "無法取得位置！";
                          }
                        }),
                    style: TextStyle(fontSize: 18, color: Colors.black),
                  )),
      ]),
    );
  }
}

class FoundPositionMap extends ConsumerWidget {
  final LatLng? existingPosition;
  const FoundPositionMap(this.existingPosition);

  static final CameraPosition _taiwan = CameraPosition(
    target: LatLng(23.973861, 120.982),
    zoom: 7.0,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.refresh(mapControllerCompleterProvider);

    final _existingCameraPosition = existingPosition != null
        ? CameraPosition(
            target: existingPosition!,
            zoom: 15.0,
          )
        : null;

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.width * 0.6,
        child: GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: _existingCameraPosition ?? _taiwan,
            markers: existingPosition != null
                ? [
                    Marker(
                      markerId: MarkerId("Marker"),
                      position: LatLng(existingPosition!.latitude,
                          existingPosition!.longitude),
                    )
                  ].toSet()
                : Set(),
            myLocationEnabled: true,
            gestureRecognizers: [
              Factory<OneSequenceGestureRecognizer>(
                  () => EagerGestureRecognizer())
            ].toSet(),
            onMapCreated: (GoogleMapController controller) {
              ref.read(mapControllerCompleterProvider).complete(controller);
            }),
      ),
    );
  }
}

final descriptionInputProvider = StateProvider((ref) => "");

class DescriptionInput extends ConsumerWidget {
  final String? existingDescription;
  const DescriptionInput(this.existingDescription);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return TextFormField(
      keyboardType: TextInputType.multiline,
      maxLines: null,
      minLines: 4,
      initialValue: existingDescription,
      decoration: InputDecoration(
        border: OutlineInputBorder(),
        labelText: '詳細資訊',
        hintText: '(選填) 詳述物種特徵、狀態.. 等',
      ),
      style: TextStyle(fontSize: 20),
      onChanged: (text) {
        ref.read(descriptionInputProvider.state).state = text;
        ref.read(isDescModifiedProvider.state).state = true;
      },
    );
  }
}

class SubmitButton extends ConsumerWidget {
  final bool isUpload;
  final UploadedDataModel? existingData;
  final String? imagePath;
  final GlobalKey<FormState> formKey;

  const SubmitButton(
      {Key? key,
      required this.isUpload,
      this.existingData,
      this.imagePath,
      required this.formKey})
      : super(key: key);

  _uploadData(Reader read, BuildContext context) async {
    try {
      final user = read(userProvier.notifier).getUser;

      final name = isUpload || read(isNameModifiedProvider.state).state
          ? read(speciesNameInputProvider.state).state
          : existingData!.name;
      final description = isUpload || read(isDescModifiedProvider.state).state
          ? read(descriptionInputProvider.state).state
          : existingData!.description;

      if (name.isEmpty) {
        read(speciesNameInputErrorProvider.state).state = "請輸入物種名稱！";
        return;
      }
      print(name);

      if (user == null) throw Exception("您尚未登入！");

      read(isLoadingProvider.state).state = true;

      final longitude = isUpload
          ? read(locationProvider).asData?.value.longitude
          : existingData!.lon;
      final latitude = isUpload
          ? read(locationProvider).asData?.value.latitude
          : existingData!.lat;

      final time = isUpload ? read(timeProvider) : existingData!.time;

      late final String imgUrl;

      if (isUpload) {
        read(loadingMessageProvider.state).state = "上傳照片中...";
        imgUrl = await uploadToImgur(imagePath!);
      } else
        imgUrl = existingData!.photo;

      read(loadingMessageProvider.state).state =
          isUpload ? "上傳資料中..." : "更新資料中...";

      final _body = {
        "name": name,
        "description": description,
        "photo": imgUrl,
        "lon": longitude,
        "lat": latitude,
        "time": time.toUtc().millisecondsSinceEpoch ~/ 1000
      };
      if (!isUpload) _body["id"] = existingData!.id;

      final res = await callApi(
          endpoint: "data_bird",
          method: isUpload ? ApiMethod.POST : ApiMethod.PUT,
          body: _body,
          accessToken: user.accessToken);

      if (res.response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(isUpload ? "上傳成功！" : "修改成功！")));
        read(uploadedListIsLastProvider.state).state = false;
        read(uploadedListProvider.notifier).getMoreData(read, true);
      } else
        throw Exception(res.message!);

      Navigator.pop(context);
    } catch (err) {
      print(err);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(err.toString())));
      read(isLoadingProvider.state).state = false;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
          onPressed: () => _uploadData(ref.read, context),
          child: Text(
            isUpload ? "確認上傳" : "送出變更",
            style: TextStyle(fontSize: 20),
          )),
    );
  }
}
