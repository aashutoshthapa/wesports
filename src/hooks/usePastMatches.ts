
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePastMatches = () => {
  return useQuery({
    queryKey: ["past-matches"],
    queryFn: async () => {
      console.log("Fetching past matches...");
      const { data: matchResults, error: matchError } = await supabase
        .from("match_results")
        .select(`
          id,
          uwu_stars,
          enemy_stars,
          uwu_percentage,
          enemy_percentage,
          match_date,
          opponent_clan_name,
          match_time_utc,
          player_performances (
            *,
            players (
              name
            )
          )
        `)
        .order("match_date", { ascending: false });

      if (matchError) {
        console.error("Error fetching past matches:", matchError);
        throw matchError;
      }

      console.log("Past matches fetched:", matchResults);
      return matchResults;
    },
  });
};
