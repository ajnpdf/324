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