import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'api/ajn_api.dart';
import 'home/home_screen.dart';
import 'model/tool_definition.dart';
import 'theme/ajn_theme.dart';
import 'tool/tool_screen.dart';

final apiProvider = Provider<AjnApi>((ref) => AjnApi());
final toolsProvider = FutureProvider<List<ToolDefinition>>((ref) => ref.watch(apiProvider).fetchTools());

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: <RouteBase>[
      GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/tool/:id',
        builder: (context, state) => ToolScreen(toolId: state.pathParameters['id'] ?? ''),
      ),
    ],
  );
});

class AjnPdfApp extends ConsumerWidget {
  const AjnPdfApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'AJN PDF',
      theme: AjnTheme.light(),
      routerConfig: ref.watch(routerProvider),
    );
  }
}
