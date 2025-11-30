import 'package:bio_app/pages/home_page.dart';
import 'package:bio_app/pages/sms_input.dart';
import 'package:bio_app/pages/verify_email.dart';
import 'package:firebase_ui_auth/firebase_ui_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter_login/flutter_login.dart';

import '../user_repository.dart';

class LoginPage extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.read(userProvier.notifier);

    String? usernameValidator(String? input) {
      if (input == null) return "不可為空白！";
      if (input.length < 8) return "長度須至少為8碼！";
      if (input.length >= 128) return "長度太長！";
      final regExp = RegExp(r"^(?=.*\d)((?=.*[a-z])|(?=.*[A-Z])).{8,128}$");
      if (!regExp.hasMatch(input)) return "需為英文數字組合！";
      return null;
    }

    String? passwordValidator(String? input) {
      if (input == null) return "不可為空白！";
      if (input.length < 8) return "長度須至少為8碼！";
      final regExp = RegExp(r"^(?=.*\d)((?=.*[a-z])|(?=.*[A-Z])).{8,128}$");
      if (!regExp.hasMatch(input)) return "需為英文數字組合！";

      return null;
    }

    Future<String?> login(LoginData data) async {
      try {
        final user = await userState.login(data.name, data.password);
        if (!user.verified) {
          Navigator.of(context).push(MaterialPageRoute(
            builder: (context) => VerifyEmailPage(),
          ));
          return "";
        }
        return null;
      } catch (err) {
        return err.toString();
      }
    }

    Future<String?> signUp(LoginData data) async {
      try {
        final idToken = await Navigator.of(context).push(
            MaterialPageRoute<String>(builder: (context) => SMSInputScreen()));

        if (idToken == null) return "電話認證未完成";

        print(idToken);

        await userState.register(
            data.name, data.password, data.email!, idToken, data.legalName!);
        // await userState.login(data.name, data.password);
        return null;
      } catch (err) {
        return err.toString();
      }
    }

    Future<String?> resetPassword(String email) async {
      try {
        await userState.forgotPassword(email);
        return null;
      } catch (err) {
        return err.toString();
      }
    }

    return FlutterLogin(
      title: "中油生態地圖",
      onLogin: login,
      // onSignup: signUp,
      onSubmitAnimationCompleted: () {
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (context) => HomePage(),
        ));
      },
      onRecoverPassword: resetPassword,
      hideForgotPasswordButton: false,
      theme: LoginTheme(
        textFieldStyle: TextStyle(fontSize: 18),
        bodyStyle: TextStyle(fontSize: 18),
        buttonStyle: TextStyle(fontSize: 18),
      ),
      userType: LoginUserType.name,
      messages: LoginMessages(
          userHint: '使用者名稱',
          passwordHint: '密碼',
          confirmPasswordHint: '確認密碼',
          loginButton: '登入',
          signupButton: '註冊',
          goBackButton: '返回',
          confirmPasswordError: '密碼不一致！',
          // emailHint: "電子郵件地址",
          // emailError: "請輸入電子郵件！",
          // legalNameHint: "姓名",
          // legalNameError: "請輸入正確的姓名！",
          // phoneHint: "電話號碼",
          // phoneError: "請輸入正確的電話號碼（含國際碼）！",
          signUpSuccess: "註冊成功！請至電子郵件信箱驗證您的帳號！",
          // signUpMessage: "本 App 只能拿來拍攝動植物，如果是非生物或人像，將會刪除該筆資料",
          // acceptButtonText: "同意",
          // declineButtonText: "不同意",
          forgotPasswordButton: "忘記密碼？",
          recoverPasswordButton: "重設密碼",
          recoverPasswordIntro: "請輸入您的電子郵件地址",
          recoverPasswordDescription: "我們將會發送一封重設密碼的郵件至您的電子郵件信箱",
          recoverPasswordSuccess: "重設密碼郵件已發送至您的信箱！"),
      userValidator: usernameValidator,
      passwordValidator: passwordValidator,
      loginAfterSignUp: false,
    );
  }
}

extension on LoginData {
  get email => null;

  get legalName => null;
}

extension on LoginMessages{
  get emailHint => null;
}
