
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PlayersManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", player_tag: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players, isLoading } = useQuery({
    queryKey: ["admin-players"],
    queryFn: async () => {
      console.log("Fetching players for admin...");
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching players:", error);
        throw error;
      }
      console.log("Players fetched:", data);
      return data;
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (playerData: { name: string; player_tag: string }) => {
      console.log("Creating player:", playerData);
      const { data, error } = await supabase
        .from("players")
        .insert([playerData])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating player:", error);
        throw error;
      }
      console.log("Player created:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-players"] });
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      setIsDialogOpen(false);
      setFormData({ name: "", player_tag: "" });
      toast({ title: "Player created successfully!" });
    },
    onError: (error) => {
      console.error("Create player mutation error:", error);
      toast({ 
        title: "Error creating player", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, ...playerData }: { id: string; name: string; player_tag: string }) => {
      console.log("Updating player:", { id, ...playerData });
      const { data, error } = await supabase
        .from("players")
        .update(playerData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating player:", error);
        throw error;
      }
      console.log("Player updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-players"] });
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      setIsDialogOpen(false);
      setEditingPlayer(null);
      setFormData({ name: "", player_tag: "" });
      toast({ title: "Player updated successfully!" });
    },
    onError: (error) => {
      console.error("Update player mutation error:", error);
      toast({ 
        title: "Error updating player", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting player:", id);
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting player:", error);
        throw error;
      }
      console.log("Player deleted:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-players"] });
      queryClient.invalidateQueries({ queryKey: ["player-stats"] });
      toast({ title: "Player deleted successfully!" });
    },
    onError: (error) => {
      console.error("Delete player mutation error:", error);
      toast({ 
        title: "Error deleting player", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", formData);
    if (editingPlayer) {
      updatePlayerMutation.mutate({ id: editingPlayer.id, ...formData });
    } else {
      createPlayerMutation.mutate(formData);
    }
  };

  const handleEdit = (player: any) => {
    console.log("Editing player:", player);
    setEditingPlayer(player);
    setFormData({ name: player.name, player_tag: player.player_tag });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log("Delete requested for player:", id);
    if (confirm("Are you sure you want to delete this player?")) {
      deletePlayerMutation.mutate(id);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Manage Players</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingPlayer ? "Edit Player" : "Add New Player"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Player Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-700 border-purple-500/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="player_tag" className="text-white">Player Tag</Label>
                  <Input
                    id="player_tag"
                    value={formData.player_tag}
                    onChange={(e) => setFormData({ ...formData, player_tag: e.target.value })}
                    placeholder="#ABC123"
                    required
                    className="bg-slate-700 border-purple-500/20 text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  {editingPlayer ? "Update Player" : "Create Player"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-white">Loading players...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Player Tag</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players?.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="text-white">{player.name}</TableCell>
                  <TableCell className="text-gray-300">{player.player_tag}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(player.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(player)}
                        className="border-purple-500/20 text-purple-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(player.id)}
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
        )}
      </CardContent>
    </Card>
  );
};
