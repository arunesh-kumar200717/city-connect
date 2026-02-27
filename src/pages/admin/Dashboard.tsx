import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const PIE_COLORS = ["#0ea5e9", "#eab308", "#22c55e", "#6b7280", "#ef4444"];

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Tables<"complaints">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("complaints").select("*").then(({ data }) => {
      setComplaints(data || []);
      setLoading(false);
    });
  }, []);

  const total = complaints.length;
  const open = complaints.filter((c) => c.status === "open").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved" || c.status === "closed").length;

  // By category
  const byCat = Object.entries(
    complaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // By status
  const byStatus = Object.entries(
    complaints.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  // By city
  const byCity = Object.entries(
    complaints.reduce((acc, c) => { acc[c.city] = (acc[c.city] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Trend (last 30 days)
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      count: complaints.filter((c) => c.created_at.startsWith(dateStr)).length,
    };
  });

  const stats = [
    { label: "Total", value: total, icon: FileText, color: "text-primary" },
    { label: "Open", value: open, icon: AlertTriangle, color: "text-blue-600" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-yellow-600" },
    { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-green-600" },
  ];

  return (
    <AdminLayout>
      <h1 className="mb-6 font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? <p className="text-muted-foreground">Loading charts...</p> : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCat}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={60} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="hsl(199,89%,36%)" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">By Status</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">By Location</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCity}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="hsl(172,66%,40%)" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Trend (Last 30 Days)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={10} /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="hsl(199,89%,36%)" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
