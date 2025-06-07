
import { Trophy, Target, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { PlayerDetailModal } from "@/components/PlayerDetailModal";
import { useState } from "react";

const PlayerStats = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: playerStats, isLoading, error } = usePlayerStats();

  const getStarRating = (avgStars: number) => {
    if (avgStars >= 2.8) return { color: "text-green-400", rating: "Excellent" };
    if (avgStars >= 2.5) return { color: "text-yellow-400", rating: "Good" };
    if (avgStars >= 2.0) return { color: "text-orange-400", rating: "Average" };
    return { color: "text-red-400", rating: "Needs Improvement" };
  };

  const getMonthStats = (player: any, year: number, month: number) => {
    const performances = player.player_performances || [];
    
    const monthlyPerformances = performances.filter((p: any) => {
      const matchDate = new Date(p.match_results.match_date);
      return matchDate.getMonth() + 1 === month && matchDate.getFullYear() === year;
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

    return calculateStats(monthlyPerformances);
  };

  const handlePlayerClick = (player: any) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const PlayerStatsCard = ({ player, period, customStats }: { player: any, period: 'monthly' | 'overall' | 'custom', customStats?: any }) => {
    const stats = customStats || player[period];
    const { color, rating } = getStarRating(stats.avg_stars);
    
    return (
      <Card 
        className="bg-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all cursor-pointer"
        onClick={() => handlePlayerClick(player)}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-lg">{player.name}</CardTitle>
              <p className="text-gray-400 text-sm">{player.player_tag}</p>
            </div>
            <Badge className={`${color}`}>
              {rating}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Avg Stars</span>
                <span className={`font-bold ${color}`}>{stats.avg_stars}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Matches</span>
                <span className="text-white font-bold">{stats.total_matches}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Avg Destruction</span>
                <span className="text-purple-400 font-bold">{stats.avg_destruction}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <span className="text-white font-bold">{stats.three_stars}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-white font-bold">{stats.two_stars}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-gray-600" />
                  <Star className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-white font-bold">{stats.one_star}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (error) {
    console.error("Error loading player stats:", error);
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
              <Link to="/matches/past" className="text-gray-300 hover:text-purple-400 transition-colors">Past Matches</Link>
              <Link to="/players/stats" className="text-purple-400">Player Stats</Link>
              <Link to="/admin" className="text-gray-300 hover:text-purple-400 transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Player Statistics</h1>
          <p className="text-gray-400">Performance analytics for all clan members. Click on a player card for detailed stats.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white">Loading player statistics...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400">Error loading player stats. Please try again later.</div>
          </div>
        ) : (
          <>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-purple-500/20">
                <TabsTrigger value="monthly" className="data-[state=active]:bg-purple-600">
                  This Month
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-purple-600">
                  Custom Month
                </TabsTrigger>
                <TabsTrigger value="overall" className="data-[state=active]:bg-purple-600">
                  All Time
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playerStats?.map((player) => (
                    <PlayerStatsCard key={player.id} player={player} period="monthly" />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="mt-8">
                <div className="mb-6 flex gap-4 items-center">
                  <div>
                    <label className="text-white text-sm mb-2 block">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-32 bg-black/40 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-white text-sm mb-2 block">Month</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-40 bg-black/40 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playerStats?.map((player) => {
                    const customStats = getMonthStats(player, parseInt(selectedYear), parseInt(selectedMonth));
                    return (
                      <PlayerStatsCard 
                        key={player.id} 
                        player={player} 
                        period="custom" 
                        customStats={customStats}
                      />
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="overall" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playerStats?.map((player) => (
                    <PlayerStatsCard key={player.id} player={player} period="overall" />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Player Detail Modal */}
            <PlayerDetailModal 
              player={selectedPlayer}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        )}

        {playerStats?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No player data available</h3>
            <p className="text-gray-500">Player statistics will appear after matches are recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;
