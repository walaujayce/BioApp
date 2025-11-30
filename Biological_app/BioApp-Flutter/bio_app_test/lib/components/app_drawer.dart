import 'package:flutter/material.dart';
import '../routes/routes.dart';

class AppDrawer extends StatelessWidget {
  Widget _createHeader() {
    return DrawerHeader(
        margin: EdgeInsets.zero,
        padding: EdgeInsets.zero,
        decoration: BoxDecoration(
          color: Colors.blue,
        ),
        child: Stack(children: <Widget>[
          Positioned(
              bottom: 12.0,
              left: 16.0,
              child: Text("BioApp",
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20.0,
                      fontWeight: FontWeight.w500))),
        ]));
  }

  Widget _createDrawerItem(
      {required IconData icon,
      required String text,
      required GestureTapCallback onTap}) {
    return ListTile(
      title: Row(
        children: <Widget>[
          Icon(icon),
          Padding(
            padding: EdgeInsets.only(left: 8.0),
            child: Text(text),
          )
        ],
      ),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _createHeader(),
          _createDrawerItem(
            icon: Icons.list_alt,
            text: 'Web3 Example',
            onTap: () =>
                Navigator.pushReplacementNamed(context, Routes.list_example),
          ),
          _createDrawerItem(
            icon: Icons.login,
            text: 'Login',
            onTap: () => Navigator.pushReplacementNamed(context, Routes.login),
          ),
          _createDrawerItem(
            icon: Icons.app_registration,
            text: 'Register',
            onTap: () =>
                Navigator.pushReplacementNamed(context, Routes.register),
          ),
          ListTile(
            title: Text('0.0.1'),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
