
import { Trophy, Target, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { usePastMatches } from "@/hooks/usePastMatches";

const PastMatches = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const { data: pastMatches, isLoading, error } = usePastMatches();

  const getResultColor = (uwuStars: number, enemyStars: number) => {
    return uwuStars > enemyStars ? "text-green-400" : "text-red-400";
  };

  const getResultBadge = (uwuStars: number, enemyStars: number) => {
    return uwuStars > enemyStars ? 
      <Badge className="bg-green-600 text-white">Victory</Badge> : 
      <Badge className="bg-red-600 text-white">Defeat</Badge>;
  };

  if (error) {
    console.error("Error loading past matches:", error);
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
              <Link to="/" className="text-gray-300 hover:text-purple-400 transition-colors">Upcoming Matches</Link>
              <Link to="/matches/past" className="text-purple-400">Past Matches</Link>
              <Link to="/players/stats" className="text-gray-300 hover:text-purple-400 transition-colors">Player Stats</Link>
              <Link to="/admin" className="text-gray-300 hover:text-purple-400 transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Past Matches</h1>
          <p className="text-gray-400">Complete history of clan war results and performance</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading past matches...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400">Error loading matches. Please try again later.</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {pastMatches?.map((match) => (
              <Card key={match.id} className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl mb-2">
                        vs {match.opponent_clan_name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(match.match_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {getResultBadge(match.uwu_stars, match.enemy_stars)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* UwU Stats */}
                    <div className="bg-purple-900/30 rounded-lg p-4">
                      <h3 className="text-purple-400 font-semibold mb-3">UwU eSports</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Stars</span>
                          <span className="text-white font-bold">{match.uwu_stars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Destruction</span>
                          <span className="text-white font-bold">{match.uwu_percentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Enemy Stats */}
                    <div className="bg-gray-900/30 rounded-lg p-4">
                      <h3 className="text-gray-400 font-semibold mb-3">{match.opponent_clan_name}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Stars</span>
                          <span className="text-white font-bold">{match.enemy_stars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Destruction</span>
                          <span className="text-white font-bold">{match.enemy_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                    onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
                  >
                    {selectedMatch === match.id ? "Hide" : "View"} Player Performance
                    <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${selectedMatch === match.id ? "rotate-90" : ""}`} />
                  </Button>

                  {selectedMatch === match.id && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-white font-semibold mb-3">Player Performance</h4>
                      {match.player_performances?.map((performance, index) => (
                        <div key={index} className="bg-black/30 rounded-lg p-4 flex justify-between items-center">
                          <span className="text-white font-medium">{performance.players?.name}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Trophy className="h-4 w-4 text-yellow-400" />
                              <span className="text-white">{performance.stars}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4 text-purple-400" />
                              <span className="text-white">{performance.destruction_percentage}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {pastMatches?.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No past matches</h3>
                <p className="text-gray-500">Match results will appear here after completing clan wars</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastMatches;
