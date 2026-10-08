import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchMyBlockedIds } from "@/lib/blocks";

export interface ConnectionRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface AcceptedConnection {
  otherId: string; // the other user's id
  displayName: string;
  conversationId: string | null;
}

export function useConnectionRequests() {
  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [outgoing, setOutgoing] = useState<ConnectionRequest[]>([]);
  const [accepted, setAccepted] = useState<AcceptedConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: requests, error } = await supabase
      .from("connection_requests")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error || !requests) { setLoading(false); return; }

    // Collect all unique user IDs to fetch profiles
    const userIds = new Set<string>();
    requests.forEach(r => { userIds.add(r.sender_id); userIds.add(r.receiver_id); });
    userIds.delete(user.id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", Array.from(userIds));

    const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) ?? []);

    // Get current user's name too
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const mapped: ConnectionRequest[] = requests.map(r => ({
      id: r.id,
      senderId: r.sender_id,
      senderName: r.sender_id === user.id ? (myProfile?.display_name ?? "You") : (profileMap.get(r.sender_id) ?? "Unknown"),
      receiverId: r.receiver_id,
      receiverName: r.receiver_id === user.id ? (myProfile?.display_name ?? "You") : (profileMap.get(r.receiver_id) ?? "Unknown"),
      status: r.status as ConnectionRequest["status"],
      createdAt: r.created_at,
    }));

    const blocked = new Set(await fetchMyBlockedIds());
    const visible = mapped.filter(r => {
      const other = r.senderId === user.id ? r.receiverId : r.senderId;
      return !blocked.has(other);
    });

    setIncoming(visible.filter(r => r.receiverId === user.id && r.status === "pending"));
    setOutgoing(visible.filter(r => r.senderId === user.id));

    // Build accepted connections
    const acceptedRequests = visible.filter(r => r.status === "accepted");

    // Fetch every conversation this user is in once, then look each up locally
    const { data: convos } = await supabase
      .from("conversations")
      .select("id, user_one, user_two")
      .or(`user_one.eq.${user.id},user_two.eq.${user.id}`);

    const convoByOtherId = new Map<string, string>();
    for (const c of convos ?? []) {
      const otherId = c.user_one === user.id ? c.user_two : c.user_one;
      convoByOtherId.set(otherId, c.id);
    }

    const acceptedConns: AcceptedConnection[] = acceptedRequests.map(r => {
      const otherId = r.senderId === user.id ? r.receiverId : r.senderId;
      const otherName = r.senderId === user.id ? r.receiverName : r.senderName;

      return {
        otherId,
        displayName: otherName === "You" ? "Unknown" : otherName,
        conversationId: convoByOtherId.get(otherId) ?? null,
      };
    });

    setAccepted(acceptedConns);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sendRequest = useCallback(async (receiverId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if request already exists
    const { data: existing } = await supabase
      .from("connection_requests")
      .select("id, status")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === "pending") {
        toast.info("Connection request already sent");
      } else if (existing.status === "accepted") {
        toast.info("You're already connected!");
      }
      return false;
    }

    const { error } = await supabase
      .from("connection_requests")
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
      return false;
    }

    toast.success("Connection request sent!");
    await fetchRequests();
    return true;
  }, [fetchRequests]);

  const respondToRequest = useCallback(async (requestId: string, accept: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newStatus = accept ? "accepted" : "rejected";

    const { error } = await supabase
      .from("connection_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      console.error("Error responding to request:", error);
      toast.error("Failed to respond to request");
      return;
    }

    // If accepted, create a conversation
    if (accept) {
      const request = incoming.find(r => r.id === requestId);
      if (request) {
        const { error: convoError } = await supabase
          .from("conversations")
          .insert({
            user_one: request.senderId,
            user_two: request.receiverId,
          });

        if (convoError) {
          console.error("Error creating conversation:", convoError);
        }
      }
      toast.success("Connected! You can now chat.");
    } else {
      toast.info("Request declined");
    }

    await fetchRequests();
  }, [incoming, fetchRequests]);

  return { incoming, outgoing, accepted, loading, sendRequest, respondToRequest, refetch: fetchRequests };
}
