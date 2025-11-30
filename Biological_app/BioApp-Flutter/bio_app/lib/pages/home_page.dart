import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../views/nearby_species.dart';
import '../views/uploaded_list.dart';

import './confirm_data.dart';
import './login_page.dart';
import '../user_repository.dart';

final pageControllerProvider = Provider<PageController>((ref) {
  final _pageController = PageController(initialPage: 0);
  ref.onDispose(() => _pageController.dispose());
  return _pageController;
});

final currentPageProvier = StateProvider((_) => 0);

final imagePickerProvider = Provider.autoDispose((ref) => ImagePicker());

final showImageOptionProvier = StateProvider((ref) {
  return true;
});

class HomePage extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.read(userProvier.notifier);
    final showImage = ref.watch(showImageOptionProvier);

    return Scaffold(
      body: HomePageView(),
      appBar: AppBar(
        title: Text("中油生態地圖"),
        actions: [
          PopupMenuButton(
            onSelected: (val) async {
              if (val == 0) {
                // Logout
                userState.logout();
                Navigator.of(context).pushReplacement(MaterialPageRoute(
                  builder: (context) => LoginPage(),
                ));
              } else if (val == 1) {
                // Delete Account
                final result = await showDialog<bool>(
                  context: context,
                  barrierDismissible: false,
                  builder: (BuildContext context) => AlertDialog(
                    title: const Text('您確定要刪除帳號嗎？'),
                    content: const Text('您的帳號及資料將永久從平台中刪除\n並且無法復原！'),
                    actions: <Widget>[
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('取消'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text('刪除'),
                      ),
                    ],
                  ),
                );

                if (result != null && result == true) {
                  userState.deleteAccount().then((_) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text("帳號已刪除"),
                    ));
                    Navigator.of(context).pushReplacement(MaterialPageRoute(
                      builder: (context) => LoginPage(),
                    ));
                  }).catchError((err) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text("刪除失敗：${err.toString()}"),
                    ));
                  });
                }
              } else if (val == 2) {
                // Toggle user image
                final prefs = await SharedPreferences.getInstance();
                prefs.setBool("show-image", !showImage);
                print(!showImage);
                ref.read(showImageOptionProvier.state).state = !showImage;
              }
            },
            itemBuilder: (BuildContext context) {
              return [
                PopupMenuItem(
                  value: 0,
                  child: Text("登出"),
                ),
                PopupMenuItem(
                  value: 1,
                  child: Text("刪除帳號"),
                ),
                CheckedPopupMenuItem(
                  checked: showImage,
                  value: 2,
                  child: Text('顯示使用者圖片'),
                ),
              ];
            },
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: NewRecordFAB(),
      bottomNavigationBar: BottomNavBar(),
    );
  }
}

class NewRecordFAB extends HookConsumerWidget {
  const NewRecordFAB({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _picker = ref.watch(imagePickerProvider);

    return FloatingActionButton(
      onPressed: () async {
        final XFile? pickedFile =
            await _picker.pickImage(source: ImageSource.camera);

        if (pickedFile != null) {
          ref.read(speciesNameInputProvider.state).state = "";
          ref.read(descriptionInputProvider.state).state = "";

          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) => ConfirmDataPage(
                    type: DataViewType.Upload,
                    uploadImagePath: pickedFile.path)),
          );
        }
      },
      //
      // onPressed: () {
      //   Navigator.push(
      //     context,
      //     MaterialPageRoute(builder: (context) => CameraPreviewPage()),
      //   );
      // },
      tooltip: '新增記錄',
      child: Icon(Icons.camera_alt),
      elevation: 2.0,
    );
  }
}

class HomePageView extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _controller = ref.watch(pageControllerProvider);
    return PageView(
      controller: _controller,
      onPageChanged: (int page) {
        ref.read(currentPageProvier.state).state = page;
      },
      children: [
        NearbySpecies(),
        UploadedList(),
      ],
    );
  }
}

class BottomNavBar extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPage = ref.watch(currentPageProvier);
    final pageViewController = ref.watch(pageControllerProvider);

    const pageToIndex = [0, 2];

    return BottomAppBar(
      child: Theme(
        data: ThemeData(
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
        ),
        child: BottomNavigationBar(
          currentIndex: pageToIndex[currentPage],
          onTap: (value) {
            if (value == 1) return;
            pageViewController.animateToPage(pageToIndex.indexOf(value),
                duration: Duration(milliseconds: 200), curve: Curves.easeInOut);
          },
          items: [
            BottomNavigationBarItem(icon: Icon(Icons.pets), label: "附近物種"),
            BottomNavigationBarItem(
              icon: Icon(null),
              label: "新增記錄",
            ),
            BottomNavigationBarItem(icon: Icon(Icons.view_list), label: "上傳列表"),
          ],
        ),
      ),
      shape: CircularNotchedRectangle(),
      color: Colors.blueGrey,
    );
  }
}
