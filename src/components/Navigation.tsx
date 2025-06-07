import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const links = [
    { path: "/", label: "Home", icon: <Menu className="h-4 w-4" /> },
    { path: "/matches/scheduled", label: "Scheduled" },
    { path: "/matches/past", label: "Past Matches" },
    { path: "/players/stats", label: "Player Stats" },
    { path: "/admin", label: "Admin" }
  ];

  return (
    <Collapsible open={false} className="md:hidden">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="fixed top-4 left-4 z-50">
          <Menu className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="fixed top-0 left-0 h-screen w-64 bg-black/40 backdrop-blur-sm border-r border-purple-500/20 p-4">
          <div className="flex flex-col space-y-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors p-2 rounded-md"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
