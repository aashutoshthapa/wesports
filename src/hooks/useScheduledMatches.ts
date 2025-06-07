
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
          *,
          match_results(id)
        `)
        .order("match_time_utc", { ascending: true });

      if (scheduledError) {
        console.error("Error fetching scheduled matches:", scheduledError);
        throw scheduledError;
      }

      // Filter out matches that have results
      const upcomingMatches = scheduledMatches?.filter(match => 
        !match.match_results || match.match_results.length === 0
      ) || [];

      console.log("Upcoming matches:", upcomingMatches);
      return upcomingMatches;
    },
  });
};
