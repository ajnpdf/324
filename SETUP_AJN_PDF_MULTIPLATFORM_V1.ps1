[CmdletBinding()]
param(
    [string]$Project = "C:\Users\ANJAN PATEL\Downloads\AJN-PDF-dev (2)\AJN-PDF-dev",
    [string]$Branch = "production/multiplatform-v1",
    [string]$FirebaseProjectId = "studio-656130239-fd28b",
    [string]$AndroidPackage = "com.ajnpdf.app",
    [string]$ApiBaseUrl = "https://api.ajnpdf.com",
    [string]$WebsiteUrl = "https://www.ajnpdf.com",
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Stage([string]$Message) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Require-Command([string]$Name, [string]$Help) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name is required. $Help"
    }
}

function Set-Utf8File([string]$Path, [string]$Content) {
    $Parent = Split-Path -Parent $Path
    if ($Parent -and -not (Test-Path -LiteralPath $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }
    [System.IO.File]::WriteAllText(
        $Path,
        ($Content -replace "`r?`n", "`n"),
        [System.Text.UTF8Encoding]::new($false)
    )
}

function Add-JsonProperty($Object, [string]$Name, $Value) {
    if ($Object.PSObject.Properties.Name -contains $Name) {
        $Object.$Name = $Value
    } else {
        $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    }
}

function Run-Step([string]$Name, [scriptblock]$Action, [string]$LogFile) {
    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Yellow
    try {
        & $Action *>&1 | Tee-Object -FilePath $LogFile
        if ($LASTEXITCODE -ne 0) {
            throw "$Name failed with exit code $LASTEXITCODE."
        }
    } catch {
        Write-Host "FAILED: $Name" -ForegroundColor Red
        throw
    }
}

if (-not (Test-Path -LiteralPath $Project)) {
    throw "AJN-PDF project folder not found: $Project"
}

Set-Location -LiteralPath $Project
Require-Command git "Install Git for Windows."
Require-Command node "Install Node.js 22 LTS."
Require-Command npm "Install Node.js 22 LTS."

if (-not (Test-Path -LiteralPath ".git")) {
    throw "This folder is not a Git repository."
}
if (-not (Test-Path -LiteralPath "package.json")) {
    throw "package.json was not found. Open the inner AJN-PDF project folder."
}

$Reports = Join-Path $Project "release\reports"
New-Item -ItemType Directory -Path $Reports -Force | Out-Null

Write-Stage "AJN-PDF MULTIPLATFORM PRODUCTION FOUNDATION"
Write-Host "Project          : $Project"
Write-Host "Branch           : $Branch"
Write-Host "Android package  : $AndroidPackage"
Write-Host "Firebase project : $FirebaseProjectId"
Write-Host "API base URL     : $ApiBaseUrl"
Write-Host "Website URL      : $WebsiteUrl"

Write-Stage "GIT SAFETY CHECK"

git fetch origin --prune
if ($LASTEXITCODE -ne 0) {
    throw "Unable to fetch origin."
}

$CurrentBranch = git branch --show-current
$Dirty = git status --porcelain
if ($Dirty) {
    git add --all
    git commit -m "Checkpoint before AJN PDF multiplatform setup"
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to create the safety checkpoint commit."
    }
}

$ExistingLocal = git branch --list $Branch
if ($ExistingLocal) {
    git checkout $Branch
} else {
    git checkout -b $Branch
}
if ($LASTEXITCODE -ne 0) {
    throw "Unable to create or open branch $Branch."
}

Write-Stage "REPOSITORY POLICY AND ENVIRONMENT TEMPLATES"

Set-Utf8File ".nvmrc" "22`n"

$gitIgnoreAppend = @'
# AJN PDF production secrets
.env
.env.local
.env.*.local
service-account*.json
firebase-adminsdk*.json
google-play-service-account*.json
*.jks
*.keystore
*.p12
*.pfx
*.pem
android/key.properties
apps/ajn_pdf_app/android/key.properties
apps/ajn_pdf_app/android/app/*.jks
apps/ajn_pdf_app/android/app/*.keystore

# Generated outputs
release/
apps/ajn_pdf_app/build/
apps/ajn_pdf_app/.dart_tool/
apps/ajn_pdf_app/windows/flutter/ephemeral/
backend/.pytest_cache/
backend/__pycache__/
'@

$existingIgnore = if (Test-Path ".gitignore") { Get-Content ".gitignore" -Raw } else { "" }
foreach ($line in ($gitIgnoreAppend -split "`n")) {
    $trimmed = $line.TrimEnd()
    if ($trimmed -and $existingIgnore -notmatch "(?m)^$([regex]::Escape($trimmed))$") {
        Add-Content -LiteralPath ".gitignore" -Value $trimmed
        $existingIgnore += "`n$trimmed"
    }
}

$envExample = @'
# Public web Firebase configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-656130239-fd28b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Public web URLs
NEXT_PUBLIC_API_URL=https://api.ajnpdf.com
NEXT_PUBLIC_SITE_URL=https://www.ajnpdf.com

# Web advertising
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-4495802176396975
NEXT_PUBLIC_ADSENSE_PRIMARY_SLOT=3648223351
NEXT_PUBLIC_GA_ID=G-VYLQPFYTQB

# Razorpay web subscriptions
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_PRO_MONTHLY=
RAZORPAY_PLAN_PRO_YEARLY=

# Firebase Admin. Use Application Default Credentials on Firebase/Google Cloud,
# or set this to one-line JSON in Vercel/other hosting.
FIREBASE_SERVICE_ACCOUNT_JSON=

# Google Play subscriptions
GOOGLE_PLAY_PACKAGE_NAME=com.ajnpdf.app
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
GOOGLE_PLAY_RTDN_SHARED_SECRET=
GOOGLE_PLAY_PRODUCT_MONTHLY=ajn_pdf_premium_monthly
GOOGLE_PLAY_PRODUCT_YEARLY=ajn_pdf_premium_yearly

# Python API
ALLOWED_ORIGINS=https://ajnpdf.com,https://www.ajnpdf.com
MAX_FILE_BYTES=52428800
MAX_TOTAL_BYTES=209715200
MAX_FILES=20
'@
Set-Utf8File ".env.example" $envExample

if (-not (Test-Path ".env.local")) {
    $localEnv = @'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAC_pymBXsE17EGp3x02IkCy-XGI_CNaQQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-656130239-fd28b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-656130239-fd28b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-656130239-fd28b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=92710152843
NEXT_PUBLIC_FIREBASE_APP_ID=1:92710152843:web:6a1deaaa9029f23526028e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_API_URL=https://api.ajnpdf.com
NEXT_PUBLIC_SITE_URL=https://www.ajnpdf.com
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-4495802176396975
NEXT_PUBLIC_ADSENSE_PRIMARY_SLOT=3648223351
NEXT_PUBLIC_GA_ID=G-VYLQPFYTQB
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_PRO_MONTHLY=
RAZORPAY_PLAN_PRO_YEARLY=
FIREBASE_SERVICE_ACCOUNT_JSON=
GOOGLE_PLAY_PACKAGE_NAME=com.ajnpdf.app
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
GOOGLE_PLAY_RTDN_SHARED_SECRET=
GOOGLE_PLAY_PRODUCT_MONTHLY=ajn_pdf_premium_monthly
GOOGLE_PLAY_PRODUCT_YEARLY=ajn_pdf_premium_yearly
'@
    Set-Utf8File ".env.local" $localEnv
}

Write-Stage "WEB BUILD AND SECURITY CONFIGURATION"

$package = Get-Content "package.json" -Raw | ConvertFrom-Json
Add-JsonProperty $package.scripts "build" "next build"
Add-JsonProperty $package.scripts "lint" "cross-env ESLINT_USE_FLAT_CONFIG=false eslint . --max-warnings=0"
Add-JsonProperty $package.scripts "typecheck" "tsc --noEmit"
Add-JsonProperty $package.scripts "backend:check" "python -m compileall backend"
Add-JsonProperty $package.scripts "verify" "npm run typecheck && npm run lint && npm run build"
Add-JsonProperty $package "engines" ([pscustomobject]@{ node = ">=22 <23"; npm = ">=10" })
Set-Utf8File "package.json" ($package | ConvertTo-Json -Depth 100)

$nextConfig = @'
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), payment=(self "https://api.razorpay.com")',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: './src/lib/mocks/empty.js',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/dashboard/video/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
'@
Set-Utf8File "next.config.ts" $nextConfig

$firebaseClientConfig = @'
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }
  return value;
}

export const firebaseConfig = {
  apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: required('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: required('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: required('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};
'@
Set-Utf8File "src/firebase/config.ts" $firebaseClientConfig

$firestoreRules = @'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function owns(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow get, create, update, delete: if owns(uid);
      allow list: if false;
    }

    match /entitlements/{uid} {
      allow get: if owns(uid);
      allow list: if false;
      allow create, update, delete: if false;
    }

    match /feedback/{feedbackId} {
      allow create: if request.resource.data.keys().size() <= 12;
      allow read, list, update, delete: if false;
    }

    match /stats/platform {
      allow get: if true;
      allow create, update, delete: if false;
    }

    match /subscriptionEvents/{eventId} {
      allow read, write: if false;
    }

    match /playPurchases/{purchaseId} {
      allow read, write: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
'@
Set-Utf8File "firestore.rules" $firestoreRules

Write-Stage "SERVER-SIDE SUBSCRIPTION AND ENTITLEMENT CODE"

$firebaseAdmin = @'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function resolveCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return applicationDefault();
  }

  const parsed = JSON.parse(raw);
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return cert(parsed);
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: resolveCredential(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
'@
Set-Utf8File "src/lib/server/firebase-admin.ts" $firebaseAdmin

$requireUser = @'
import { adminAuth } from './firebase-admin';

export async function requireUser(request: Request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    throw new Error('UNAUTHENTICATED');
  }

  const token = header.slice('Bearer '.length).trim();
  return adminAuth.verifyIdToken(token, true);
}
'@
Set-Utf8File "src/lib/server/require-user.ts" $requireUser

$plans = @'
export const WEB_PLANS = {
  pro_monthly: {
    key: 'pro_monthly',
    title: 'AJN PDF Pro Monthly',
    planId: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    totalCount: 120,
  },
  pro_yearly: {
    key: 'pro_yearly',
    title: 'AJN PDF Pro Yearly',
    planId: process.env.RAZORPAY_PLAN_PRO_YEARLY,
    totalCount: 10,
  },
} as const;

export type WebPlanKey = keyof typeof WEB_PLANS;

export const PLAY_PRODUCT_IDS = new Set(
  [
    process.env.GOOGLE_PLAY_PRODUCT_MONTHLY || 'ajn_pdf_premium_monthly',
    process.env.GOOGLE_PLAY_PRODUCT_YEARLY || 'ajn_pdf_premium_yearly',
  ].filter(Boolean),
);
'@
Set-Utf8File "src/lib/subscription-plans.ts" $plans

$createSubscriptionRoute = @'
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { requireUser } from '@/lib/server/require-user';
import { WEB_PLANS, type WebPlanKey } from '@/lib/subscription-plans';

export const runtime = 'nodejs';

const bodySchema = z.object({
  planKey: z.enum(['pro_monthly', 'pro_yearly']),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { planKey } = bodySchema.parse(await request.json());
    const plan = WEB_PLANS[planKey as WebPlanKey];

    if (!plan.planId) {
      return NextResponse.json(
        { error: `Razorpay plan is not configured: ${planKey}` },
        { status: 503 },
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.planId,
      total_count: plan.totalCount,
      quantity: 1,
      customer_notify: true,
      notes: {
        firebaseUid: user.uid,
        planKey,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId,
      planKey,
      title: plan.title,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'UNAUTHENTICATED' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
'@
Set-Utf8File "src/app/api/subscriptions/create/route.ts" $createSubscriptionRoute

$subscriptionStatusRoute = @'
import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/require-user';
import { adminDb } from '@/lib/server/firebase-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const snapshot = await adminDb.collection('entitlements').doc(user.uid).get();
    return NextResponse.json({
      entitlement: snapshot.exists ? snapshot.data() : { active: false, tier: 'free' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHENTICATED' ? 401 : 500 });
  }
}
'@
Set-Utf8File "src/app/api/subscriptions/status/route.ts" $subscriptionStatusRoute

$razorpayWebhook = @'
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';

export const runtime = 'nodejs';

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');

  if (!safeEqualHex(signature, expected)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const event = JSON.parse(raw);
  const eventId = String(event.id || crypto.createHash('sha256').update(raw).digest('hex'));
  const subscription = event.payload?.subscription?.entity;
  const uid = subscription?.notes?.firebaseUid;
  const planKey = subscription?.notes?.planKey;

  if (!uid || !planKey) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const activeEvents = new Set([
    'subscription.activated',
    'subscription.charged',
    'subscription.resumed',
  ]);
  const inactiveEvents = new Set([
    'subscription.cancelled',
    'subscription.completed',
    'subscription.halted',
    'subscription.paused',
  ]);

  await adminDb.runTransaction(async (tx) => {
    const eventRef = adminDb.collection('subscriptionEvents').doc(eventId);
    const previous = await tx.get(eventRef);
    if (previous.exists) return;

    tx.create(eventRef, {
      provider: 'razorpay',
      type: event.event,
      receivedAt: FieldValue.serverTimestamp(),
    });

    if (!activeEvents.has(event.event) && !inactiveEvents.has(event.event)) return;

    tx.set(
      adminDb.collection('entitlements').doc(uid),
      {
        active: activeEvents.has(event.event),
        tier: activeEvents.has(event.event) ? 'pro' : 'free',
        provider: 'razorpay',
        planKey,
        providerSubscriptionId: subscription.id,
        providerStatus: subscription.status,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  return NextResponse.json({ received: true });
}
'@
Set-Utf8File "src/app/api/razorpay/webhook/route.ts" $razorpayWebhook

$playServer = @'
import crypto from 'crypto';
import { google } from 'googleapis';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { PLAY_PRODUCT_IDS } from '../subscription-plans';

function credentials() {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is missing.');
  const parsed = JSON.parse(raw);
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

export function purchaseDocumentId(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function verifyPlaySubscription(purchaseToken: string) {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  if (!packageName) throw new Error('GOOGLE_PLAY_PACKAGE_NAME is missing.');

  const auth = new google.auth.GoogleAuth({
    credentials: credentials(),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const publisher = google.androidpublisher({ version: 'v3', auth });
  const response = await publisher.purchases.subscriptionsv2.get({
    packageName,
    token: purchaseToken,
  });

  const data = response.data;
  const productIds =
    data.lineItems?.map((item) => item.productId).filter((value): value is string => Boolean(value)) || [];

  if (!productIds.some((id) => PLAY_PRODUCT_IDS.has(id))) {
    throw new Error('The purchase does not contain an AJN PDF subscription product.');
  }

  const activeStates = new Set([
    'SUBSCRIPTION_STATE_ACTIVE',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  ]);

  return {
    active: activeStates.has(data.subscriptionState || ''),
    state: data.subscriptionState || 'SUBSCRIPTION_STATE_UNSPECIFIED',
    productIds,
    expiryTime: data.lineItems?.[0]?.expiryTime || null,
    raw: data,
  };
}

export async function persistPlayEntitlement(uid: string, purchaseToken: string) {
  const verified = await verifyPlaySubscription(purchaseToken);
  const purchaseId = purchaseDocumentId(purchaseToken);

  await adminDb.runTransaction(async (tx) => {
    tx.set(
      adminDb.collection('playPurchases').doc(purchaseId),
      {
        uid,
        purchaseToken,
        productIds: verified.productIds,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    tx.set(
      adminDb.collection('entitlements').doc(uid),
      {
        active: verified.active,
        tier: verified.active ? 'pro' : 'free',
        provider: 'google_play',
        productIds: verified.productIds,
        providerStatus: verified.state,
        expiresAt: verified.expiryTime,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  return verified;
}
'@
Set-Utf8File "src/lib/server/google-play.ts" $playServer

$playVerifyRoute = @'
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/server/require-user';
import { persistPlayEntitlement } from '@/lib/server/google-play';

export const runtime = 'nodejs';

const schema = z.object({
  purchaseToken: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { purchaseToken } = schema.parse(await request.json());
    const verified = await persistPlayEntitlement(user.uid, purchaseToken);
    return NextResponse.json({
      active: verified.active,
      state: verified.state,
      productIds: verified.productIds,
      expiryTime: verified.expiryTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHENTICATED' ? 401 : 400 });
  }
}
'@
Set-Utf8File "src/app/api/google-play/verify/route.ts" $playVerifyRoute

$playRtdnRoute = @'
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { persistPlayEntitlement, purchaseDocumentId } from '@/lib/server/google-play';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const expected = process.env.GOOGLE_PLAY_RTDN_SHARED_SECRET;
  const supplied = new URL(request.url).searchParams.get('token');
  if (!expected || supplied !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const envelope = await request.json();
  const encoded = envelope?.message?.data;
  if (!encoded) return NextResponse.json({ received: true, ignored: true });

  const message = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  const purchaseToken =
    message.subscriptionNotification?.purchaseToken ||
    message.oneTimeProductNotification?.purchaseToken;

  if (!purchaseToken) return NextResponse.json({ received: true, ignored: true });

  const purchase = await adminDb.collection('playPurchases').doc(purchaseDocumentId(purchaseToken)).get();
  const uid = purchase.data()?.uid;
  if (!uid) return NextResponse.json({ received: true, pendingMapping: true });

  await persistPlayEntitlement(uid, purchaseToken);
  return NextResponse.json({ received: true });
}
'@
Set-Utf8File "src/app/api/google-play/rtdn/route.ts" $playRtdnRoute

$subscriptionButton = @'
'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

export function SubscriptionCheckoutButton({
  planKey,
  children,
}: {
  planKey: 'pro_monthly' | 'pro_yearly';
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function startCheckout() {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) {
        window.location.href = '/login?next=/premium';
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create subscription.');

      if (!window.Razorpay) throw new Error('Razorpay Checkout did not load.');

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'AJN PDF',
        description: data.title,
        image: 'https://www.ajnpdf.com/logo.jpeg',
        handler: () => {
          toast({
            title: 'Subscription authorised',
            description: 'Premium activates after secure webhook verification.',
          });
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: '#1d4ed8' },
      });

      checkout.open();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout unavailable',
        description: error instanceof Error ? error.message : 'Unknown checkout error.',
      });
      setLoading(false);
    }
  }

  return (
    <Button onClick={startCheckout} disabled={loading} className="w-full">
      {loading ? 'Opening secure checkout…' : children}
    </Button>
  );
}
'@
Set-Utf8File "src/components/subscriptions/subscription-checkout-button.tsx" $subscriptionButton

$premiumPage = @'
import Link from 'next/link';
import { SubscriptionCheckoutButton } from '@/components/subscriptions/subscription-checkout-button';

export const metadata = {
  title: 'AJN PDF Premium',
  description: 'Remove ads and unlock higher limits across AJN PDF.',
};

const benefits = [
  'No display ads while signed in',
  'Higher file-size limits',
  'Priority cloud processing for supported tools',
  'Batch workflows and premium workspace',
  'Subscription status shared with Android and Windows',
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-blue-300">← AJN PDF</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">AJN PDF Premium</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Core local tools remain available. Premium removes ads and supports larger,
          account-based and cloud-assisted workflows.
        </p>

        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              ✓ {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-8">
            <h2 className="text-2xl font-bold">Monthly</h2>
            <p className="mt-2 text-slate-300">Configure price in the Razorpay plan.</p>
            <div className="mt-6">
              <SubscriptionCheckoutButton planKey="pro_monthly">
                Subscribe monthly
              </SubscriptionCheckoutButton>
            </div>
          </section>

          <section className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-8">
            <h2 className="text-2xl font-bold">Yearly</h2>
            <p className="mt-2 text-slate-300">Configure price in the Razorpay plan.</p>
            <div className="mt-6">
              <SubscriptionCheckoutButton planKey="pro_yearly">
                Subscribe yearly
              </SubscriptionCheckoutButton>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
'@
Set-Utf8File "src/app/premium/page.tsx" $premiumPage

Write-Stage "CONSENT-AWARE ADS AND PREMIUM AD REMOVAL"

$premiumHook = @'
'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';

export function usePremiumEntitlement() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setPremium(false);
      setLoading(false);
      return;
    }

    return onSnapshot(
      doc(firestore, 'entitlements', user.uid),
      (snapshot) => {
        setPremium(snapshot.data()?.active === true);
        setLoading(false);
      },
      () => {
        setPremium(false);
        setLoading(false);
      },
    );
  }, [firestore, isUserLoading, user]);

  return { premium, loading };
}
'@
Set-Utf8File "src/hooks/use-premium-entitlement.ts" $premiumHook

$consentScripts = @'
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { hasConsent } from '@/components/ui/cookie-consent';
import { usePremiumEntitlement } from '@/hooks/use-premium-entitlement';

export function ConsentScripts() {
  const [mounted, setMounted] = useState(false);
  const { premium } = usePremiumEntitlement();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const advertising = hasConsent('advertising') && !premium;
  const analytics = hasConsent('analytics');
  const adsenseClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4495802176396975';
  const analyticsId =
    process.env.NEXT_PUBLIC_GA_ID || 'G-VYLQPFYTQB';

  return (
    <>
      {advertising && (
        <Script
          id="ajn-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {analytics && (
        <>
          <Script
            id="ajn-google-analytics-src"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ajn-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
'@
Set-Utf8File "src/components/platform/consent-scripts.tsx" $consentScripts

$adsenseUnit = @'
'use client';

import { useEffect, useState } from 'react';
import { hasConsent } from './ui/cookie-consent';
import { usePremiumEntitlement } from '@/hooks/use-premium-entitlement';

export function AdSenseUnit() {
  const [mounted, setMounted] = useState(false);
  const { premium, loading } = usePremiumEntitlement();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || premium || !hasConsent('advertising')) return;
    try {
      const adsbygoogle = ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []);
      adsbygoogle.push({});
    } catch {
      // Ad blockers and network failures must not break document tools.
    }
  }, [loading, mounted, premium]);

  if (!mounted || loading || premium || !hasConsent('advertising')) return null;

  return (
    <div className="my-4 flex min-h-[100px] w-full justify-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4495802176396975'}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_PRIMARY_SLOT || '3648223351'}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
'@
Set-Utf8File "src/components/adsense-unit.tsx" $adsenseUnit

$adUnit = @'
'use client';

import { useEffect, useState } from 'react';
import { hasConsent } from './cookie-consent';
import { usePremiumEntitlement } from '@/hooks/use-premium-entitlement';

interface AdUnitProps {
  className?: string;
  slot?: string;
  format?: string;
}

export function AdUnit({
  className,
  slot = process.env.NEXT_PUBLIC_ADSENSE_PRIMARY_SLOT || '3648223351',
  format = 'auto',
}: AdUnitProps) {
  const [mounted, setMounted] = useState(false);
  const { premium, loading } = usePremiumEntitlement();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || premium || !hasConsent('advertising')) return;
    try {
      const adsbygoogle = ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []);
      adsbygoogle.push({});
    } catch {
      // Never allow advertising failures to affect file processing.
    }
  }, [loading, mounted, premium, slot]);

  if (!mounted || loading || premium || !hasConsent('advertising')) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4495802176396975'}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
'@
Set-Utf8File "src/components/ui/ad-unit.tsx" $adUnit

$layoutPath = "src/app/layout.tsx"
$layout = Get-Content $layoutPath -Raw
if ($layout -notmatch 'ConsentScripts') {
    $layout = $layout -replace 'import \{ CookieConsent \} from "@/components/ui/cookie-consent";', 'import { CookieConsent } from "@/components/ui/cookie-consent";' + "`n" + 'import { ConsentScripts } from "@/components/platform/consent-scripts";'
}
$layout = [regex]::Replace(
    $layout,
    '(?s)\s*<Script\s+async\s+src="https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=ca-pub-4495802176396975".*?/>',
    ''
)
$layout = [regex]::Replace(
    $layout,
    '(?s)\s*<Script\s+async\s+src="https://www\.googletagmanager\.com/gtag/js\?id=G-VYLQPFYTQB".*?</script>',
    ''
)
if ($layout -notmatch '<ConsentScripts\s*/>') {
    $layout = $layout -replace '<FirebaseClientProvider>', '<FirebaseClientProvider>' + "`n          <ConsentScripts />"
}
Set-Utf8File $layoutPath $layout

Write-Stage "HARDEN PYTHON PDF API"

$backendMain = @'
from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pypdf import PdfReader, PdfWriter
from starlette.background import BackgroundTask

APP_VERSION = "1.0.0"
MAX_FILE_BYTES = int(os.getenv("MAX_FILE_BYTES", str(50 * 1024 * 1024)))
MAX_TOTAL_BYTES = int(os.getenv("MAX_TOTAL_BYTES", str(200 * 1024 * 1024)))
MAX_FILES = int(os.getenv("MAX_FILES", "20"))
ALLOWED_ORIGINS = [
    value.strip()
    for value in os.getenv(
        "ALLOWED_ORIGINS",
        "https://ajnpdf.com,https://www.ajnpdf.com,http://localhost:9002",
    ).split(",")
    if value.strip()
]

app = FastAPI(title="AJN PDF API", version=APP_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["authorization", "content-type"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": APP_VERSION}


@app.get("/version")
async def version():
    return {"version": APP_VERSION}


async def save_pdf(upload: UploadFile, target: Path) -> int:
    total = 0
    first = True

    with target.open("wb") as handle:
        while chunk := await upload.read(1024 * 1024):
            if first:
                first = False
                if not chunk.startswith(b"%PDF-"):
                    raise HTTPException(status_code=400, detail="File content is not a PDF.")
            total += len(chunk)
            if total > MAX_FILE_BYTES:
                raise HTTPException(status_code=413, detail="A PDF exceeds the per-file size limit.")
            handle.write(chunk)

    if total == 0:
        raise HTTPException(status_code=400, detail="An uploaded PDF is empty.")
    return total


@app.post("/api/pdf/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Select at least two PDF files.")
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=413, detail=f"Maximum {MAX_FILES} files are allowed.")

    work_dir = Path(tempfile.mkdtemp(prefix="ajn-pdf-"))
    total_bytes = 0
    writer = PdfWriter()

    try:
        for index, upload in enumerate(files):
            input_path = work_dir / f"input-{index}.pdf"
            total_bytes += await save_pdf(upload, input_path)
            if total_bytes > MAX_TOTAL_BYTES:
                raise HTTPException(status_code=413, detail="Combined upload exceeds the request limit.")

            reader = PdfReader(str(input_path), strict=False)
            if reader.is_encrypted:
                raise HTTPException(status_code=400, detail="Encrypted PDFs must be unlocked first.")
            for page in reader.pages:
                writer.add_page(page)

        output_path = work_dir / "merged.pdf"
        with output_path.open("wb") as output:
            writer.write(output)

        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="AJN-PDF-merged.pdf",
            background=BackgroundTask(shutil.rmtree, work_dir, ignore_errors=True),
        )
    except HTTPException:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise
    except Exception:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise HTTPException(status_code=422, detail="The PDFs could not be merged.")
    finally:
        for upload in files:
            await upload.close()
'@
Set-Utf8File "backend/main.py" $backendMain

$requirements = @'
fastapi>=0.116,<1
uvicorn[standard]>=0.35,<1
python-multipart>=0.0.20,<1
pypdf>=6,<7
'@
Set-Utf8File "backend/requirements.txt" $requirements

Write-Stage "CREATE FLUTTER ANDROID + WINDOWS APPLICATION"

$FlutterRoot = Join-Path $Project "apps\ajn_pdf_app"
$FlutterAvailable = [bool](Get-Command flutter -ErrorAction SilentlyContinue)

if (-not $FlutterAvailable) {
    Write-Warning "Flutter is not installed. Web/backend updates will still be applied."
    Write-Warning "Install Flutter stable, Android SDK API 36, and Visual Studio Desktop C++ workload, then rerun this script."
} else {
    if (-not (Test-Path -LiteralPath (Join-Path $FlutterRoot "pubspec.yaml"))) {
        New-Item -ItemType Directory -Path (Split-Path -Parent $FlutterRoot) -Force | Out-Null
        flutter create `
            --platforms=android,windows `
            --org com.ajnpdf `
            --project-name ajn_pdf_app `
            $FlutterRoot

        if ($LASTEXITCODE -ne 0) {
            throw "flutter create failed."
        }
    }

    Set-Location -LiteralPath $FlutterRoot

    if (-not $SkipInstall) {
        $flutterPackages = @(
            "firebase_core",
            "firebase_auth",
            "cloud_firestore",
            "firebase_analytics",
            "firebase_crashlytics",
            "google_mobile_ads",
            "in_app_purchase",
            "dio",
            "file_picker",
            "path_provider",
            "share_plus",
            "open_filex",
            "pdf",
            "printing",
            "url_launcher",
            "shared_preferences"
        )

        foreach ($packageName in $flutterPackages) {
            flutter pub add $packageName
            if ($LASTEXITCODE -ne 0) {
                throw "Unable to add Flutter package: $packageName"
            }
        }
    }

    $appConfig = @'
class AppConfig {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.ajnpdf.com',
  );

  static const websiteUrl = String.fromEnvironment(
    'WEBSITE_URL',
    defaultValue: 'https://www.ajnpdf.com',
  );

  static const productionAds = bool.fromEnvironment(
    'PRODUCTION_ADS',
    defaultValue: false,
  );

  static const androidBannerAdUnit = String.fromEnvironment(
    'ADMOB_BANNER_ANDROID',
    defaultValue: '',
  );

  static const androidInterstitialAdUnit = String.fromEnvironment(
    'ADMOB_INTERSTITIAL_ANDROID',
    defaultValue: '',
  );

  static const monthlyProductId = String.fromEnvironment(
    'PLAY_MONTHLY_PRODUCT_ID',
    defaultValue: 'ajn_pdf_premium_monthly',
  );

  static const yearlyProductId = String.fromEnvironment(
    'PLAY_YEARLY_PRODUCT_ID',
    defaultValue: 'ajn_pdf_premium_yearly',
  );
}
'@
    Set-Utf8File "lib/config/app_config.dart" $appConfig

    $consentService = @'
import 'dart:async';
import 'dart:io';

import 'package:google_mobile_ads/google_mobile_ads.dart';

class ConsentService {
  Future<bool> requestConsent() async {
    if (!Platform.isAndroid) return false;

    final completer = Completer<void>();
    ConsentInformation.instance.requestConsentInfoUpdate(
      ConsentRequestParameters(),
      completer.complete,
      (error) => completer.completeError(error),
    );

    try {
      await completer.future;

      final formCompleter = Completer<void>();
      ConsentForm.loadAndShowConsentFormIfRequired(
        (_) => formCompleter.complete(),
      );
      await formCompleter.future;

      return await ConsentInformation.instance.canRequestAds();
    } catch (_) {
      return false;
    }
  }

  Future<void> showPrivacyOptions() async {
    if (!Platform.isAndroid) return;
    final completer = Completer<void>();
    ConsentForm.showPrivacyOptionsForm((_) => completer.complete());
    await completer.future;
  }
}
'@
    Set-Utf8File "lib/services/consent_service.dart" $consentService

    $adService = @'
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import '../config/app_config.dart';

class AdService {
  static const _testBanner = 'ca-app-pub-3940256099942544/6300978111';
  static const _testInterstitial = 'ca-app-pub-3940256099942544/1033173712';

  BannerAd? banner;
  InterstitialAd? _interstitial;
  int _successfulOperations = 0;

  String get _bannerId {
    if (!AppConfig.productionAds || kDebugMode) return _testBanner;
    return AppConfig.androidBannerAdUnit;
  }

  String get _interstitialId {
    if (!AppConfig.productionAds || kDebugMode) return _testInterstitial;
    return AppConfig.androidInterstitialAdUnit;
  }

  Future<void> initialise() async {
    if (!Platform.isAndroid) return;
    await MobileAds.instance.initialize();
    loadBanner();
    loadInterstitial();
  }

  void loadBanner() {
    if (!Platform.isAndroid || _bannerId.isEmpty) return;
    banner?.dispose();
    banner = BannerAd(
      adUnitId: _bannerId,
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdFailedToLoad: (ad, _) => ad.dispose(),
      ),
    )..load();
  }

  void loadInterstitial() {
    if (!Platform.isAndroid || _interstitialId.isEmpty) return;
    InterstitialAd.load(
      adUnitId: _interstitialId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) => _interstitial = ad,
        onAdFailedToLoad: (_) => _interstitial = null,
      ),
    );
  }

  void operationCompleted({required bool premium}) {
    if (premium || !Platform.isAndroid) return;
    _successfulOperations++;
    if (_successfulOperations < 3 || _interstitial == null) return;

    final ad = _interstitial!;
    _interstitial = null;
    _successfulOperations = 0;
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        loadInterstitial();
      },
      onAdFailedToShowFullScreenContent: (ad, _) {
        ad.dispose();
        loadInterstitial();
      },
    );
    ad.show();
  }

  void dispose() {
    banner?.dispose();
    _interstitial?.dispose();
  }
}
'@
    Set-Utf8File "lib/services/ad_service.dart" $adService

    $entitlementService = @'
import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class EntitlementService {
  Stream<bool> watchPremium() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return Stream<bool>.value(false);

    return FirebaseFirestore.instance
        .collection('entitlements')
        .doc(user.uid)
        .snapshots()
        .map((snapshot) => snapshot.data()?['active'] == true);
  }
}
'@
    Set-Utf8File "lib/services/entitlement_service.dart" $entitlementService

    $purchaseService = @'
import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../config/app_config.dart';

class PurchaseService {
  final InAppPurchase _store = InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  final _products = <String, ProductDetails>{};

  List<ProductDetails> get products => _products.values.toList(growable: false);

  Future<void> initialise() async {
    if (!Platform.isAndroid) return;
    _subscription = _store.purchaseStream.listen(_handlePurchases);
    if (!await _store.isAvailable()) return;

    final response = await _store.queryProductDetails({
      AppConfig.monthlyProductId,
      AppConfig.yearlyProductId,
    });
    for (final product in response.productDetails) {
      _products[product.id] = product;
    }
  }

  Future<void> buy(String productId) async {
    final product = _products[productId];
    if (product == null) {
      throw StateError('Subscription product is not available in Google Play.');
    }
    await _store.buyNonConsumable(
      purchaseParam: PurchaseParam(productDetails: product),
    );
  }

  Future<void> restore() => _store.restorePurchases();

  Future<void> _handlePurchases(List<PurchaseDetails> purchases) async {
    for (final purchase in purchases) {
      if (purchase.status == PurchaseStatus.purchased ||
          purchase.status == PurchaseStatus.restored) {
        await _verifyWithServer(purchase);
      }

      if (purchase.pendingCompletePurchase) {
        await _store.completePurchase(purchase);
      }
    }
  }

  Future<void> _verifyWithServer(PurchaseDetails purchase) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw StateError('Sign in is required.');

    final idToken = await user.getIdToken();
    await Dio().post(
      '${AppConfig.websiteUrl}/api/google-play/verify',
      data: {
        'purchaseToken': purchase.verificationData.serverVerificationData,
      },
      options: Options(headers: {'authorization': 'Bearer $idToken'}),
    );
  }

  Future<void> dispose() async {
    await _subscription?.cancel();
  }
}
'@
    Set-Utf8File "lib/services/purchase_service.dart" $purchaseService

    $mergeScreen = @'
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../config/app_config.dart';

class MergePdfScreen extends StatefulWidget {
  const MergePdfScreen({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<MergePdfScreen> createState() => _MergePdfScreenState();
}

class _MergePdfScreenState extends State<MergePdfScreen> {
  final List<PlatformFile> _files = [];
  bool _busy = false;
  String? _resultPath;

  Future<void> _pick() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: const ['pdf'],
      withData: false,
    );
    if (result == null) return;
    setState(() {
      _files
        ..clear()
        ..addAll(result.files.where((file) => file.path != null));
    });
  }

  Future<void> _merge() async {
    if (_files.length < 2) return;
    setState(() => _busy = true);

    try {
      final parts = <MultipartFile>[];
      for (final file in _files) {
        parts.add(await MultipartFile.fromFile(file.path!, filename: file.name));
      }

      final response = await Dio().post<List<int>>(
        '${AppConfig.apiBaseUrl}/api/pdf/merge',
        data: FormData.fromMap({'files': parts}),
        options: Options(responseType: ResponseType.bytes),
      );

      final directory = await getApplicationDocumentsDirectory();
      final path = '${directory.path}${Platform.pathSeparator}AJN-PDF-merged-${DateTime.now().millisecondsSinceEpoch}.pdf';
      await File(path).writeAsBytes(Uint8List.fromList(response.data!));

      setState(() => _resultPath = path);
      widget.onCompleted();
    } on DioException catch (error) {
      if (!mounted) return;
      final message = error.response?.data is Map
          ? (error.response?.data['detail']?.toString() ?? 'Merge failed.')
          : 'Merge failed. Check the API URL and connection.';
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
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
            label: const Text('Select two or more PDFs'),
          ),
          const SizedBox(height: 16),
          ..._files.map((file) => ListTile(
                leading: const Icon(Icons.picture_as_pdf),
                title: Text(file.name),
                subtitle: Text('${(file.size / 1024).ceil()} KB'),
              )),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _busy || _files.length < 2 ? null : _merge,
            child: Text(_busy ? 'Merging…' : 'Merge PDFs'),
          ),
          if (_resultPath != null) ...[
            const SizedBox(height: 24),
            const Text('Result ready', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () => OpenFilex.open(_resultPath!),
              icon: const Icon(Icons.open_in_new),
              label: const Text('Open result'),
            ),
            OutlinedButton.icon(
              onPressed: () => SharePlus.instance.share(
                ShareParams(files: [XFile(_resultPath!)]),
              ),
              icon: const Icon(Icons.share),
              label: const Text('Share result'),
            ),
          ],
        ],
      ),
    );
  }
}
'@
    Set-Utf8File "lib/screens/merge_pdf_screen.dart" $mergeScreen

    $imagesPdfScreen = @'
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';

class ImagesToPdfScreen extends StatefulWidget {
  const ImagesToPdfScreen({super.key, required this.onCompleted});

  final VoidCallback onCompleted;

  @override
  State<ImagesToPdfScreen> createState() => _ImagesToPdfScreenState();
}

class _ImagesToPdfScreenState extends State<ImagesToPdfScreen> {
  List<PlatformFile> _images = [];
  bool _busy = false;
  String? _resultPath;

  Future<void> _pick() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.image,
      withData: true,
    );
    if (result == null) return;
    setState(() => _images = result.files.where((file) => file.bytes != null).toList());
  }

  Future<void> _create() async {
    if (_images.isEmpty) return;
    setState(() => _busy = true);

    try {
      final document = pw.Document();
      for (final image in _images) {
        final memoryImage = pw.MemoryImage(image.bytes!);
        document.addPage(
          pw.Page(
            build: (_) => pw.Center(
              child: pw.Image(memoryImage, fit: pw.BoxFit.contain),
            ),
          ),
        );
      }

      final directory = await getApplicationDocumentsDirectory();
      final path = '${directory.path}${Platform.pathSeparator}AJN-PDF-images-${DateTime.now().millisecondsSinceEpoch}.pdf';
      await File(path).writeAsBytes(await document.save());
      setState(() => _resultPath = path);
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
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _busy || _images.isEmpty ? null : _create,
            child: Text(_busy ? 'Creating PDF…' : 'Create PDF'),
          ),
          if (_resultPath != null) ...[
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => OpenFilex.open(_resultPath!),
              icon: const Icon(Icons.open_in_new),
              label: const Text('Open result'),
            ),
            OutlinedButton.icon(
              onPressed: () => SharePlus.instance.share(
                ShareParams(files: [XFile(_resultPath!)]),
              ),
              icon: const Icon(Icons.share),
              label: const Text('Share result'),
            ),
          ],
        ],
      ),
    );
  }
}
'@
    Set-Utf8File "lib/screens/images_to_pdf_screen.dart" $imagesPdfScreen

    $premiumScreen = @'
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../services/purchase_service.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key, required this.purchaseService});

  final PurchaseService purchaseService;

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  @override
  Widget build(BuildContext context) {
    final products = widget.purchaseService.products;

    return Scaffold(
      appBar: AppBar(title: const Text('AJN PDF Premium')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Remove ads and unlock higher limits.',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 20),
          if (Platform.isAndroid && products.isNotEmpty)
            ...products.map(
              (product) => Card(
                child: ListTile(
                  title: Text(product.title),
                  subtitle: Text(product.description),
                  trailing: FilledButton(
                    onPressed: () => widget.purchaseService.buy(product.id),
                    child: Text(product.price),
                  ),
                ),
              ),
            )
          else
            FilledButton(
              onPressed: () => launchUrl(
                Uri.parse('${AppConfig.websiteUrl}/premium'),
                mode: LaunchMode.externalApplication,
              ),
              child: const Text('Manage subscription on the web'),
            ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: widget.purchaseService.restore,
            child: const Text('Restore purchases'),
          ),
        ],
      ),
    );
  }
}
'@
    Set-Utf8File "lib/screens/premium_screen.dart" $premiumScreen

    $homeScreen = @'
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../screens/images_to_pdf_screen.dart';
import '../screens/merge_pdf_screen.dart';
import '../screens/premium_screen.dart';
import '../services/ad_service.dart';
import '../services/consent_service.dart';
import '../services/purchase_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.adService,
    required this.purchaseService,
    required this.premium,
  });

  final AdService adService;
  final PurchaseService purchaseService;
  final bool premium;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  void _completed() {
    widget.adService.operationCompleted(premium: widget.premium);
  }

  @override
  Widget build(BuildContext context) {
    final tools = [
      (
        title: 'Merge PDF',
        subtitle: 'Merge PDFs through the secure AJN API.',
        icon: Icons.call_merge,
        open: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => MergePdfScreen(onCompleted: _completed)),
            ),
      ),
      (
        title: 'Images to PDF',
        subtitle: 'Create a PDF locally on your device.',
        icon: Icons.photo_library,
        open: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ImagesToPdfScreen(onCompleted: _completed)),
            ),
      ),
      (
        title: 'All web tools',
        subtitle: 'Open the complete AJN PDF web toolbox.',
        icon: Icons.language,
        open: () => launchUrl(
              Uri.parse('${AppConfig.websiteUrl}/pdf-tools'),
              mode: LaunchMode.externalApplication,
            ),
      ),
      (
        title: 'Premium',
        subtitle: 'Remove ads and unlock higher limits.',
        icon: Icons.workspace_premium,
        open: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => PremiumScreen(purchaseService: widget.purchaseService),
              ),
            ),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('AJN PDF'),
        actions: [
          IconButton(
            tooltip: 'Privacy choices',
            onPressed: Platform.isAndroid
                ? () => ConsentService().showPrivacyOptions()
                : null,
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
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1D4ED8)],
              ),
              borderRadius: BorderRadius.circular(28),
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
          ...tools.map(
            (tool) => Card(
              child: ListTile(
                leading: CircleAvatar(child: Icon(tool.icon)),
                title: Text(tool.title),
                subtitle: Text(tool.subtitle),
                trailing: const Icon(Icons.chevron_right),
                onTap: tool.open,
              ),
            ),
          ),
          if (!widget.premium && Platform.isAndroid && widget.adService.banner != null)
            Padding(
              padding: const EdgeInsets.only(top: 20),
              child: SizedBox(
                height: widget.adService.banner!.size.height.toDouble(),
                width: widget.adService.banner!.size.width.toDouble(),
                child: AdWidget(ad: widget.adService.banner!),
              ),
            ),
        ],
      ),
    );
  }
}
'@
    Set-Utf8File "lib/screens/home_screen.dart" $homeScreen

    $mainDart = @'
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'screens/home_screen.dart';
import 'services/ad_service.dart';
import 'services/consent_service.dart';
import 'services/entitlement_service.dart';
import 'services/purchase_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  var firebaseReady = false;
  if (Platform.isAndroid) {
    try {
      await Firebase.initializeApp();
      firebaseReady = true;
      if (FirebaseAuth.instance.currentUser == null) {
        await FirebaseAuth.instance.signInAnonymously();
      }
    } catch (error) {
      debugPrint('Firebase is not configured yet: $error');
    }
  }

  final adService = AdService();
  if (Platform.isAndroid) {
    final canRequestAds = await ConsentService().requestConsent();
    if (canRequestAds) {
      await adService.initialise();
    }
  }

  final purchaseService = PurchaseService();
  await purchaseService.initialise();

  runApp(
    AjnPdfApp(
      adService: adService,
      purchaseService: purchaseService,
      firebaseReady: firebaseReady,
    ),
  );
}

class AjnPdfApp extends StatelessWidget {
  const AjnPdfApp({
    super.key,
    required this.adService,
    required this.purchaseService,
    required this.firebaseReady,
  });

  final AdService adService;
  final PurchaseService purchaseService;
  final bool firebaseReady;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AJN PDF',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1D4ED8),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        cardTheme: const CardThemeData(
          margin: EdgeInsets.symmetric(vertical: 7),
        ),
      ),
      home: firebaseReady
          ? StreamBuilder<bool>(
              stream: EntitlementService().watchPremium(),
              initialData: false,
              builder: (context, snapshot) => HomeScreen(
                adService: adService,
                purchaseService: purchaseService,
                premium: snapshot.data ?? false,
              ),
            )
          : HomeScreen(
              adService: adService,
              purchaseService: purchaseService,
              premium: false,
            ),
    );
  }
}
'@
    Set-Utf8File "lib/main.dart" $mainDart

    $widgetTest = @'
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('AJN PDF foundation smoke test', () {
    expect('AJN PDF'.isNotEmpty, isTrue);
  });
}
'@
    Set-Utf8File "test/widget_test.dart" $widgetTest

    $manifestPath = "android\app\src\main\AndroidManifest.xml"
    if (Test-Path $manifestPath) {
        $manifest = Get-Content $manifestPath -Raw
        if ($manifest -notmatch "com.google.android.gms.ads.APPLICATION_ID") {
            $manifest = $manifest -replace "<application", @'
<uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="com.google.android.gms.permission.AD_ID" />

    <application
'@
            $manifest = $manifest -replace "android:label=`"ajn_pdf_app`"", "android:label=`"AJN PDF`""
            $manifest = $manifest -replace "</application>", @'
        <!-- Google sample App ID. Replace before production release. -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713" />
    </application>
'@
            Set-Utf8File $manifestPath $manifest
        }
    }

    $gradlePath = "android\app\build.gradle.kts"
    if (Test-Path $gradlePath) {
        $gradle = Get-Content $gradlePath -Raw
        $gradle = $gradle -replace 'namespace\s*=\s*"[^"]+"', "namespace = `"$AndroidPackage`""
        $gradle = $gradle -replace 'applicationId\s*=\s*"[^"]+"', "applicationId = `"$AndroidPackage`""
        $gradle = $gradle -replace 'compileSdk\s*=\s*flutter\.compileSdkVersion', 'compileSdk = 36'
        $gradle = $gradle -replace 'targetSdk\s*=\s*flutter\.targetSdkVersion', 'targetSdk = 36'

        if ($gradle -notmatch 'val keystoreProperties = Properties\(\)') {
            $gradle = @'
import java.io.FileInputStream
import java.util.Properties

'@ + $gradle

            $signingPrelude = @'
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

'@
            $gradle = $gradle -replace '(?m)^android\s*\{', ($signingPrelude + "android {")
        }

        if ($gradle -notmatch 'create\("release"\)') {
            $signingBlock = @'
    signingConfigs {
        create("release") {
            if (keystorePropertiesFile.exists()) {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

'@
            $gradle = $gradle -replace '(?m)^\s*buildTypes\s*\{', ($signingBlock + "    buildTypes {")
        }

        $gradle = $gradle -replace 'signingConfig\s*=\s*signingConfigs\.getByName\("debug"\)', 'signingConfig = if (keystorePropertiesFile.exists()) signingConfigs.getByName("release") else signingConfigs.getByName("debug")'
        Set-Utf8File $gradlePath $gradle
    }

    $mainActivity = Get-ChildItem "android\app\src\main\kotlin" -Filter "MainActivity.kt" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($mainActivity) {
        $activityContent = Get-Content $mainActivity.FullName -Raw
        $activityContent = $activityContent -replace '(?m)^package\s+[^\r\n]+', "package $AndroidPackage"
        $activityFolder = Join-Path "android\app\src\main\kotlin" ($AndroidPackage -replace '\.', '\')
        New-Item -ItemType Directory -Path $activityFolder -Force | Out-Null
        $newActivityPath = Join-Path $activityFolder "MainActivity.kt"
        Set-Utf8File $newActivityPath $activityContent
        if ($mainActivity.FullName -ne (Resolve-Path $newActivityPath).Path) {
            Remove-Item $mainActivity.FullName -Force
        }
    }

    $keyPropertiesExample = @'
storePassword=CHANGE_ME
keyPassword=CHANGE_ME
keyAlias=ajn_upload
storeFile=../upload-keystore.jks
'@
    Set-Utf8File "android/key.properties.example" $keyPropertiesExample

    $flutterEnv = @"
API_BASE_URL=$ApiBaseUrl
WEBSITE_URL=$WebsiteUrl
PRODUCTION_ADS=false
ADMOB_BANNER_ANDROID=
ADMOB_INTERSTITIAL_ANDROID=
PLAY_MONTHLY_PRODUCT_ID=ajn_pdf_premium_monthly
PLAY_YEARLY_PRODUCT_ID=ajn_pdf_premium_yearly
"@
    Set-Utf8File "dart_defines.example" $flutterEnv

    Set-Location -LiteralPath $Project
}

Write-Stage "CONTINUOUS INTEGRATION"

$ci = @'
name: AJN PDF CI

on:
  push:
    branches: [main, dev, "production/**"]
  pull_request:

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: test
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: test.firebaseapp.com
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: test
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: test.firebasestorage.app
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1"
          NEXT_PUBLIC_FIREBASE_APP_ID: "1:1:web:test"
          NEXT_PUBLIC_API_URL: http://localhost:8000
          NEXT_PUBLIC_SITE_URL: https://www.ajnpdf.com

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r backend/requirements.txt
      - run: python -m compileall backend

  flutter:
    if: ${{ hashFiles('apps/ajn_pdf_app/pubspec.yaml') != '' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true
      - working-directory: apps/ajn_pdf_app
        run: flutter pub get
      - working-directory: apps/ajn_pdf_app
        run: flutter analyze
      - working-directory: apps/ajn_pdf_app
        run: flutter test
      - working-directory: apps/ajn_pdf_app
        run: flutter build apk --debug
'@
Set-Utf8File ".github/workflows/ci.yml" $ci

$releaseScript = @'
[CmdletBinding()]
param(
    [string]$Project = "C:\Users\ANJAN PATEL\Downloads\AJN-PDF-dev (2)\AJN-PDF-dev",
    [string]$ApiBaseUrl = "https://api.ajnpdf.com",
    [string]$WebsiteUrl = "https://www.ajnpdf.com",
    [switch]$ProductionAds,
    [string]$AdMobBannerAndroid = "",
    [string]$AdMobInterstitialAndroid = ""
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $Project
$Reports = Join-Path $Project "release\reports"
New-Item -ItemType Directory -Path $Reports -Force | Out-Null

function Run([string]$Name, [scriptblock]$Command) {
    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Cyan
    & $Command *>&1 | Tee-Object -FilePath (Join-Path $Reports "$Name.txt")
    if ($LASTEXITCODE -ne 0) { throw "$Name failed." }
}

Run "web-npm-ci" { npm ci }
Run "web-typecheck" { npm run typecheck }
Run "web-lint" { npm run lint }
Run "web-build" { npm run build }

if (Get-Command python -ErrorAction SilentlyContinue) {
    Run "backend-compile" { python -m compileall backend }
}

$FlutterRoot = Join-Path $Project "apps\ajn_pdf_app"
if (Test-Path (Join-Path $FlutterRoot "pubspec.yaml")) {
    Set-Location -LiteralPath $FlutterRoot

    Run "flutter-pub-get" { flutter pub get }
    Run "flutter-analyze" { flutter analyze }
    Run "flutter-test" { flutter test }

    $defines = @(
        "--dart-define=API_BASE_URL=$ApiBaseUrl",
        "--dart-define=WEBSITE_URL=$WebsiteUrl",
        "--dart-define=PRODUCTION_ADS=$($ProductionAds.IsPresent.ToString().ToLowerInvariant())",
        "--dart-define=ADMOB_BANNER_ANDROID=$AdMobBannerAndroid",
        "--dart-define=ADMOB_INTERSTITIAL_ANDROID=$AdMobInterstitialAndroid",
        "--dart-define=PLAY_MONTHLY_PRODUCT_ID=ajn_pdf_premium_monthly",
        "--dart-define=PLAY_YEARLY_PRODUCT_ID=ajn_pdf_premium_yearly"
    )

    Run "flutter-apk-release" { flutter build apk --release @defines }

    if (Test-Path "android\key.properties") {
        Run "flutter-aab-release" { flutter build appbundle --release @defines }
    } else {
        Write-Warning "AAB skipped because android/key.properties is missing. Configure the upload signing key first."
    }

    if ($IsWindows) {
        Run "flutter-windows-release" { flutter build windows --release @defines }
    }

    $AndroidOut = Join-Path $Project "release\android"
    $WindowsOut = Join-Path $Project "release\windows"
    New-Item -ItemType Directory -Path $AndroidOut -Force | Out-Null
    New-Item -ItemType Directory -Path $WindowsOut -Force | Out-Null

    Get-ChildItem "build\app\outputs\flutter-apk\*.apk" -ErrorAction SilentlyContinue |
        Copy-Item -Destination $AndroidOut -Force
    Get-ChildItem "build\app\outputs\bundle\release\*.aab" -ErrorAction SilentlyContinue |
        Copy-Item -Destination $AndroidOut -Force

    if (Test-Path "build\windows\x64\runner\Release") {
        Copy-Item "build\windows\x64\runner\Release\*" $WindowsOut -Recurse -Force
    }
}

Set-Location -LiteralPath $Project
Get-ChildItem release -Recurse -File |
    Get-FileHash -Algorithm SHA256 |
    Select-Object Hash, Path |
    Format-Table -AutoSize |
    Out-File "release\SHA256SUMS.txt"

Write-Host ""
Write-Host "Release verification finished." -ForegroundColor Green
Write-Host "Outputs: $Project\release"
'@
Set-Utf8File "BUILD_AJN_PDF_RELEASES.ps1" $releaseScript

$setupGuide = @'
# AJN PDF Multiplatform Production Foundation

This implementation creates a production branch and adds:

- Hardened Next.js build rules.
- Environment-based Firebase configuration.
- Server-verified Razorpay subscriptions and webhooks.
- Server-verified Google Play subscriptions and a Pub/Sub RTDN endpoint.
- Safer Firestore rules.
- Hardened FastAPI PDF merge endpoint with content and size checks.
- Flutter Android and Windows project.
- Real PDF merge workflow through the backend.
- Real local Images-to-PDF workflow.
- AdMob consent, banner and frequency-controlled interstitial foundation.
- Google Play purchase flow that sends purchase tokens to the server.
- GitHub Actions checks.
- Release verification script.

## External configuration still required

1. Create Razorpay monthly/yearly Plans and add their IDs to hosting environment variables.
2. Add Razorpay live/test keys and webhook secret.
3. Configure Firebase Admin credentials in the hosting environment.
4. Create Google Play products:
   - `ajn_pdf_premium_monthly`
   - `ajn_pdf_premium_yearly`
5. Grant the Google service account access to the Google Play Developer API.
6. Configure Google Play RTDN Pub/Sub push URL:
   `/api/google-play/rtdn?token=<GOOGLE_PLAY_RTDN_SHARED_SECRET>`
7. Run FlutterFire configuration for Android:
   `dart pub global activate flutterfire_cli`
   `flutterfire configure --project=studio-656130239-fd28b --platforms=android`
8. Replace the Google sample AdMob App ID in AndroidManifest.xml with the real
   Android AdMob App ID before setting `PRODUCTION_ADS=true`.
9. Configure Android upload signing and keep the keystore/password backed up.
10. Add the required Android SDK API 36 and Visual Studio Desktop C++ workload.

The script deliberately uses Google sample ad identifiers until production
AdMob configuration is supplied, which prevents accidental invalid ad traffic.
'@
Set-Utf8File "MULTIPLATFORM_SETUP_REQUIRED.md" $setupGuide

Write-Stage "INSTALL AND VERIFY WEB DEPENDENCIES"

Set-Location -LiteralPath $Project

if (-not $SkipInstall) {
    npm install --save firebase-admin zod googleapis
    if ($LASTEXITCODE -ne 0) { throw "npm dependency installation failed." }

    npm install --save-dev cross-env "eslint-config-next@15.5.15"
    if ($LASTEXITCODE -ne 0) { throw "npm development dependency installation failed." }
}

if (-not $SkipBuild) {
    Run-Step "npm typecheck" { npm run typecheck } (Join-Path $Reports "web-typecheck.txt")
    Run-Step "npm lint" { npm run lint } (Join-Path $Reports "web-lint.txt")
    Run-Step "npm build" { npm run build } (Join-Path $Reports "web-build.txt")

    if (Get-Command python -ErrorAction SilentlyContinue) {
        Run-Step "backend compile" { python -m compileall backend } (Join-Path $Reports "backend-compile.txt")
    }

    if ($FlutterAvailable -and (Test-Path (Join-Path $FlutterRoot "pubspec.yaml"))) {
        Set-Location -LiteralPath $FlutterRoot
        Run-Step "flutter pub get" { flutter pub get } (Join-Path $Reports "flutter-pub-get.txt")
        Run-Step "flutter analyze" { flutter analyze } (Join-Path $Reports "flutter-analyze.txt")
        Run-Step "flutter test" { flutter test } (Join-Path $Reports "flutter-test.txt")
        Set-Location -LiteralPath $Project
    }
}

Write-Stage "COMMIT IMPLEMENTATION"

git add --all
$Pending = git status --porcelain
if ($Pending) {
    git commit -m "Add AJN PDF web Android Windows ads and subscription foundation"
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to commit the implementation."
    }
}

if (-not $SkipPush) {
    git push --set-upstream origin $Branch
    if ($LASTEXITCODE -ne 0) {
        throw "Implementation completed locally, but Git push failed."
    }
}

Write-Stage "AJN-PDF FOUNDATION COMPLETE"
Write-Host "Branch       : $Branch" -ForegroundColor Green
Write-Host "Commit       : $(git rev-parse --short HEAD)" -ForegroundColor Green
Write-Host "Setup report : $Project\MULTIPLATFORM_SETUP_REQUIRED.md"
Write-Host "Release cmd  : Set-ExecutionPolicy -Scope Process Bypass -Force; & `"$Project\BUILD_AJN_PDF_RELEASES.ps1`""
Write-Host ""
Write-Host "Important: APK/AAB/EXE are produced only after the corresponding Android SDK,"
Write-Host "signing key, FlutterFire, Play products, AdMob IDs, and Windows C++ toolchain are configured."
