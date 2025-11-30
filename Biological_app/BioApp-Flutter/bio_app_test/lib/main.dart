import 'package:flutter/material.dart';

import 'pages/list_example.dart' show ListExamplePage;
import 'pages/login.dart' show LoginPage;
import 'pages/register.dart' show RegisterPage;
import 'routes/routes.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BioApp',
      home: ListExamplePage(),
      routes: {
        Routes.list_example: (context) => ListExamplePage(),
        Routes.login: (context) => LoginPage(),
        Routes.register: (context) => RegisterPage(),
      },
    );
  }
}
