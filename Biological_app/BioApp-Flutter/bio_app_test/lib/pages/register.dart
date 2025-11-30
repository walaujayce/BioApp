import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'dart:math';
import 'dart:convert';
import 'dart:typed_data';
import 'package:provider/provider.dart';
import "package:pointycastle/export.dart" hide Padding;
import 'package:web3dart/web3dart.dart';
import 'package:flutter/services.dart' show rootBundle;

import '../utils/bin2hex.dart';
import '../components/app_drawer.dart';
import '../config.dart' as Config;

class RegisterPage extends StatelessWidget {
  static const String routeName = '/register';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<RegisterInfo>(
      create: (context) => RegisterInfo(),
      child: Scaffold(
        appBar: AppBar(
          title: Text('Register'),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              children: [
                Text(
                  "Register",
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
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    obscureText: true,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: "Password Again",
                    ),
                  ),
                ),
                RegisterButton(),
                Consumer<RegisterInfo>(
                  builder: (context, registerInfo, child) {
                    return Column(
                      children: [
                        if (registerInfo.addressCreated)
                          Text(
                              "Address: ${registerInfo.address.hex}\nPrivkey: ${bin2hex(registerInfo.privkey.privateKey)}"),
                        if (registerInfo.gotResponse)
                          Text("Encrypted: ${bin2hex(registerInfo.encrypted)}"),
                      ],
                    );
                  },
                )
              ],
            ),
          ),
        ),
        drawer: AppDrawer(),
      ),
    );
  }
}

class RegisterButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(textStyle: TextStyle(fontSize: 20)),
      onPressed: () {
        Provider.of<RegisterInfo>(context, listen: false).doRegister();
      },
      child: Text('Login'),
    );
  }
}

class RegisterInfo extends ChangeNotifier {
  bool addressCreated = false;
  bool gotResponse = false;

  String username = "Test123";
  String password = "testtest";

  late Uint8List encrypted;

  late EthPrivateKey privkey;
  late EthereumAddress address;

  doRegister() async {
    await createAddress();

    encrypted = await compute(encryptKey,
        [privkey.privateKey, Uint8List.fromList(utf8.encode(password))]);

    print("Encrypted: ${bin2hex(encrypted)}");

    gotResponse = true;
    notifyListeners();
  }

  createAddress() async {
    privkey = await compute(createPrivkey, null);
    address = await privkey.extractAddress();

    print("Address: ${address.hex}");
    print("Privkey: ${bin2hex(privkey.privateKey)}");

    addressCreated = true;
    notifyListeners();
  }
}

FortunaRandom createRandom() {
  final seedSource = Random.secure();
  final seeds = <int>[];
  for (var i = 0; i < 32; i++) {
    seeds.add(seedSource.nextInt(255));
  }
  final secureRandom = FortunaRandom()
    ..seed(KeyParameter(Uint8List.fromList(seeds)));
  return secureRandom;
}

Future<EthPrivateKey> createPrivkey(void _) async {
  return EthPrivateKey.fromHex(bin2hex(createRandom().nextBytes(32)));
}

Future<Uint8List> encryptKey(List<dynamic> args) async {
  final privkey = args[0] as Uint8List;
  final password = args[1] as Uint8List;

  final secureRandom = createRandom();

  final salt = secureRandom.nextBytes(16);
  final iv = secureRandom.nextBytes(8);

  final pbkdf2 = KeyDerivator('SHA-256/HMAC/PBKDF2')
    ..init(Pbkdf2Parameters(salt, 10000, 32));
  final key = pbkdf2.process(password);

  final chacha20 = StreamCipher('ChaCha20/20')
    ..init(true, ParametersWithIV(KeyParameter(key), iv));
  final encryptedPrivkey = chacha20.process(privkey);

  final encrypted = Uint8List.fromList(salt + iv + encryptedPrivkey);
  return encrypted;
}
