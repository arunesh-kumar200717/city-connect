import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layouts/AdminLayout";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, MapPin, Calendar } from "lucide-react";
import type { Tables, Enums } from "@/integrations/supabase/types";

export default function OfficerComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Tables<"complaints">[]>([]);
  const [loading, setLoading] = useState(true);
  const [editComplaint, setEditComplaint] = useState<Tables<"complaints"> | null>(null);
  const [editStatus, setEditStatus] = useState<Enums<"complaint_status">>("open");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    if (!user) return;
    supabase.from("complaints").select("*").eq("assigned_officer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setComplaints(data || []); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [user]);

  const saveUpdate = async () => {
    if (!editComplaint || !user) return;
    setSaving(true);
    const oldStatus = editComplaint.status;
    await supabase.from("complaints").update({ status: editStatus }).eq("id", editComplaint.id);
    if (oldStatus !== editStatus) {
      await supabase.from("complaint_status_history").insert({
        complaint_id: editComplaint.id, old_status: oldStatus, new_status: editStatus, notes: editNotes || null, changed_by: user.id,
      });
    }
    toast({ title: "Updated" });
    setEditComplaint(null);
    fetchData();
    setSaving(false);
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 font-display text-2xl font-bold">My Assignments</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : complaints.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No assignments yet.</TableCell></TableRow>
              ) : complaints.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><div className="font-medium text-sm">{c.category}</div><div className="text-xs text-muted-foreground">{c.sub_category}</div></TableCell>
                  <TableCell className="text-sm">{c.city}, {c.area}</TableCell>
                  <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span></TableCell>
                  <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => { setEditComplaint(c); setEditStatus(c.status); setEditNotes(""); }}><Pencil className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editComplaint} onOpenChange={(open) => !open && setEditComplaint(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          {editComplaint && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{editComplaint.category} — {editComplaint.sub_category}</p>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Enums<"complaint_status">)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add notes..." />
              </div>
              <Button onClick={saveUpdate} disabled={saving} className="w-full">{saving ? "Saving..." : "Update"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
