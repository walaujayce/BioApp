import 'package:bio_app/pages/home_page.dart';
import 'package:bio_app/pages/login_page.dart';
import 'package:flutter/material.dart';
import 'package:introduction_screen/introduction_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

final page1 = PageViewModel(
  title: "歡迎使用 中油生態地圖!",
  body: "感謝您成為記錄生態的一分子！",
  image: Center(child: Image(image: AssetImage('images/logo.jpg'))),
);

final page2 = PageViewModel(
  title: "如何記錄生態？",
  body:
      "看到生物了嗎？ 只要按下「新增記錄」按鈕，將物種存在的證據拍攝下來，填寫物種資料，上傳至我們的資料庫，將由專家審核，並永久公開地保存在區塊鏈上！",
  image: Center(child: Image(image: AssetImage('images/new_capture.png'))),
);

final page3 = PageViewModel(
  title: "如何尋找物種？",
  body: "透過「附近物種」地圖，可以看到在您的位置最近目擊到的物種，多留意這些物種吧！",
  image: Center(child: Image(image: AssetImage('images/nearby.jpg'))),
);

final page4 = PageViewModel(
  title: "如何查看我的貢獻？",
  body: "進入「上傳記錄」頁面，查看或編輯您的上傳記錄吧！",
  image: Center(child: Image(image: AssetImage('images/history.jpg'))),
);

final page5 = PageViewModel(
  title: "注意！",
  body: "本 App 只能拿來拍攝動植物!如果是非生物或人像，將會刪除該筆資料!",
  image: Center(child: Image(image: AssetImage('images/warning.jpg'))),
);

class Introduction extends StatelessWidget {
  const Introduction({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text('歡迎使用中油生態地圖!')),
        body: Padding(
            padding: const EdgeInsets.all(16.0),
            child: IntroductionScreen(
              pages: [page1, page2, page3, page4, page5],
              onDone: () async {
                final prefs = await SharedPreferences.getInstance();
                prefs.setBool("intro", true);
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => LoginPage()),
                );
              },
              showSkipButton: true,
              skip: Text("跳過", style: TextStyle(fontWeight: FontWeight.w600)),
              next: Text("下一步", style: TextStyle(fontWeight: FontWeight.w600)),
              done:
                  Text("開始記錄!", style: TextStyle(fontWeight: FontWeight.w600)),
              dotsDecorator: DotsDecorator(
                  size: const Size.square(10.0),
                  activeSize: const Size(20.0, 10.0),
                  color: Colors.black26,
                  spacing: const EdgeInsets.symmetric(horizontal: 3.0),
                  activeShape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25.0))),
            )));
  }
}
