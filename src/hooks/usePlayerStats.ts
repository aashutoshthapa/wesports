
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlayerStats = () => {
  return useQuery({
    queryKey: ["player-stats"],
    queryFn: async () => {
      console.log("Fetching player stats...");
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          player_performances (
            stars,
            destruction_percentage,
            match_results!player_performances_match_result_id_fkey (
              match_date
            )
          )
        `);

      if (error) {
        console.error("Error fetching player stats:", error);
        throw error;
      }

      console.log("Player stats fetched:", data);
      
      // Calculate monthly and overall stats for each player
      const playersWithStats = data.map(player => {
        const performances = player.player_performances || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyPerformances = performances.filter(p => {
          const matchDate = new Date(p.match_results.match_date);
          return matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear;
        });

        const calculateStats = (perfs: any[]) => {
          const total_matches = perfs.length;
          if (total_matches === 0) {
            return {
              avg_stars: 0,
              total_matches: 0,
              three_stars: 0,
              two_stars: 0,
              one_star: 0,
              avg_destruction: 0
            };
          }

          const three_stars = perfs.filter(p => p.stars === 3).length;
          const two_stars = perfs.filter(p => p.stars === 2).length;
          const one_star = perfs.filter(p => p.stars === 1).length;
          const avg_stars = parseFloat((perfs.reduce((sum, p) => sum + p.stars, 0) / total_matches).toFixed(1));
          const avg_destruction = parseFloat((perfs.reduce((sum, p) => sum + p.destruction_percentage, 0) / total_matches).toFixed(1));

          return {
            avg_stars,
            total_matches,
            three_stars,
            two_stars,
            one_star,
            avg_destruction
          };
        };

        return {
          id: player.id,
          name: player.name,
          player_tag: player.player_tag,
          monthly: calculateStats(monthlyPerformances),
          overall: calculateStats(performances),
          player_performances: performances
        };
      });

      return playersWithStats;
    },
  });
};
