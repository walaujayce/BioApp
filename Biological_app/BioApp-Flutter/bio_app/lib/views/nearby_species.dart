import 'dart:async';

import 'package:bio_app/pages/home_page.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'package:geolocator/geolocator.dart';
import 'package:bio_app/utils/api_caller.dart';

import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../utils/custom_info_window.dart';
import '../utils/get_location.dart';
import '../models/uploaded_data.dart';
import '../user_repository.dart';

final locationProvider = FutureProvider.autoDispose(
    (ref) => determinePosition(LocationAccuracy.high));

final savedLocationProvider =
    StateProvider.autoDispose<Position?>((ref) => null);

final nearbyListProvider =
    StateNotifierProvider<NearbyListNotifier, Set<UploadedDataModel>>((ref) {
  return NearbyListNotifier(ref);
});

final nearbyListTotalProvider = StateProvider.autoDispose((ref) => -1);

class NearbySpecies extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _position = ref.watch(locationProvider);

    return _position.when(
        data: (res) {
          // ref.read(nearbyListProvider.notifier).getNewData(ref.read, res);
          return NearbySpeciesView();
        },
        loading: () => Center(
                child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text("取得位置中...")
              ],
            )),
        error: (err, st) {
          ref.refresh(locationProvider);

          switch (err) {
            case DeterminePositionError.serviceDisabled:
              return Center(child: Text("定位服務已關閉！請至設定開啟定位服務！"));
            case DeterminePositionError.deniedForever:
              return Center(child: Text("位置權限已被拒絕！請至設定許可位置權限！"));
            case DeterminePositionError.denied:
              return Center(child: Text("請許可位置權限！"));
            default:
              return Center(child: Text("無法取得位置！"));
          }
        });
  }

  //   (
  // crossAxisCount: 2,
  // padding: EdgeInsets.all(8.0),
  // childAspectRatio: 8.0 / 10.0,
  // children: [
  //   SpeciesCard(
  //     imageUrl:
  //         "https://upload.wikimedia.org/wikipedia/commons/9/96/Cervus_nippon_dybowski_Solo.jpg",
  //     speciesName: "梅花鹿",
  //     description: "成鹿體長約1.5米。毛色夏季為栗紅色，有許多白斑，狀似梅花；冬季為煙褐色，白斑不顯著。頸部有鬣毛。",
  //   ),
  //   SpeciesCard(
  //     imageUrl:
  //         "https://www.accordo.gr/wp-content/uploads/2020/03/info-logo-png.png",
  //     speciesName: "僅供參考",
  //     description: "目前無附近物種資料",
  //   ),
  // ],
}

final infoWindowControllerStateProvier =
    StateProvider.autoDispose((ref) => CustomInfoWindowController());

class NearbySpeciesView extends HookConsumerWidget {
  const NearbySpeciesView({Key? key}) : super(key: key);

  static final CameraPosition _taiwan = CameraPosition(
    target: LatLng(23.973861, 120.982),
    zoom: 7.0,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nearbyList = ref.watch(nearbyListProvider);
    final infoWindowController = ref.watch(infoWindowControllerStateProvier);

    print("Map recompose");
    CameraPosition camPos = _taiwan;

    return Stack(children: [
      GoogleMap(
        mapType: MapType.normal,
        initialCameraPosition: _taiwan,
        mapToolbarEnabled: false,
        markers: nearbyList
            .map(
              (entry) => Marker(
                  markerId: MarkerId(entry.id.toString()),
                  position: LatLng(entry.lat, entry.lon),
                  onTap: () {
                    infoWindowController.addInfoWindow!(
                        SpeciesCard(
                            imageUrl: entry.photo,
                            speciesName: entry.name,
                            description: entry.description),
                        LatLng(entry.lat, entry.lon));
                  }),
            )
            .toSet(),
        myLocationEnabled: true,
        onMapCreated: (GoogleMapController controller) async {
          infoWindowController.googleMapController = controller;

          final _position = await ref.read(locationProvider.future);
          controller.animateCamera(CameraUpdate.newCameraPosition(
              CameraPosition(
                  target: LatLng(_position.latitude, _position.longitude),
                  zoom: 15)));
        },
        onCameraMove: (position) {
          infoWindowController.onCameraMove!();
          camPos = position;
        },
        onTap: (position) {
          infoWindowController.hideInfoWindow!();
        },
        gestureRecognizers: [
          Factory<OneSequenceGestureRecognizer>(() => EagerGestureRecognizer())
        ].toSet(),
        onCameraIdle: () async {
          print("Idle");
          ref
              .read(nearbyListProvider.notifier)
              .getNewData(ref.read, camPos.target);
        },
      ),
      CustomInfoWindow(
        controller: infoWindowController,
        width: 190,
        offset: 50,
      ),
    ]);
  }
}

class SpeciesCard extends HookConsumerWidget {
  final String imageUrl, speciesName, description;

  const SpeciesCard(
      {Key? key,
      required this.imageUrl,
      required this.speciesName,
      this.description = ""})
      : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final showImage = ref.watch(showImageOptionProvier);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {},
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showImage)
              AspectRatio(
                  aspectRatio: 18.0 / 13.0,
                  child: CachedNetworkImage(
                    imageUrl: imageUrl,
                    progressIndicatorBuilder:
                        (context, url, downloadProgress) => Center(
                            child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: CircularProgressIndicator(
                          value: downloadProgress.progress),
                    )),
                    errorWidget: (context, url, error) => Icon(Icons.error),
                    fit: BoxFit.fitWidth,
                  )

                  // Image.network(imageUrl, fit: BoxFit.fitWidth),
                  ),
            Padding(
              padding: EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 16.0),
              child: Column(
                children: [
                  Text(
                    speciesName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8.0),
                  Text(description,
                      style: const TextStyle(fontSize: 13),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NearbyListNotifier extends StateNotifier<Set<UploadedDataModel>> {
  NearbyListNotifier(Ref ref) : super(Set<UploadedDataModel>()) {
    state = Set<UploadedDataModel>();
  }

  Set<UploadedDataModel> get list => state;

  void getNewData(Reader read, LatLng position) {
    getMoreData(read, position);
  }

  void resetData() {
    state = Set<UploadedDataModel>();
  }

  void triggerReload() {
    state = state;
  }

  Future<void> getMoreData(Reader read, LatLng userPosition) async {
    print("Getting more data...");
    final nearbySet = Set<UploadedDataModel>.from(state);
    final user = read(userProvier.notifier).getUser;

    if (user == null) return;

    final res = await callApi(
        endpoint:
            "near_data_bird?st=0&num=500&lon=${userPosition.longitude}&lat=${userPosition.latitude}&upload=true",
        method: ApiMethod.GET,
        accessToken: user.accessToken);

    if (res.response.statusCode != 200) {
      print(res.message);
      return;
    }

    final dataList = res.data!;
    read(nearbyListTotalProvider.state).state = int.parse(res.total!);

    final resList = dataList.map((e) => UploadedDataModel.fromJson(e));

    nearbySet.addAll(resList);
    state = nearbySet;
  }
}
