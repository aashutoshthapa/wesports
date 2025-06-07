
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, Calendar, Trophy, Plus, LogOut } from "lucide-react";
import { PlayersManager } from "@/components/admin/PlayersManager";
import { ScheduledMatchesManager } from "@/components/admin/ScheduledMatchesManager";
import { MatchResultsManager } from "@/components/admin/MatchResultsManager";
import { PlayerPerformancesManager } from "@/components/admin/PlayerPerformancesManager";
import { Navigation } from "@/components/Navigation";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                UwU eSports
              </span>
            </Link>
            <div className="hidden md:flex flex-col space-y-2">
              <Link to="/" className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md">
                Home
              </Link>
              <Link to="/matches/scheduled" className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md">
                Scheduled
              </Link>
              <Link to="/matches/past" className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md">
                Past Matches
              </Link>
              <Link to="/players/stats" className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md">
                Player Stats
              </Link>
              <Link to="/admin" className="text-purple-400 px-3 py-2 rounded-md">
                Admin
              </Link>
            </div>
            <div className="md:hidden">
              <Navigation />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-purple-400 md:h-8 md:w-8" />
              <h1 className="text-2xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors mt-4 md:mt-0"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Logout</span>
            </button>
          </div>
          <p className="text-sm md:text-base text-gray-400">Manage your clan's data, matches, and player statistics</p>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-black/40 border border-purple-500/20">
            <TabsTrigger value="players" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Players</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Scheduled</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-600">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Match Results</span>
            </TabsTrigger>
            <TabsTrigger value="performances" className="data-[state=active]:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm md:text-base">Performances</span>
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
