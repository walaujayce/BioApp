import 'package:bio_app/utils/api_caller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../user_repository.dart';
import '../pages/confirm_data.dart';
import '../pages/home_page.dart';

import '../models/uploaded_data.dart';

final uploadedListProvider = StateNotifierProvider.autoDispose<
    UploadedDataNotifier, List<UploadedDataModel>>((ref) {
  return UploadedDataNotifier(ref);
});

final uploadedListIsLastProvider = StateProvider.autoDispose((ref) => false);
var isLoading = false;

class UploadedList extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final uploadedListNotifier = ref.watch(uploadedListProvider.notifier);
    final uploadedList = ref.watch(uploadedListProvider);
    final uploadedListIsLast =
        ref.watch(uploadedListIsLastProvider.select((value) => value));

    final _scrollController = useScrollController();
    _scrollController.addListener(() {
      if (!isLoading &&
          !uploadedListIsLast &&
          _scrollController.position.atEdge &&
          _scrollController.position.pixels != 0) {
        isLoading = true;
        uploadedListNotifier.getMoreData(ref.read, false);
      }
    });

    return uploadedList.isEmpty
        ? uploadedListIsLast
            ? Center(child: Text("上傳記錄是空的呦！"))
            : Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: () async {
              ref.read(uploadedListIsLastProvider.state).state = false;
              await uploadedListNotifier.getMoreData(ref.read, true);
            },
            child: ListView.builder(
              itemBuilder: (context, i) => ListCard(
                imageUrl: uploadedList[i].photo,
                speciesName: uploadedList[i].name,
                desc: uploadedList[i].description,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => ConfirmDataPage(
                            type: DataViewType.View,
                            existingData: uploadedList[i])),
                  );
                },
                uploaded: uploadedList[i].upload,
              ),
              itemCount: uploadedList.length,
              controller: _scrollController,
            ),
          );
  }
}

class ListCard extends StatelessWidget {
  final String imageUrl, speciesName, desc;
  final VoidCallback onTap;
  final bool uploaded;

  const ListCard(
      {Key? key,
      required this.imageUrl,
      required this.speciesName,
      required this.desc,
      required this.onTap,
      required this.uploaded})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: AspectRatio(
            aspectRatio: 1,
            child: CachedNetworkImage(
              imageUrl: imageUrl,
              progressIndicatorBuilder: (context, url, downloadProgress) =>
                  Center(
                      child: Padding(
                padding: const EdgeInsets.all(12.0),
                child:
                    LinearProgressIndicator(value: downloadProgress.progress),
              )),
              errorWidget: (context, url, error) => Icon(Icons.error),
            )
            //  Image.network(imageUrl, fit: BoxFit.cover)
            ),
        title: Text(speciesName),
        subtitle: Text(desc),
        trailing: uploaded
            ? Icon(Icons.cloud_done, color: Colors.green)
            : Icon(Icons.cloud_upload),
        onTap: onTap,
      ),
    );
  }
}

class UploadedDataNotifier extends StateNotifier<List<UploadedDataModel>> {
  UploadedDataNotifier(Ref ref) : super([]) {
    getMoreData(ref.read, false);
  }

  List<UploadedDataModel> get list => state;

  void resetData() {
    state = [];
  }

  Future<void> getMoreData(Reader read, bool reload) async {
    isLoading = true;
    print("Getting more data for uploaded list...");
    final user = read(userProvier.notifier).getUser;

    if (user == null) return;

    final res = await callApi(
        endpoint: "data_bird?st=${reload ? 0 : state.length}&num=10",
        method: ApiMethod.GET,
        accessToken: user.accessToken);

    if (res.response.statusCode != 200) {
      print(res.message);
      return;
    }

    final dataList = res.data!;
    if (dataList.isEmpty) {
      read(uploadedListIsLastProvider.state).state = true;
      return;
    }

    final resList = dataList.map((e) => UploadedDataModel.fromJson(e));

    if (reload)
      state = resList.toList();
    else
      state = [...state, ...resList];

    isLoading = false;
    print("Fetching finished.");
    print(
        "Is last: ${read(uploadedListIsLastProvider.state).state}, loading: $isLoading");
  }
}

// _getMoreData(Reader read, bool reload) async {
//   print("Getting more data...");
//   final uploadedList =
//       reload ? <UploadedDataModel>[] : read(uploadedListProvider).state;
//   final user = read(userProvier.notifier).getUser;

//   if (user == null) return;

//   final res = await callApi(
//       endpoint: "data_bird?st=${uploadedList.length}&num=10",
//       method: ApiMethod.GET,
//       accessToken: user.accessToken);

//   if (res.response.statusCode != 200) {
//     print(res.message);
//     return;
//   }

//   final dataList = res.data!;
//   if (dataList.isEmpty) {
//     read(uploadedListIsLastProvider).state = true;
//     return;
//   }

//   final resList = dataList.map((e) => UploadedDataModel.fromJson(e));

//   uploadedList.addAll(resList);
//   read(uploadedListProvider).state = uploadedList;
//   print("Fetching finished.");
// }
