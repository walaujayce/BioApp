import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:pointycastle/export.dart' hide Padding;
import 'package:provider/provider.dart';
import 'package:http/http.dart';
import 'package:web3dart/web3dart.dart';
import 'package:web_socket_channel/io.dart';
import 'package:flutter/services.dart' show rootBundle;

import '../utils/bin2hex.dart';
import '../components/app_drawer.dart';
import '../config.dart' as Config;

class LoginPage extends StatelessWidget {
  static const String routeName = '/login';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Text(
                "Login",
                style: TextStyle(fontSize: 30),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                  obscureText: true,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Username",
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                  obscureText: true,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Password",
                  ),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    textStyle: TextStyle(fontSize: 20)),
                onPressed: () {},
                child: Text('Login'),
              ),
            ],
          ),
        ),
      ),
      drawer: AppDrawer(),
    );
  }
}

Future<Uint8List> decryptKey(List<dynamic> args) async {
  final encrypted = args[0] as Uint8List;
  final password = args[1] as Uint8List;

  final salt = encrypted.sublist(0, 16);
  final iv = encrypted.sublist(16, 24);
  final encryptedPrivkey = encrypted.sublist(24);

  final pbkdf2 = KeyDerivator('SHA-256/HMAC/PBKDF2')
    ..init(Pbkdf2Parameters(salt, 10000, 32));
  final key = pbkdf2.process(password);

  final chacha20 = StreamCipher('ChaCha20/20')
    ..init(false, ParametersWithIV(KeyParameter(key), iv));
  final privkey = chacha20.process(encryptedPrivkey);

  return privkey;
}
