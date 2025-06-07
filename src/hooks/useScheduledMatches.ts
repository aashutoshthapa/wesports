
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useScheduledMatches = () => {
  return useQuery({
    queryKey: ["scheduled-matches"],
    queryFn: async () => {
      console.log("Fetching scheduled matches...");
      
      const { data: scheduledMatches, error: scheduledError } = await supabase
        .from("scheduled_matches")
        .select(`
          id,
          match_time_utc,
          opponent_clan_name
        `)
        .eq("completed", false)
        .order("match_time_utc", { ascending: true });

      if (scheduledError) {
        console.error("Error fetching scheduled matches:", scheduledError);
        throw scheduledError;
      }

      console.log("Upcoming matches:", scheduledMatches);
      return scheduledMatches;
    },
  });
};
