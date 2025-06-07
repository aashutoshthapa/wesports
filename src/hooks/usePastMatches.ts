
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
          *,
          player_performances (
            *,
            players (
              name
            )
          ),
          scheduled_matches (
            opponent_clan_name,
            match_time_utc
          )
        `)
        .order("match_date", { ascending: false })
        .eq("scheduled_match_id", "not null");

      if (matchError) {
        console.error("Error fetching past matches:", matchError);
        throw matchError;
      }

      console.log("Past matches fetched:", matchResults);
      return matchResults;
    },
  });
};
