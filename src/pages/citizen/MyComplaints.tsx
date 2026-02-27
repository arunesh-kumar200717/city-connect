import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Calendar, MapPin } from "lucide-react";
import CitizenLayout from "@/components/layouts/CitizenLayout";
import type { Tables } from "@/integrations/supabase/types";

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Tables<"complaints">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("complaints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setComplaints(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <CitizenLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">My Complaints</h1>
        <Link to="/citizen/new-complaint">
          <Button><Plus className="mr-2 h-4 w-4" />New Complaint</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't submitted any complaints yet.</p>
            <Link to="/citizen/new-complaint"><Button>Report an Issue</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-sm truncate">{c.category} — {c.sub_category}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[c.priority]}`}>
                      {PRIORITY_LABELS[c.priority]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">{c.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}, {c.area}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to={`/citizen/complaint/${c.id}`}>
                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}
