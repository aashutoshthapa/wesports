
import { Calendar, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useScheduledMatches } from "@/hooks/useScheduledMatches";

const ScheduledMatches = () => {
  const { data: scheduledMatches, isLoading, error } = useScheduledMatches();

  const formatMatchTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTimeUntilMatch = (utcTime: string) => {
    const now = new Date();
    const matchTime = new Date(utcTime);
    const diffMs = matchTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Past";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  if (error) {
    console.error("Error loading scheduled matches:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                UwU eSports
              </span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-purple-400 transition-colors">Home</Link>
              <Link to="/matches/scheduled" className="text-purple-400">Scheduled</Link>
              <Link to="/matches/past" className="text-gray-300 hover:text-purple-400 transition-colors">Past Matches</Link>
              <Link to="/players/stats" className="text-gray-300 hover:text-purple-400 transition-colors">Player Stats</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Scheduled Matches</h1>
          <p className="text-gray-400">Upcoming clan wars and important dates</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading scheduled matches...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400">Error loading matches. Please try again later.</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {scheduledMatches?.map((match) => {
              const { date, time } = formatMatchTime(match.match_time_utc);
              const timeUntil = getTimeUntilMatch(match.match_time_utc);
              
              return (
                <Card key={match.id} className="bg-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl mb-2">
                          vs {match.opponent_clan_name}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={timeUntil === "Today" ? "destructive" : timeUntil === "Tomorrow" ? "default" : "secondary"}
                        className="text-sm"
                      >
                        {timeUntil}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {match.notes && (
                      <div className="mb-4">
                        <p className="text-gray-300">{match.notes}</p>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          const startTime = new Date(match.match_time_utc).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                          const endTime = new Date(new Date(match.match_time_utc).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                          const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Clan War vs ${match.opponent_clan_name}&dates=${startTime}/${endTime}&details=${match.notes || 'Clan war match'}`;
                          window.open(googleCalendarUrl, '_blank');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Calendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {scheduledMatches?.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No scheduled matches</h3>
                <p className="text-gray-500">Check back later for upcoming clan wars</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledMatches;
