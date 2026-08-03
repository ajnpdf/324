import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:cross_file/cross_file.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class AppConfig {
  static const websiteUrl = String.fromEnvironment(
    'WEBSITE_URL',
    defaultValue: 'https://www.ajnpdf.com',
  );
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.ajnpdf.com',
  );
  static const firebaseApiKey = String.fromEnvironment('FIREBASE_WEB_API_KEY');
  static const productionAds = bool.fromEnvironment(
    'PRODUCTION_ADS',
    defaultValue: false,
  );
  static const bannerAdUnit = String.fromEnvironment('ADMOB_BANNER_ANDROID');
  static const interstitialAdUnit =
      String.fromEnvironment('ADMOB_INTERSTITIAL_ANDROID');
  static const monthlyProduct = String.fromEnvironment(
    'PLAY_MONTHLY_PRODUCT_ID',
    defaultValue: 'ajn_pdf_premium_monthly',
  );
  static const yearlyProduct = String.fromEnvironment(
    'PLAY_YEARLY_PRODUCT_ID',
    defaultValue: 'ajn_pdf_premium_yearly',
  );
}

class AnonymousAuthService {
  AnonymousAuthService(this._dio);

  final Dio _dio;
  String? _idToken;
  String? _refreshToken;
  DateTime? _expiresAt;

  Future<void> initialise() async {
    if (AppConfig.firebaseApiKey.isEmpty) return;
    final preferences = await SharedPreferences.getInstance();
    _refreshToken = preferences.getString('firebase_refresh_token');
    if (_refreshToken != null) {
      try {
        await _refresh();
        return;
      } catch (_) {
        await preferences.remove('firebase_refresh_token');
      }
    }
    await _signUp();
  }

  Future<String?> token() async {
    if (AppConfig.firebaseApiKey.isEmpty) return null;
    if (_idToken == null ||
        _expiresAt == null ||
        DateTime.now().isAfter(_expiresAt!.subtract(const Duration(minutes: 2)))) {
      if (_refreshToken == null) {
        await _signUp();
      } else {
        await _refresh();
      }
    }
    return _idToken;
  }

  Future<void> _signUp() async {
    final response = await _dio.post<Map<String, dynamic>>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
      queryParameters: {'key': AppConfig.firebaseApiKey},
      data: {'returnSecureToken': true},
    );
    final value = response.data!;
    _idToken = value['idToken'] as String?;
    _refreshToken = value['refreshToken'] as String?;
    _expiresAt = DateTime.now().add(
      Duration(seconds: int.tryParse('${value['expiresIn']}') ?? 3600),
    );
    final preferences = await SharedPreferences.getInstance();
    if (_refreshToken != null) {
      await preferences.setString('firebase_refresh_token', _refreshToken!);
    }
  }

  Future<void> _refresh() async {
    final response = await _dio.post<Map<String, dynamic>>(
      'https://securetoken.googleapis.com/v1/token',
      queryParameters: {'key': AppConfig.firebaseApiKey},
      options: Options(
        contentType: Headers.formUrlEncodedContentType,
      ),
      data: {
        'grant_type': 'refresh_token',
        'refresh_token': _refreshToken,
      },
    );
    final value = response.data!;
    _idToken = value['id_token'] as String?;
    _refreshToken = value['refresh_token'] as String?;
    _expiresAt = DateTime.now().add(
      Duration(seconds: int.tryParse('${value['expires_in']}') ?? 3600),
    );
    final preferences = await SharedPreferences.getInstance();
    if (_refreshToken != null) {
      await preferences.setString('firebase_refresh_token', _refreshToken!);
    }
  }
}

class AdsController extends ChangeNotifier {
  static const _testBanner = 'ca-app-pub-3940256099942544/6300978111';
  static const _testInterstitial = 'ca-app-pub-3940256099942544/1033173712';

  BannerAd? banner;
  InterstitialAd? _interstitial;
  int _completedOperations = 0;

  String get _bannerId =>
      !AppConfig.productionAds || kDebugMode ? _testBanner : AppConfig.bannerAdUnit;
  String get _interstitialId => !AppConfig.productionAds || kDebugMode
      ? _testInterstitial
      : AppConfig.interstitialAdUnit;

  Future<void> initialise() async {
    if (!Platform.isAndroid) return;
    final canRequestAds = await _requestConsent();
    if (!canRequestAds) return;
    await MobileAds.instance.initialize();
    _loadBanner();
    _loadInterstitial();
  }

  Future<bool> _requestConsent() {
    final result = Completer<bool>();
    ConsentInformation.instance.requestConsentInfoUpdate(
      ConsentRequestParameters(),
      () {
        ConsentForm.loadAndShowConsentFormIfRequired((FormError? error) async {
          final allowed = await ConsentInformation.instance.canRequestAds();
          if (!result.isCompleted) result.complete(allowed);
        });
      },
      (FormError error) {
        if (!result.isCompleted) result.complete(false);
      },
    );
    return result.future.timeout(
      const Duration(seconds: 20),
      onTimeout: () => false,
    );
  }

  Future<void> showPrivacyOptions() async {
    if (!Platform.isAndroid) return;
    final completer = Completer<void>();
    ConsentForm.showPrivacyOptionsForm((FormError? error) {
      if (!completer.isCompleted) completer.complete();
    });
    await completer.future;
  }

  void _loadBanner() {
    if (_bannerId.isEmpty) return;
    banner?.dispose();
    banner = BannerAd(
      adUnitId: _bannerId,
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdLoaded: (_) => notifyListeners(),
        onAdFailedToLoad: (ad, _) {
          ad.dispose();
          banner = null;
          notifyListeners();
        },
      ),
    )..load();
  }

  void _loadInterstitial() {
    if (_interstitialId.isEmpty) return;
    InterstitialAd.load(
      adUnitId: _interstitialId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) => _interstitial = ad,
        onAdFailedToLoad: (_) => _interstitial = null,
      ),
    );
  }

  void successfulOperation({required bool premium}) {
    if (premium || !Platform.isAndroid) return;
    _completedOperations += 1;
    if (_completedOperations < 3 || _interstitial == null) return;

    final ad = _interstitial!;
    _interstitial = null;
    _completedOperations = 0;
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (value) {
        value.dispose();
        _loadInterstitial();
      },
      onAdFailedToShowFullScreenContent: (value, _) {
        value.dispose();
        _loadInterstitial();
      },
    );
    ad.show();
  }

  @override
  void dispose() {
    banner?.dispose();
    _interstitial?.dispose();
    super.dispose();
  }
}

class PurchaseController extends ChangeNotifier {
  PurchaseController(this._dio, this._auth);

  final Dio _dio;
  final AnonymousAuthService _auth;
  final InAppPurchase _store = InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  final Map<String, ProductDetails> _products = {};
  bool premium = false;
  bool loading = true;
  String? message;
  Timer? _refreshTimer;

  List<ProductDetails> get products => _products.values.toList();

  Future<void> initialise() async {
    await _auth.initialise();
    if (Platform.isAndroid) {
      _subscription = _store.purchaseStream.listen(
        _handlePurchases,
        onError: (Object error) {
          message = 'Google Play purchase stream error: $error';
          notifyListeners();
        },
      );

      if (await _store.isAvailable()) {
        final result = await _store.queryProductDetails({
          AppConfig.monthlyProduct,
          AppConfig.yearlyProduct,
        });
        for (final product in result.productDetails) {
          _products[product.id] = product;
        }
        if (result.error != null) message = result.error!.message;
      }
    }

    await refreshEntitlement();
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => refreshEntitlement(),
    );
    loading = false;
    notifyListeners();
  }

  Future<void> refreshEntitlement() async {
    try {
      final token = await _auth.token();
      if (token == null) return;
      final response = await _dio.get<Map<String, dynamic>>(
        '${AppConfig.websiteUrl}/api/subscriptions/status',
        options: Options(headers: {'authorization': 'Bearer $token'}),
      );
      premium = response.data?['entitlement']?['active'] == true;
      notifyListeners();
    } catch (_) {
      // Offline use remains available; status refresh retries automatically.
    }
  }

  Future<void> buy(String productId) async {
    final product = _products[productId];
    if (product == null) {
      throw StateError('The Google Play subscription is not available yet.');
    }
    await _store.buyNonConsumable(
      purchaseParam: PurchaseParam(productDetails: product),
    );
  }

  Future<void> restore() => _store.restorePurchases();

  Future<void> _handlePurchases(List<PurchaseDetails> purchases) async {
    for (final purchase in purchases) {
      if (purchase.status == PurchaseStatus.error) {
        message = purchase.error?.message ?? 'Purchase failed.';
        notifyListeners();
        continue;
      }

      if (purchase.status != PurchaseStatus.purchased &&
          purchase.status != PurchaseStatus.restored) {
        continue;
      }

      try {
        final token = await _auth.token();
        if (token == null) {
          throw StateError('Firebase anonymous authentication is not configured.');
        }

        final response = await _dio.post<Map<String, dynamic>>(
          '${AppConfig.websiteUrl}/api/google-play/verify',
          data: {
            'purchaseToken':
                purchase.verificationData.serverVerificationData,
          },
          options: Options(headers: {'authorization': 'Bearer $token'}),
        );

        premium = response.data?['active'] == true;
        message = premium ? 'AJN PDF Premium is active.' : 'Subscription is not active.';
        notifyListeners();

        if (purchase.pendingCompletePurchase) {
          await _store.completePurchase(purchase);
        }
      } catch (error) {
        message = 'Secure purchase verification failed: $error';
        notifyListeners();
      }
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _subscription?.cancel();
    super.dispose();
  }
}

Future<void> shareFile(String path) {
  return SharePlus.instance
      .share(ShareParams(files: [XFile(path)], title: 'AJN PDF result'))
      .then((_) {});
}

class MergePdfPage extends StatefulWidget {
  const MergePdfPage({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<MergePdfPage> createState() => _MergePdfPageState();
}

class _MergePdfPageState extends State<MergePdfPage> {
  final List<PlatformFile> _files = [];
  bool _busy = false;
  String? _result;

  Future<void> _pick() async {
    final value = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: const ['pdf'],
    );
    if (value == null) return;
    setState(() {
      _files
        ..clear()
        ..addAll(value.files.where((file) => file.path != null));
    });
  }

  Future<void> _merge() async {
    if (_files.length < 2) return;
    setState(() => _busy = true);
    try {
      final uploads = <MultipartFile>[];
      for (final file in _files) {
        uploads.add(await MultipartFile.fromFile(file.path!, filename: file.name));
      }

      final response = await Dio().post<List<int>>(
        '${AppConfig.apiBaseUrl}/api/pdf/merge',
        data: FormData.fromMap({'files': uploads}),
        options: Options(responseType: ResponseType.bytes),
      );

      final bytes = Uint8List.fromList(response.data ?? const <int>[]);
      final directory = await getApplicationDocumentsDirectory();
      final path =
          '${directory.path}${Platform.pathSeparator}AJN-PDF-merged-${DateTime.now().millisecondsSinceEpoch}.pdf';
      await File(path).writeAsBytes(bytes, flush: true);
      setState(() => _result = path);
      widget.onCompleted();
    } on DioException catch (error) {
      if (!mounted) return;
      final detail = error.response?.data is Map
          ? '${(error.response?.data as Map)['detail']}'
          : 'Check the AJN PDF API connection.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Merge failed: $detail')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Merge PDF')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          FilledButton.icon(
            onPressed: _busy ? null : _pick,
            icon: const Icon(Icons.file_open),
            label: const Text('Select PDF files'),
          ),
          const SizedBox(height: 12),
          ..._files.map(
            (file) => ListTile(
              leading: const Icon(Icons.picture_as_pdf),
              title: Text(file.name),
              subtitle: Text('${(file.size / 1024).ceil()} KB'),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _busy || _files.length < 2 ? null : _merge,
            child: Text(_busy ? 'Merging…' : 'Merge PDFs'),
          ),
          if (_result != null) ...[
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => OpenFilex.open(_result!),
              icon: const Icon(Icons.open_in_new),
              label: const Text('Open result'),
            ),
            OutlinedButton.icon(
              onPressed: () => shareFile(_result!),
              icon: const Icon(Icons.share),
              label: const Text('Share result'),
            ),
          ],
        ],
      ),
    );
  }
}

class ImagesToPdfPage extends StatefulWidget {
  const ImagesToPdfPage({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<ImagesToPdfPage> createState() => _ImagesToPdfPageState();
}

class _ImagesToPdfPageState extends State<ImagesToPdfPage> {
  List<PlatformFile> _images = [];
  bool _busy = false;
  String? _result;

  Future<void> _pick() async {
    final value = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.image,
      withData: true,
    );
    if (value == null) return;
    setState(() {
      _images = value.files.where((file) => file.bytes != null).toList();
    });
  }

  Future<void> _create() async {
    if (_images.isEmpty) return;
    setState(() => _busy = true);
    try {
      final document = pw.Document();
      for (final image in _images) {
        final value = pw.MemoryImage(image.bytes!);
        document.addPage(
          pw.Page(
            build: (_) => pw.Center(
              child: pw.Image(value, fit: pw.BoxFit.contain),
            ),
          ),
        );
      }

      final directory = await getApplicationDocumentsDirectory();
      final path =
          '${directory.path}${Platform.pathSeparator}AJN-PDF-images-${DateTime.now().millisecondsSinceEpoch}.pdf';
      await File(path).writeAsBytes(await document.save(), flush: true);
      setState(() => _result = path);
      widget.onCompleted();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Images to PDF')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          FilledButton.icon(
            onPressed: _busy ? null : _pick,
            icon: const Icon(Icons.add_photo_alternate),
            label: const Text('Select images'),
          ),
          const SizedBox(height: 12),
          Text('${_images.length} image(s) selected'),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _busy || _images.isEmpty ? null : _create,
            child: Text(_busy ? 'Creating…' : 'Create PDF'),
          ),
          if (_result != null) ...[
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => OpenFilex.open(_result!),
              icon: const Icon(Icons.open_in_new),
              label: const Text('Open result'),
            ),
            OutlinedButton.icon(
              onPressed: () => shareFile(_result!),
              icon: const Icon(Icons.share),
              label: const Text('Share result'),
            ),
          ],
        ],
      ),
    );
  }
}

class PremiumPage extends StatelessWidget {
  const PremiumPage({super.key, required this.purchases});

  final PurchaseController purchases;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: purchases,
      builder: (context, _) {
        return Scaffold(
          appBar: AppBar(title: const Text('AJN PDF Premium')),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(
                purchases.premium
                    ? 'Premium is active'
                    : 'Remove ads and unlock higher limits',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Premium status is verified securely by the AJN PDF server and refreshed automatically.',
              ),
              const SizedBox(height: 20),
              if (Platform.isAndroid && purchases.products.isNotEmpty)
                ...purchases.products.map(
                  (product) => Card(
                    child: ListTile(
                      title: Text(product.title),
                      subtitle: Text(product.description),
                      trailing: FilledButton(
                        onPressed: purchases.premium
                            ? null
                            : () => purchases.buy(product.id),
                        child: Text(product.price),
                      ),
                    ),
                  ),
                )
              else
                FilledButton(
                  onPressed: () => launchUrl(
                    Uri.parse('${AppConfig.websiteUrl}/pricing'),
                    mode: LaunchMode.externalApplication,
                  ),
                  child: const Text('View web plans'),
                ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: purchases.restore,
                child: const Text('Restore purchases'),
              ),
              if (purchases.message != null) ...[
                const SizedBox(height: 16),
                Text(purchases.message!),
              ],
            ],
          ),
        );
      },
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({
    super.key,
    required this.ads,
    required this.purchases,
  });

  final AdsController ads;
  final PurchaseController purchases;

  @override
  Widget build(BuildContext context) {
    void complete() {
      ads.successfulOperation(premium: purchases.premium);
    }

    return AnimatedBuilder(
      animation: Listenable.merge([ads, purchases]),
      builder: (context, _) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('AJN PDF'),
            actions: [
              IconButton(
                tooltip: 'Privacy choices',
                onPressed: Platform.isAndroid ? ads.showPrivacyOptions : null,
                icon: const Icon(Icons.privacy_tip_outlined),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(28),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1D4ED8)],
                  ),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Private document tools',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Local where possible. Secure cloud processing only when required.',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _ToolCard(
                icon: Icons.call_merge,
                title: 'Merge PDF',
                subtitle: 'Combine multiple PDFs with validated secure processing.',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => MergePdfPage(onCompleted: complete),
                  ),
                ),
              ),
              _ToolCard(
                icon: Icons.photo_library,
                title: 'Images to PDF',
                subtitle: 'Create PDFs locally without uploading your images.',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ImagesToPdfPage(onCompleted: complete),
                  ),
                ),
              ),
              _ToolCard(
                icon: Icons.language,
                title: 'All web tools',
                subtitle: 'Open the complete AJN PDF toolbox.',
                onTap: () => launchUrl(
                  Uri.parse('${AppConfig.websiteUrl}/pdf-tools'),
                  mode: LaunchMode.externalApplication,
                ),
              ),
              _ToolCard(
                icon: Icons.workspace_premium,
                title: purchases.premium ? 'Premium active' : 'AJN PDF Premium',
                subtitle: 'No ads, higher limits and premium workflows.',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PremiumPage(purchases: purchases),
                  ),
                ),
              ),
              if (!purchases.premium &&
                  Platform.isAndroid &&
                  ads.banner != null)
                Padding(
                  padding: const EdgeInsets.only(top: 18),
                  child: Center(
                    child: SizedBox(
                      width: ads.banner!.size.width.toDouble(),
                      height: ads.banner!.size.height.toDouble(),
                      child: AdWidget(ad: ads.banner!),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _ToolCard extends StatelessWidget {
  const _ToolCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(child: Icon(icon)),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(minutes: 3),
    ),
  );
  final auth = AnonymousAuthService(dio);
  final purchases = PurchaseController(dio, auth);
  final ads = AdsController();

  await Future.wait([
    purchases.initialise(),
    ads.initialise(),
  ]);

  runApp(AjnPdfApp(ads: ads, purchases: purchases));
}

class AjnPdfApp extends StatelessWidget {
  const AjnPdfApp({
    super.key,
    required this.ads,
    required this.purchases,
  });

  final AdsController ads;
  final PurchaseController purchases;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AJN PDF',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1D4ED8)),
      ),
      home: HomePage(ads: ads, purchases: purchases),
    );
  }
}
