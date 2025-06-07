
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Target, Calendar } from "lucide-react";

interface PlayerDetailModalProps {
  player: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDetailModal = ({ player, isOpen, onClose }: PlayerDetailModalProps) => {
  if (!player) return null;

  const getStarRating = (avgStars: number) => {
    if (avgStars >= 2.8) return { color: "text-green-400", rating: "Excellent" };
    if (avgStars >= 2.5) return { color: "text-yellow-400", rating: "Good" };
    if (avgStars >= 2.0) return { color: "text-orange-400", rating: "Average" };
    return { color: "text-red-400", rating: "Needs Improvement" };
  };

  const { color: overallColor, rating: overallRating } = getStarRating(player.overall.avg_stars);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-purple-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-3">
            <Trophy className="h-7 w-7 text-purple-400" />
            {player.name}
            <Badge className={`${overallColor} ml-2`}>
              {overallRating}
            </Badge>
          </DialogTitle>
          <p className="text-gray-400">{player.player_tag}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Stats Card */}
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Overall Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${overallColor}`}>
                    {player.overall.avg_stars}
                  </div>
                  <div className="text-gray-400 text-sm">Average Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {player.overall.total_matches}
                  </div>
                  <div className="text-gray-400 text-sm">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {player.overall.avg_destruction}%
                  </div>
                  <div className="text-gray-400 text-sm">Avg Destruction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {player.overall.three_stars}
                  </div>
                  <div className="text-gray-400 text-sm">Three Stars</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Star Distribution */}
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Attack Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white ml-2">Three Stars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(player.overall.three_stars / player.overall.total_matches) * 100}px` }}></div>
                    <span className="text-white font-bold min-w-[2rem]">{player.overall.three_stars}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-600" />
                    <span className="text-white ml-2">Two Stars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-600 h-3 rounded-full" style={{ width: `${(player.overall.two_stars / player.overall.total_matches) * 100}px` }}></div>
                    <span className="text-white font-bold min-w-[2rem]">{player.overall.two_stars}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-600" />
                    <Star className="h-4 w-4 text-gray-600" />
                    <span className="text-white ml-2">One Star</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-600 h-3 rounded-full" style={{ width: `${(player.overall.one_star / player.overall.total_matches) * 100}px` }}></div>
                    <span className="text-white font-bold min-w-[2rem]">{player.overall.one_star}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Performances */}
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Recent Performances
              </h3>
              <div className="space-y-3">
                {player.player_performances?.slice(0, 5).map((performance: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">
                        vs {performance.match_results?.opponent_clan_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(performance.match_results?.match_date).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < performance.stars ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-purple-400 font-bold">{performance.destruction_percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
