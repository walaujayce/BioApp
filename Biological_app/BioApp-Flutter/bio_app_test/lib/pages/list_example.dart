import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart';
import 'package:web3dart/web3dart.dart';
import 'package:web_socket_channel/io.dart';
import 'package:flutter/services.dart' show rootBundle;

import '../components/app_drawer.dart';
import '../config.dart' as Config;

class ListExamplePage extends StatelessWidget {
  static const String routeName = '/list_example';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<WorksData>(
      create: (context) => WorksData(),
      child: ListExample(),
    );
  }
}

class ListExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    Provider.of<WorksData>(context, listen: false).getWorks();

    return Scaffold(
      appBar: AppBar(
        title: Text('Contract Test'),
      ),
      body: Center(
        child: Consumer<WorksData>(
          builder: (context, worksData, child) {
            return worksData.loading
                ? Text("Loading...")
                : CardShow(works: worksData.works);
          },
        ),
      ),
      drawer: AppDrawer(),
    );
  }
}

class CardShow extends StatelessWidget {
  CardShow({required this.works});
  final List<List<dynamic>> works;

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
        widthFactor: .8,
        child: ListView.builder(
          itemCount: works.length,
          itemBuilder: (BuildContext context, int index) {
            return Card(
                child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.network(works[index][4]),
                  Text(works[index][0], style: TextStyle(fontSize: 20)),
                  Text(works[index][3]),
                ],
              ),
            ));
          },
        ));
  }
}

class WorksData extends ChangeNotifier {
  bool loading = true;
  late List<List<dynamic>> works;

  getWorks() async {
    final client = Web3Client(Config.infuraHTTP, Client(), socketConnector: () {
      return IOWebSocketChannel.connect(Config.infuraWSS).cast<String>();
    });

    final abiCode = await rootBundle.loadString("assets/abi.json");

    final contract = DeployedContract(
        ContractAbi.fromJson(abiCode, "DecentralizedRating"),
        EthereumAddress.fromHex(Config.contratAddress));

    final count = (await client.call(
            contract: contract,
            function: contract.function("workCount"),
            params: []))[0]
        .toInt();
    print(count);

    final indexes = Iterable<int>.generate(count).toList();
    print(indexes);

    works = await Future.wait(indexes.map((i) => client.call(
        contract: contract,
        function: contract.function("works"),
        params: [BigInt.from(i)])));

    print(works[0]);
    loading = false;

    notifyListeners();
  }
}
