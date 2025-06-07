import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const links = [
    { path: "/", label: "Home" },
    { path: "/matches/scheduled", label: "Upcoming Matches" },
    { path: "/matches/past", label: "Past Matches" },
    { path: "/players/stats", label: "Player Stats" },
    { path: "/admin", label: "Admin" }
  ];

  return (
    <Collapsible open={false} className="md:hidden">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="fixed top-4 right-4 z-50">
          <Menu className="h-5 w-5" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="fixed top-0 right-0 h-screen w-64 bg-black/70 backdrop-blur-sm border-l border-purple-500/20 p-4">
          <div className="flex flex-col space-y-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors p-2 rounded-md hover:bg-purple-500/20"
              >
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
