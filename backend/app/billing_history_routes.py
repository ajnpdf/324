from __future__ import annotations

from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Header

from .billing_routes import PRODUCT_ID, _db_client, _trusted_user

router = APIRouter()


def _iso(value: Any) -> str | None:
    return value.isoformat() if isinstance(value, datetime) else None


def _masked_reference(value: Any, prefix: str) -> str | None:
    clean = str(value or '').strip()
    if not clean:
        return None
    suffix = clean[-8:] if len(clean) > 8 else clean
    return f'{prefix}…{suffix}'


@router.get('/api/billing/history')
def billing_history(
    x_ajn_internal_token: Annotated[str | None, Header(alias='X-AJN-Internal-Token')] = None,
    x_ajn_user_uid: Annotated[str | None, Header(alias='X-AJN-User-UID')] = None,
    x_ajn_user_email: Annotated[str | None, Header(alias='X-AJN-User-Email')] = None,
):
    uid, _ = _trusted_user(x_ajn_internal_token, x_ajn_user_uid, x_ajn_user_email)
    query = _db_client().collection('billingOrders').where('uid', '==', uid).limit(100)
    rows: list[dict[str, Any]] = []
    for snapshot in query.stream():
        data = snapshot.to_dict() or {}
        if str(data.get('product') or PRODUCT_ID) != PRODUCT_ID:
            continue
        amount = max(0, int(data.get('amount') or 0))
        created_at = data.get('createdAt')
        rows.append(
            {
                'order_reference': _masked_reference(snapshot.id, 'order'),
                'payment_reference': _masked_reference(data.get('paymentId'), 'pay'),
                'receipt': str(data.get('receipt') or '')[:80] or None,
                'plan': str(data.get('plan') or '')[:40],
                'amount': amount,
                'currency': str(data.get('currency') or 'INR')[:8],
                'status': str(data.get('status') or 'created')[:24],
                'fulfilled': data.get('fulfilled') is True,
                'created_at': _iso(created_at),
                'paid_at': _iso(data.get('paidAt')),
                'valid_until': _iso(data.get('validUntil')),
                '_sort': created_at.timestamp() if isinstance(created_at, datetime) else 0.0,
            }
        )
    rows.sort(key=lambda item: float(item.pop('_sort', 0.0)), reverse=True)
    return {'product': PRODUCT_ID, 'orders': rows[:50]}
