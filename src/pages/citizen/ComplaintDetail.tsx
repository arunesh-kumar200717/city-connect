import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock } from "lucide-react";
import CitizenLayout from "@/components/layouts/CitizenLayout";
import type { Tables } from "@/integrations/supabase/types";

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Tables<"complaints"> | null>(null);
  const [history, setHistory] = useState<Tables<"complaint_status_history">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("complaints").select("*").eq("id", id).maybeSingle(),
      supabase.from("complaint_status_history").select("*").eq("complaint_id", id).order("created_at", { ascending: true }),
    ]).then(([cRes, hRes]) => {
      setComplaint(cRes.data);
      setHistory(hRes.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <CitizenLayout><p className="text-muted-foreground">Loading...</p></CitizenLayout>;
  if (!complaint) return <CitizenLayout><p className="text-destructive">Complaint not found.</p></CitizenLayout>;

  return (
    <CitizenLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{complaint.category} — {complaint.sub_category}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[complaint.status]}`}>
              {STATUS_LABELS[complaint.status]}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[complaint.priority]}`}>
              {PRIORITY_LABELS[complaint.priority]}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{complaint.description}</p>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{complaint.city}, {complaint.area}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            {complaint.image_url && (
              <img src={complaint.image_url} alt="Complaint evidence" className="mt-3 max-h-64 rounded-lg border object-cover" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status changes yet.</p>
            ) : (
              <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
                {history.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[h.new_status]}`}>
                        {STATUS_LABELS[h.new_status]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    {h.notes && <p className="mt-1 text-xs text-muted-foreground">{h.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CitizenLayout>
  );
}
