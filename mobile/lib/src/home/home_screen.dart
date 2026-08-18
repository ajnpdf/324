import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../app.dart';
import '../model/tool_definition.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _search = TextEditingController();
  String _query = '';
  String _category = 'All';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tools = ref.watch(toolsProvider);
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.refresh(toolsProvider.future),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: <Widget>[
              SliverToBoxAdapter(child: _header(context)),
              SliverToBoxAdapter(child: _hero(context)),
              tools.when(
                loading: () => const SliverFillRemaining(child: Center(child: CircularProgressIndicator())),
                error: (error, _) => SliverFillRemaining(child: _ErrorState(error: error, onRetry: () => ref.invalidate(toolsProvider))),
                data: (items) => _toolSliver(context, items),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _header(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 4),
      child: Row(
        children: <Widget>[
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              gradient: const LinearGradient(colors: <Color>[Color(0xFF4F46E5), Color(0xFF7C3AED)]),
            ),
            child: const Icon(Icons.picture_as_pdf_rounded, color: Colors.white),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text('AJN PDF', style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800)),
                Text('Documents, simplified.', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
              ],
            ),
          ),
          IconButton.filledTonal(onPressed: () => _search.requestFocus(), icon: const Icon(Icons.search_rounded)),
        ],
      ),
    );
  }

  Widget _hero(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[Color(0xFFEEF2FF), Color(0xFFF8F5FF)],
          ),
          border: Border.all(color: const Color(0xFFE0E7FF)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text('What do you want to do?', style: TextStyle(fontSize: 27, fontWeight: FontWeight.w800, height: 1.05)),
            const SizedBox(height: 8),
            const Text('Choose a real AJN processing tool. No demo actions.', style: TextStyle(color: Color(0xFF64748B))),
            const SizedBox(height: 18),
            TextField(
              controller: _search,
              onChanged: (value) => setState(() => _query = value.trim().toLowerCase()),
              decoration: const InputDecoration(prefixIcon: Icon(Icons.search_rounded), hintText: 'Search PDF, OCR, Word, image…'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _toolSliver(BuildContext context, List<ToolDefinition> allTools) {
    final categories = <String>{'All', ...allTools.map((tool) => tool.category)}.toList();
    if (!categories.contains(_category)) _category = 'All';
    final filtered = allTools.where((tool) {
      final categoryMatch = _category == 'All' || tool.category == _category;
      final queryMatch = _query.isEmpty || tool.name.toLowerCase().contains(_query) || tool.id.contains(_query);
      return categoryMatch && queryMatch;
    }).toList(growable: false);

    return SliverMainAxisGroup(
      slivers: <Widget>[
        SliverToBoxAdapter(
          child: SizedBox(
            height: 52,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final item = categories[index];
                return ChoiceChip(
                  label: Text(_pretty(item)),
                  selected: item == _category,
                  onSelected: (_) => setState(() => _category = item),
                );
              },
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          sliver: SliverLayoutBuilder(
            builder: (context, constraints) {
              final width = constraints.crossAxisExtent;
              final columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
              return SliverGrid.builder(
                itemCount: filtered.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: width < 450 ? 0.92 : 1.15,
                ),
                itemBuilder: (context, index) => _ToolCard(tool: filtered[index]),
              );
            },
          ),
        ),
      ],
    );
  }

  static String _pretty(String value) => value
      .split('-')
      .map((word) => word.isEmpty ? word : '${word[0].toUpperCase()}${word.substring(1)}')
      .join(' ');
}

class _ToolCard extends StatelessWidget {
  const _ToolCard({required this.tool});

  final ToolDefinition tool;

  @override
  Widget build(BuildContext context) {
    final icon = switch (tool.category) {
      'ocr' => Icons.document_scanner_rounded,
      'image-to-pdf' || 'pdf-to-image' => Icons.image_rounded,
      'pdf-security' => Icons.lock_rounded,
      'pdf-to-document' => Icons.description_rounded,
      _ => Icons.auto_awesome_rounded,
    };
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: tool.available ? () => context.push('/tool/${tool.id}') : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                width: 46,
                height: 46,
                decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(15)),
                child: Icon(icon, color: const Color(0xFF4F46E5)),
              ),
              const Spacer(),
              Text(tool.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 6),
              Row(
                children: <Widget>[
                  Icon(tool.available ? Icons.bolt_rounded : Icons.pause_circle_outline_rounded, size: 14, color: tool.available ? const Color(0xFF16A34A) : const Color(0xFF94A3B8)),
                  const SizedBox(width: 4),
                  Expanded(child: Text(tool.available ? 'Ready' : 'Unavailable', style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)))),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.error, required this.onRetry});
  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(Icons.cloud_off_rounded, size: 48),
            const SizedBox(height: 12),
            const Text('Processing service unavailable', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 8),
            Text('$error', textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF64748B))),
            const SizedBox(height: 18),
            FilledButton.tonal(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
