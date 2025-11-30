import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:loading_overlay/loading_overlay.dart';

import 'confirm_data.dart';

final cameraControllerProvider =
    FutureProvider.autoDispose<CameraController>((ref) async {
  // Obtain a list of the available cameras on the device.
  final cameras = await availableCameras();

  // Get the first camera from the list of available cameras.
  final firstCamera = cameras.first;

  final _controller = CameraController(firstCamera, ResolutionPreset.high);

  ref.onDispose(() => _controller.dispose());

  await _controller.initialize();

  return _controller;
});

final isLoadingProvider = StateProvider.autoDispose((ref) => false);

class CameraPreviewPage extends HookConsumerWidget {
  const CameraPreviewPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _cameraController = ref.watch(cameraControllerProvider);
    final _isLoading = ref.watch(isLoadingProvider);

    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        appBar: AppBar(title: const Text('新增記錄')),
        body: _cameraController.when(
          loading: () => Center(child: CircularProgressIndicator()),
          error: (err, stack) => Center(child: Text("相機啟動失敗 :(")),
          data: (_controller) => CameraPreview(_controller),
        ),
        floatingActionButton: FloatingActionButton(
          child: const Icon(Icons.camera_alt),
          onPressed: () async {
            try {
              ref.read(isLoadingProvider.state).state = true;

              // Ensure that the camera is initialized.
              final _controller =
                  await ref.read(cameraControllerProvider.future);

              final image = await _controller.takePicture();

              ref.read(isLoadingProvider.state).state = false;

              // If the picture was taken, display it on a new screen.
              await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => ConfirmDataPage(
                    type: DataViewType.Upload,
                    uploadImagePath: image.path,
                  ),
                ),
              );
            } catch (e) {
              print(e);
              ref.read(isLoadingProvider.state).state = false;

              final snackBar = SnackBar(content: Text('錯誤: $e'));
              ScaffoldMessenger.of(context).showSnackBar(snackBar);
            }
          },
        ),
      ),
    );
  }
}
