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

export const PlayerPerformancesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<any>(null);
  const [formData, setFormData] = useState({
    match_result_id: "",
    player_id: "",
    stars: "",
    destruction_percentage: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only fetch match results (not scheduled matches) since performances can only be added for completed matches
  const { data: matchResults } = useQuery({
    queryKey: ["match-results-for-performances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_results")
        .select("*")
        .order("match_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: players } = useQuery({
    queryKey: ["players-for-performances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: performances, isLoading } = useQuery({
    queryKey: ["admin-player-performances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_performances")
        .select(`
          *,
          players(name),
          match_results!player_performances_match_result_id_fkey(opponent_clan_name, match_date)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Get available players for the selected match (excluding those who already have performances)
  const getAvailablePlayersForMatch = () => {
    if (!formData.match_result_id || !players || !performances) return players;
    
    const existingPlayerIds = performances
      .filter(p => p.match_result_id === formData.match_result_id)
      .map(p => p.player_id);
    
    return players.filter(player => !existingPlayerIds.includes(player.id));
  };

  const createPerformanceMutation = useMutation({
    mutationFn: async (performanceData: any) => {
      // Check if player already has performance for this match
      const { data: existingPerformance } = await supabase
        .from("player_performances")
        .select("id")
        .eq("player_id", performanceData.player_id)
        .eq("match_result_id", performanceData.match_result_id)
        .single();

      if (existingPerformance) {
        throw new Error("This player already has a performance recorded for this match");
      }

      const finalData = {
        ...performanceData,
        stars: parseInt(performanceData.stars),
        destruction_percentage: parseFloat(performanceData.destruction_percentage),
      };

      const { data, error } = await supabase
        .from("player_performances")
        .insert([finalData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-player-performances"] });
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      queryClient.invalidateQueries({ queryKey: ["past-matches"] });
      setIsDialogOpen(false);
      setFormData({
        match_result_id: "",
        player_id: "",
        stars: "",
        destruction_percentage: "",
      });
      toast({ title: "Player performance added successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add player performance",
        variant: "destructive" 
      });
    },
  });

  const updatePerformanceMutation = useMutation({
    mutationFn: async ({ id, ...performanceData }: { id: string } & any) => {
      const finalData = {
        ...performanceData,
        stars: parseInt(performanceData.stars),
        destruction_percentage: parseFloat(performanceData.destruction_percentage),
      };

      const { data, error } = await supabase
        .from("player_performances")
        .update(finalData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-player-performances"] });
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      queryClient.invalidateQueries({ queryKey: ["past-matches"] });
      setIsDialogOpen(false);
      setEditingPerformance(null);
      setFormData({
        match_result_id: "",
        player_id: "",
        stars: "",
        destruction_percentage: "",
      });
      toast({ title: "Player performance updated successfully!" });
    },
  });

  const deletePerformanceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("player_performances")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-player-performances"] });
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      queryClient.invalidateQueries({ queryKey: ["past-matches"] });
      toast({ title: "Player performance deleted successfully!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerformance) {
      updatePerformanceMutation.mutate({ id: editingPerformance.id, ...formData });
    } else {
      createPerformanceMutation.mutate(formData);
    }
  };

  const handleEdit = (performance: any) => {
    setEditingPerformance(performance);
    setFormData({
      match_result_id: performance.match_result_id,
      player_id: performance.player_id,
      stars: performance.stars.toString(),
      destruction_percentage: performance.destruction_percentage.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this player performance?")) {
      deletePerformanceMutation.mutate(id);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Manage Player Performances</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Performance
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingPerformance ? "Edit Player Performance" : "Add Player Performance"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="match_result_id" className="text-white">Match Result (Only completed matches)</Label>
                  <Select 
                    value={formData.match_result_id} 
                    onValueChange={(value) => setFormData({ ...formData, match_result_id: value, player_id: "" })}
                    required
                  >
                    <SelectTrigger className="bg-slate-700 border-purple-500/20 text-white">
                      <SelectValue placeholder="Select completed match" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchResults?.map((result) => (
                        <SelectItem key={result.id} value={result.id}>
                          vs {result.opponent_clan_name} - {new Date(result.match_date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="player_id" className="text-white">Player (Available only)</Label>
                  <Select 
                    value={formData.player_id} 
                    onValueChange={(value) => setFormData({ ...formData, player_id: value })}
                    required
                    disabled={!formData.match_result_id}
                  >
                    <SelectTrigger className="bg-slate-700 border-purple-500/20 text-white">
                      <SelectValue placeholder={formData.match_result_id ? "Select available player" : "Select match first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePlayersForMatch()?.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.player_tag})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="stars" className="text-white">Stars (1-3)</Label>
                  <Input
                    id="stars"
                    type="number"
                    min="1"
                    max="3"
                    value={formData.stars}
                    onChange={(e) => setFormData({ ...formData, stars: e.target.value })}
                    required
                    className="bg-slate-700 border-purple-500/20 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="destruction_percentage" className="text-white">Destruction Percentage</Label>
                  <Input
                    id="destruction_percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.destruction_percentage}
                    onChange={(e) => setFormData({ ...formData, destruction_percentage: e.target.value })}
                    required
                    className="bg-slate-700 border-purple-500/20 text-white"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  {editingPerformance ? "Update Performance" : "Add Performance"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {matchResults?.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400">No match results available. Add match results first before adding player performances.</div>
          </div>
        ) : (
          <div>
            {/* Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="bg-slate-800 border-purple-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingPerformance ? "Edit Player Performance" : "Add Player Performance"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="match_result_id" className="text-white">Match Result (Only completed matches)</Label>
                    <Select 
                      value={formData.match_result_id} 
                      onValueChange={(value) => setFormData({ ...formData, match_result_id: value, player_id: "" })}
                      required
                    >
                      <SelectTrigger className="bg-slate-700 border-purple-500/20 text-white">
                        <SelectValue placeholder="Select completed match" />
                      </SelectTrigger>
                      <SelectContent>
                        {matchResults?.map((result) => (
                          <SelectItem key={result.id} value={result.id}>
                            vs {result.opponent_clan_name} - {new Date(result.match_date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="player_id" className="text-white">Player (Available only)</Label>
                    <Select 
                      value={formData.player_id} 
                      onValueChange={(value) => setFormData({ ...formData, player_id: value })}
                      required
                      disabled={!formData.match_result_id}
                    >
                      <SelectTrigger className="bg-slate-700 border-purple-500/20 text-white">
                        <SelectValue placeholder={formData.match_result_id ? "Select available player" : "Select match first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePlayersForMatch()?.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} ({player.player_tag})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="stars" className="text-white">Stars (1-3)</Label>
                    <Input
                      id="stars"
                      type="number"
                      min="1"
                      max="3"
                      value={formData.stars}
                      onChange={(e) => setFormData({ ...formData, stars: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="destruction_percentage" className="text-white">Destruction Percentage</Label>
                    <Input
                      id="destruction_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.destruction_percentage}
                      onChange={(e) => setFormData({ ...formData, destruction_percentage: e.target.value })}
                      required
                      className="bg-slate-700 border-purple-500/20 text-white"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    {editingPerformance ? "Update Performance" : "Add Performance"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Player</TableHead>
                  <TableHead className="text-gray-300">Match</TableHead>
                  <TableHead className="text-gray-300">Stars</TableHead>
                  <TableHead className="text-gray-300">Destruction %</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performances?.map((performance) => (
                  <TableRow key={performance.id}>
                    <TableCell className="text-white">{performance.players?.name}</TableCell>
                    <TableCell className="text-white">vs {performance.match_results?.opponent_clan_name}</TableCell>
                    <TableCell className="text-white">{performance.stars}</TableCell>
                    <TableCell className="text-white">{performance.destruction_percentage}%</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(performance.match_results?.match_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(performance)}
                          className="border-purple-500/20 text-purple-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(performance.id)}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
