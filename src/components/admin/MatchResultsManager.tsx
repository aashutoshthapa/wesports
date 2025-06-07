import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const MatchResultsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    scheduled_match_id: "",
    opponent_clan_name: "",
    uwu_stars: "",
    uwu_percentage: "",
    enemy_stars: "",
    enemy_percentage: "",
    match_date: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only fetch scheduled matches that don't have results yet
  const { data: scheduledMatches } = useQuery({
    queryKey: ["scheduled-matches-for-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_matches")
        .select(`
          *,
          match_results(id)
        `)
        .order("match_time_utc", { ascending: false });
      
      if (error) throw error;
      
      // Filter out matches that already have results
      return data.filter(match => !match.match_results || match.match_results.length === 0);
    },
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ["admin-match-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_results")
        .select("*")
        .order("match_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      const { scheduled_match_id, ...rest } = resultData;
      const finalData = {
        ...rest,
        scheduled_match_id: scheduled_match_id || null,
        uwu_stars: parseInt(rest.uwu_stars),
        uwu_percentage: parseFloat(rest.uwu_percentage),
        enemy_stars: parseInt(rest.enemy_stars),
        enemy_percentage: parseFloat(rest.enemy_percentage),
      };

      const { data, error } = await supabase
        .from("match_results")
        .insert([finalData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-match-results"] });
      queryClient.invalidateQueries({ queryKey: ["past-matches"] });
      setIsDialogOpen(false);
      setFormData({
        scheduled_match_id: "",
        opponent_clan_name: "",
        uwu_stars: "",
        uwu_percentage: "",
        enemy_stars: "",
        enemy_percentage: "",
        match_date: "",
      });
      toast({ title: "Match result added successfully!" });
    },
  });

  const updateResultMutation = useMutation({
    mutationFn: async ({ id, ...resultData }: { id: string } & any) => {
      const { scheduled_match_id, ...rest } = resultData;
      const finalData = {
        ...rest,
        scheduled_match_id: scheduled_match_id || null,
        uwu_stars: parseInt(rest.uwu_stars),
        uwu_percentage: parseFloat(rest.uwu_percentage),
        enemy_stars: parseInt(rest.enemy_stars),
        enemy_percentage: parseFloat(rest.enemy_percentage),
      };

      const { data, error } = await supabase
        .from("match_results")
        .update(finalData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-match-results"] });
      queryClient.invalidateQueries({ queryKey: ["past-matches"] });
      setIsDialogOpen(false);
      setEditingResult(null);
      setFormData({
        scheduled_match_id: "",
        opponent_clan_name: "",
        uwu_stars: "",
        uwu_percentage: "",
        enemy_stars: "",
        enemy_percentage: "",
        match_date: "",
      });
      toast({ title: "Match result updated successfully!" });
    },
  });

  const deleteResultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("match_results")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-match-results"] });
      queryClient.invalidateQueries({ queryKey: ["past-matches"] });
      toast({ title: "Match result deleted successfully!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResult) {
      updateResultMutation.mutate({ id: editingResult.id, ...formData });
    } else {
      createResultMutation.mutate(formData);
    }
  };

  const handleEdit = (result: any) => {
    setEditingResult(result);
    setFormData({
      scheduled_match_id: result.scheduled_match_id || "",
      opponent_clan_name: result.opponent_clan_name,
      uwu_stars: result.uwu_stars.toString(),
      uwu_percentage: result.uwu_percentage.toString(),
      enemy_stars: result.enemy_stars.toString(),
      enemy_percentage: result.enemy_percentage.toString(),
      match_date: new Date(result.match_date).toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this match result?")) {
      deleteResultMutation.mutate(id);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Manage Match Results</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingResult ? "Edit Match Result" : "Add Match Result"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_match_id" className="text-white">Link to Scheduled Match (Available only)</Label>
                    <Select 
                      value={formData.scheduled_match_id} 
                      onValueChange={(value) => setFormData({ ...formData, scheduled_match_id: value })}
                    >
                      <SelectTrigger className="bg-slate-700 border-purple-500/20 text-white">
                        <SelectValue placeholder="Select available scheduled match" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduledMatches?.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.opponent_clan_name} - {new Date(match.match_time_utc).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="uwu_stars" className="text-white">UwU Stars</Label>
                    <Input
                      id="uwu_stars"
                      type="number"
                      min="0"
                      value={formData.uwu_stars}
                      onChange={(e) => setFormData({ ...formData, uwu_stars: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uwu_percentage" className="text-white">UwU Percentage</Label>
                    <Input
                      id="uwu_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.uwu_percentage}
                      onChange={(e) => setFormData({ ...formData, uwu_percentage: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enemy_stars" className="text-white">Enemy Stars</Label>
                    <Input
                      id="enemy_stars"
                      type="number"
                      min="0"
                      value={formData.enemy_stars}
                      onChange={(e) => setFormData({ ...formData, enemy_stars: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="enemy_percentage" className="text-white">Enemy Percentage</Label>
                    <Input
                      id="enemy_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.enemy_percentage}
                      onChange={(e) => setFormData({ ...formData, enemy_percentage: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="match_date" className="text-white">Match Date</Label>
                  <Input
                    id="match_date"
                    type="datetime-local"
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                    required
                    className="bg-slate-700 border-purple-500/20 text-white"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  {editingResult ? "Update Result" : "Add Result"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Opponent</TableHead>
              <TableHead className="text-gray-300">UwU Stars</TableHead>
              <TableHead className="text-gray-300">UwU %</TableHead>
              <TableHead className="text-gray-300">Enemy Stars</TableHead>
              <TableHead className="text-gray-300">Enemy %</TableHead>
              <TableHead className="text-gray-300">Date</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results?.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="text-white">{result.opponent_clan_name}</TableCell>
                <TableCell className="text-white">{result.uwu_stars}</TableCell>
                <TableCell className="text-white">{result.uwu_percentage}%</TableCell>
                <TableCell className="text-white">{result.enemy_stars}</TableCell>
                <TableCell className="text-white">{result.enemy_percentage}%</TableCell>
                <TableCell className="text-gray-300">
                  {new Date(result.match_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(result)}
                      className="border-purple-500/20 text-purple-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(result.id)}
                      className="border-red-500/20 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
