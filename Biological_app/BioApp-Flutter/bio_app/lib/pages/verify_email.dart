import 'package:bio_app/utils/api_caller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../user_repository.dart';

class VerifyEmailPage extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    _resendEmail() async {
      final user = ref.read(userProvier.notifier).getUser;

      ref.read(resendStateProvider.state).state = ResendStatus.REQUESTING;

      await callApi(
          endpoint: "checkEmail",
          method: ApiMethod.POST,
          body: {},
          accessToken: user!.accessToken);

      ref.read(resendStateProvider.state).state = ResendStatus.REQUESTED;
    }

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Center(
                child: Text(
              "您的電子郵件信箱尚未驗證！",
              style: TextStyle(fontSize: 28),
            )),
            SizedBox(height: 48),
            Center(
              child: Text("如果您尚未收到我們發出的電子郵件，\n請按下下面的按鈕",
                  style: TextStyle(fontSize: 20), textAlign: TextAlign.center),
            ),
            SizedBox(height: 16),
            ResendButton(_resendEmail),
            SizedBox(height: 48),
            OutlinedButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('返回登入', style: TextStyle(fontSize: 24)),
            )
          ],
        ),
      ),
      appBar: AppBar(
        title: Text("電子郵件信箱未驗證"),
      ),
    );
  }
}

enum ResendStatus { NOTHING, REQUESTING, REQUESTED }

final resendStateProvider =
    StateProvider.autoDispose((ref) => ResendStatus.NOTHING);

class ResendButton extends HookConsumerWidget {
  final VoidCallback resendEmail;
  const ResendButton(this.resendEmail);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _status = ref.watch(resendStateProvider);

    return ElevatedButton(
      onPressed: _status == ResendStatus.NOTHING ? () => resendEmail() : null,
      child: Text(
        _status == ResendStatus.NOTHING
            ? "重新寄送驗證信件"
            : _status == ResendStatus.REQUESTING
                ? "請求重寄中..."
                : "已發送驗證信件至您的電子信箱",
        style: TextStyle(fontSize: 24),
      ),
      style: ElevatedButton.styleFrom(
        minimumSize: Size(double.infinity, 60),
      ),
    );
  }
}
