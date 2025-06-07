
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useScheduledMatches = () => {
  return useQuery({
    queryKey: ["scheduled-matches"],
    queryFn: async () => {
      console.log("Fetching scheduled matches...");
      
      // Get all scheduled matches that don't have match results
      const { data: scheduledMatches, error: scheduledError } = await supabase
        .from("scheduled_matches")
        .select(`
          id,
          match_time_utc,
          opponent_clan_name
        `)
        .order("match_time_utc", { ascending: true });

      if (scheduledError) {
        console.error("Error fetching scheduled matches:", scheduledError);
        throw scheduledError;
      }

      // Filter out matches that have results by checking if they exist in match_results table
      const { data: matchResults } = await supabase
        .from("match_results")
        .select("scheduled_match_id")
        .in("scheduled_match_id", scheduledMatches?.map(match => match.id) || []);

      const matchIdsWithResults = matchResults?.map(result => result.scheduled_match_id) || [];
      
      const upcomingMatches = scheduledMatches?.filter(match => 
        !matchIdsWithResults.includes(match.id)
      ) || [];

      console.log("Upcoming matches:", upcomingMatches);
      return upcomingMatches;
    },
  });
};
