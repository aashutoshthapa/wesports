
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Shield, Users, Calendar, Trophy, Plus } from "lucide-react";
import { PlayersManager } from "@/components/admin/PlayersManager";
import { ScheduledMatchesManager } from "@/components/admin/ScheduledMatchesManager";
import { MatchResultsManager } from "@/components/admin/MatchResultsManager";
import { PlayerPerformancesManager } from "@/components/admin/PlayerPerformancesManager";

const AdminDashboard = () => {
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
              <Link to="/matches/scheduled" className="text-gray-300 hover:text-purple-400 transition-colors">Scheduled</Link>
              <Link to="/matches/past" className="text-gray-300 hover:text-purple-400 transition-colors">Past Matches</Link>
              <Link to="/players/stats" className="text-gray-300 hover:text-purple-400 transition-colors">Player Stats</Link>
              <Link to="/admin" className="text-purple-400">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Manage your clan's data, matches, and player statistics</p>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-purple-500/20">
            <TabsTrigger value="players" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-600">
              <Trophy className="h-4 w-4 mr-2" />
              Match Results
            </TabsTrigger>
            <TabsTrigger value="performances" className="data-[state=active]:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Performances
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="mt-8">
            <PlayersManager />
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-8">
            <ScheduledMatchesManager />
          </TabsContent>
          
          <TabsContent value="results" className="mt-8">
            <MatchResultsManager />
          </TabsContent>
          
          <TabsContent value="performances" className="mt-8">
            <PlayerPerformancesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
