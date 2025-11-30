import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_ui_auth/firebase_ui_auth.dart';
import 'package:flutter/material.dart';

class SMSInputScreen extends StatefulWidget {
  SMSInputScreen({Key? key}) : super(key: key);

  @override
  State<SMSInputScreen> createState() => _SMSInputScreenState();
}

class _SMSInputScreenState extends State<SMSInputScreen> {
  String? verificationId;
  StreamSubscription? authStateSub;

  @override
  void initState() {
    super.initState();
    FirebaseAuth.instance.signOut();

    authStateSub =
        FirebaseAuth.instance.authStateChanges().listen((User? user) async {
      if (user != null) {
        final idToken = await user.getIdToken();
        Navigator.of(context).pop(idToken);
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
    authStateSub?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: AuthFlowBuilder<PhoneAuthController>(
              listener: (oldState, newState, controller) async {
            if (newState is SMSCodeSent) {
              verificationId = newState.verificationId;
            }
          }, builder: (context, state, ctrl, child) {
            Widget? topWidget;
            var buttonLabel = "載入中...";
            Function? onSubmit;

            final phoneKey = GlobalKey<PhoneInputState>();
            final smsKey = GlobalKey<SMSCodeInputState>();

            if (state is AwaitingPhoneNumber) {
              topWidget = PhoneInput(
                key: phoneKey,
                initialCountryCode: 'TW',
                onSubmit: (phoneNumber) {
                  ctrl.acceptPhoneNumber(phoneNumber);
                },
              );
              buttonLabel = "下一步";
              onSubmit = () =>
                  ctrl.acceptPhoneNumber(phoneKey.currentState!.phoneNumber);
            } else if (state is SMSCodeSent ||
                state is AuthFailed &&
                    state.exception is AutoresolutionFailedException) {
              topWidget = SMSCodeInput(
                  key: smsKey,
                  onSubmit: (smsCode) {
                    ctrl.verifySMSCode(smsCode, verificationId: verificationId);
                  });
              buttonLabel = "驗證";
              onSubmit = () => ctrl.verifySMSCode(
                    smsKey.currentState!.code,
                    verificationId: verificationId,
                  );
            } else if (state is SigningIn) {
              topWidget = CircularProgressIndicator();
              buttonLabel = "驗證號碼中...";
            } else if (state is PhoneVerified) {
              topWidget = CircularProgressIndicator();
              buttonLabel = "驗證電話中...";
            } else if (state is AuthFailed &&
                !(state.exception is AutoresolutionFailedException)) {
              topWidget = ErrorText(exception: state.exception);
              buttonLabel = "重新輸入";
              onSubmit = () {
                ctrl.reset();
                if (ctrl.auth.currentUser != null) ctrl.auth.signOut();
              };
            }

            return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Center(child: topWidget),
                  SizedBox(height: 48),
                  ElevatedButton(
                    onPressed: onSubmit == null ? null : () => onSubmit!(),
                    child: Text(
                      buttonLabel,
                      style: TextStyle(fontSize: 24),
                    ),
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, 60),
                    ),
                  )
                ]);
          })),
      appBar: AppBar(
        title: Text("電話驗證"),
      ),
    );
  }
}
