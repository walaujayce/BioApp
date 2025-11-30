import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'utils/api_caller.dart';

final userProvier = StateNotifierProvider((ref) => UserRepository(null));

class User {
  String accessToken;
  bool verified;

  User(this.accessToken, this.verified);
}

abstract class BaseUserRepository {
  void setUser(User user);
  void rmUser();
  User? get getUser;

  Future<void> saveUser(User user);
  Future<bool> loadSavedUser();
  Future<void> rmSavedUser();

  Future<User> login(String username, String password);
  Future<void> register(String username, String password, String email,
      String verifyId, String legalName);
  Future<void> forgotPassword(String email);
  Future<void> deleteAccount();

  Future<void> logout();
}

class UserRepository extends StateNotifier<User?>
    implements BaseUserRepository {
  UserRepository(User? state) : super(state);

  @override
  Future<bool> loadSavedUser() async {
    final _user = await getSavedUser();

    if (_user == null) return false;

    setUser(_user);
    return true;
  }

  @override
  Future<User> login(String phoneNumber, String password) async {
    try {
      final res = await callApi(
          endpoint: "login",
          method: ApiMethod.POST,
          body: {"phone": phoneNumber, "password": password});

      if (res.response.statusCode == 200) {
        final verified = res.data![1] == 1 ? true : false;
        final accessToken = res.data![0] as String;
        final newUser = User(accessToken, verified);
        setUser(newUser);

        if (verified) saveUser(newUser);

        return newUser;
      } else {
        return Future.error("${res.code} ${res.message}");
      }
    } catch (err) {
      print(err);
      return Future.error(err);
    }
  }

  @override
  Future<void> register(String username, String password, String email,
      String verifyId, String legalName) async {
    try {
      final res =
          await callApi(endpoint: "register", method: ApiMethod.POST, body: {
        "username": username,
        "password": password,
        "email": email,
        "verifyid": verifyId,
        "name": legalName
      });

      if (res.response.statusCode != 200) {
        return Future.error("${res.code} ${res.message}");
      }
    } catch (err) {
      print(err);
      return Future.error(err);
    }
  }

  @override
  Future<void> forgotPassword(String email) async {
    try {
      final res = await callApi(
          endpoint: "forgetpassword",
          method: ApiMethod.POST,
          body: {"email": email});

      if (res.response.statusCode != 200) {
        return Future.error("${res.code} ${res.message}");
      }
    } catch (err) {
      print(err);
      return Future.error(err);
    }
  }

  @override
  Future<void> rmSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.remove("accessToken");
  }

  @override
  void rmUser() {
    state = null;
  }

  @override
  Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setString("accessToken", user.accessToken);
  }

  @override
  void setUser(User user) {
    state = user;
  }

  static Future<User?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final _accessToken = prefs.getString("accessToken");

    if (_accessToken == null) return null;

    return User(_accessToken, true);
  }

  @override
  Future<void> logout() async {
    rmUser();
    rmSavedUser();
  }

  @override
  User? get getUser => state;

  @override
  Future<void> deleteAccount() async {
    try {
      final res = await callApi(
          endpoint: "deleteAccount",
          method: ApiMethod.POST,
          body: {},
          accessToken: state!.accessToken);

      if (res.response.statusCode != 200) {
        return Future.error("${res.code} ${res.message}");
      }
    } catch (err) {
      print(err);
      return Future.error(err);
    }
  }
}
