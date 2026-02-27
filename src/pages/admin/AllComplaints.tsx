import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layouts/AdminLayout";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, COMPLAINT_CATEGORIES, CITIES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, Pencil, Search } from "lucide-react";
import type { Tables, Enums } from "@/integrations/supabase/types";

export default function AllComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Tables<"complaints">[]>([]);
  const [departments, setDepartments] = useState<Tables<"departments">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [editComplaint, setEditComplaint] = useState<Tables<"complaints"> | null>(null);
  const [editStatus, setEditStatus] = useState<Enums<"complaint_status">>("open");
  const [editPriority, setEditPriority] = useState<Enums<"complaint_priority">>("medium");
  const [editDept, setEditDept] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    Promise.all([
      supabase.from("complaints").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("*"),
    ]).then(([cRes, dRes]) => {
      setComplaints(cRes.data || []);
      setDepartments(dRes.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = complaints.filter((c) => {
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCity !== "all" && c.city !== filterCity) return false;
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;
    if (search && !c.description.toLowerCase().includes(search.toLowerCase()) && !c.sub_category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openEdit = (c: Tables<"complaints">) => {
    setEditComplaint(c);
    setEditStatus(c.status);
    setEditPriority(c.priority);
    setEditDept(c.assigned_department_id || "");
    setEditNotes("");
  };

  const saveEdit = async () => {
    if (!editComplaint || !user) return;
    setSaving(true);

    const oldStatus = editComplaint.status;
    const { error } = await supabase.from("complaints").update({
      status: editStatus,
      priority: editPriority,
      assigned_department_id: editDept || null,
    }).eq("id", editComplaint.id);

    if (oldStatus !== editStatus) {
      await supabase.from("complaint_status_history").insert({
        complaint_id: editComplaint.id,
        old_status: oldStatus,
        new_status: editStatus,
        notes: editNotes || null,
        changed_by: user.id,
      });
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated" });
      setEditComplaint(null);
      fetchData();
    }
    setSaving(false);
  };

  const exportCSV = () => {
    const header = "ID,Category,SubCategory,Status,Priority,City,Area,Created\n";
    const rows = filtered.map((c) => `${c.id},${c.category},${c.sub_category},${c.status},${c.priority},${c.city},${c.area},${c.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "complaints.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">All Complaints</h1>
        <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="w-48">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="w-40">
            <Label className="text-xs">Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.keys(COMPLAINT_CATEGORIES).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Label className="text-xs">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <Label className="text-xs">City</Label>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.keys(CITIES).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <Label className="text-xs">Priority</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No complaints found.</TableCell></TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{c.category}</div>
                      <div className="text-xs text-muted-foreground">{c.sub_category}</div>
                    </TableCell>
                    <TableCell className="text-sm">{c.city}, {c.area}</TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span></TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editComplaint} onOpenChange={(open) => !open && setEditComplaint(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Complaint</DialogTitle></DialogHeader>
          {editComplaint && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{editComplaint.category} — {editComplaint.sub_category}</p>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Enums<"complaint_status">)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Enums<"complaint_priority">)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Department</Label>
                <Select value={editDept} onValueChange={setEditDept}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Add a note about this status change..." />
              </div>
              <Button onClick={saveEdit} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
