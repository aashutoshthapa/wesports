import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePastMatches = () => {
  return useQuery({
    queryKey: ["past-matches"],
    queryFn: async () => {
      console.log("Fetching past matches...");
      const { data: scheduledMatches, error: scheduledError } = await supabase
        .from("scheduled_matches")
        .select(`
          id,
          match_time_utc,
          opponent_clan_name,
          completed,
          match_results!match_results_scheduled_match_id_fkey!inner (
            id,
            uwu_stars,
            enemy_stars,
            uwu_percentage,
            enemy_percentage,
            match_date,
            player_performances!player_performances_match_result_id_fkey (
              *,
              players!player_performances_player_id_fkey (
                name
              )
            )
          )
        `)
        .eq("completed", true)
        .order("match_time_utc", { ascending: false });

      if (scheduledError) {
        console.error("Error fetching past matches:", scheduledError);
        throw scheduledError;
      }

      console.log("Past matches fetched:", scheduledMatches);
      return scheduledMatches;
    },
  });
};
