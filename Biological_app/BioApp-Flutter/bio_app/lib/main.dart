import 'package:bio_app/pages/introduction_page.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

import 'pages/login_page.dart';
import 'pages/home_page.dart';

import './user_repository.dart';

void main() async {
  // Ensure that plugin services are initialized
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  User? loadedUser = await UserRepository.getSavedUser();

  final prefs = await SharedPreferences.getInstance();
  bool? intro = prefs.getBool("intro");

  runApp(ProviderScope(child: MyApp(loadedUser, intro)));
}

class MyApp extends HookConsumerWidget {
  final User? loadedUser;
  final bool? intro;
  MyApp(this.loadedUser, this.intro);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (loadedUser != null) {
      final userState = ref.read(userProvier.notifier);
      userState.setUser(loadedUser!);
    }

    WidgetsBinding.instance?.addPostFrameCallback((_) async {
      final prefs = await SharedPreferences.getInstance();
      bool showImage = prefs.getBool("show-image") ?? true;
      ref.read(showImageOptionProvier.state).state = showImage;
    });

    return MaterialApp(
      title: '中油生態地圖',
      debugShowCheckedModeBanner: false,
      home: intro == true
          ? (loadedUser == null ? LoginPage() : HomePage())
          : Introduction(),
    );
  }
}
