
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import { InviteMemberModal } from './invite-member-modal';

export function MembersTab() {
  const [showInvite, setShowInvite] = useState(false);
  const members: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight uppercase">Active Team</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Managing seats in this workspace</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="bg-white text-black hover:bg-white/90 font-black text-xs gap-2 px-6 shadow-xl uppercase tracking-widest">
          <UserPlus className="w-4 h-4" /> INVITE MEMBER
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="py-24 text-center space-y-6 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
          <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-muted-foreground/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tighter">No Members Detected</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Invite colleagues to begin collaborative processing.</p>
          </div>
          <Button onClick={() => setShowInvite(true)} variant="outline" className="border-white/10 font-black text-[10px] uppercase tracking-widest h-10 px-8">
            SEND FIRST INVITE
          </Button>
        </div>
      ) : null}

      <InviteMemberModal open={showInvite} onOpenChange={setShowInvite} />
    </div>
  );
}
