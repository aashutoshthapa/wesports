import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ScheduledMatchesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "completed">("all");
  const [formData, setFormData] = useState({
    opponent_clan_name: "",
    match_time_utc: "",
    notes: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ["admin-scheduled-matches", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("scheduled_matches")
        .select(`
          *,
          match_results!match_results_scheduled_match_id_fkey(id)
        `)
        .order("match_time_utc", { ascending: true });

      if (statusFilter === "scheduled") {
        query = query.eq("completed", false);
      } else if (statusFilter === "completed") {
        query = query.eq("completed", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 0,
  });

  const createMatchMutation = useMutation({
    mutationFn: async (matchData: typeof formData) => {
      const { data, error } = await supabase
        .from("scheduled_matches")
        .insert([{ ...matchData, completed: false }]) // Newly scheduled matches are not completed
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scheduled-matches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-matches"] });
      setIsDialogOpen(false);
      setFormData({ opponent_clan_name: "", match_time_utc: "", notes: "" });
      toast({ title: "Match scheduled successfully!" });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ id, ...matchData }: { id: string } & typeof formData) => {
      const { data, error } = await supabase
        .from("scheduled_matches")
        .update(matchData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scheduled-matches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-matches"] });
      setIsDialogOpen(false);
      setEditingMatch(null);
      setFormData({ opponent_clan_name: "", match_time_utc: "", notes: "" });
      toast({ title: "Match updated successfully!" });
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_matches")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scheduled-matches"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-matches"] });
      toast({ title: "Match deleted successfully!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMatch) {
      updateMatchMutation.mutate({ id: editingMatch.id, ...formData });
    } else {
      createMatchMutation.mutate(formData);
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setFormData({
      opponent_clan_name: match.opponent_clan_name,
      match_time_utc: new Date(match.match_time_utc).toISOString().slice(0, 16),
      notes: match.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this scheduled match?")) {
      deleteMatchMutation.mutate(id);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Manage Scheduled Matches</CardTitle>
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={(value: "all" | "scheduled" | "completed") => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-purple-500/20 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="scheduled">Scheduled Only</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Match
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-purple-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingMatch ? "Edit Scheduled Match" : "Schedule New Match"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="opponent_clan_name" className="text-white">Opponent Clan Name</Label>
                    <Input
                      id="opponent_clan_name"
                      value={formData.opponent_clan_name}
                      onChange={(e) => setFormData({ ...formData, opponent_clan_name: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="match_time_utc" className="text-white">Match Time (UTC)</Label>
                    <Input
                      id="match_time_utc"
                      type="datetime-local"
                      value={formData.match_time_utc}
                      onChange={(e) => setFormData({ ...formData, match_time_utc: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-slate-700 border-purple-500/20 text-white"
                      placeholder="Strategy notes, preparation tips, etc."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    {editingMatch ? "Update Match" : "Schedule Match"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Opponent</TableHead>
              <TableHead className="text-gray-300">Match Time</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Notes</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches?.map((match) => {
              const hasResult = match.match_results && match.match_results.length > 0;
              const isCompleted = match.completed; // Use the completed column
              return (
                <TableRow key={match.id}>
                  <TableCell className="text-white">{match.opponent_clan_name}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(match.match_time_utc).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {isCompleted ? (
                      <Badge className="bg-green-600 text-white">Completed</Badge>
                    ) : (
                      <Badge className="bg-yellow-600 text-white">Scheduled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">{match.notes || "No notes"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(match)}
                        disabled={isCompleted} // Disable edit/delete for completed matches
                        className="border-purple-500/20 text-purple-400 disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(match.id)}
                        disabled={isCompleted} // Disable edit/delete for completed matches
                        className="border-red-500/20 text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
