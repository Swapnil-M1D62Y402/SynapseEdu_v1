import { Button } from "@/components/ui/button";
import { Send, MessageCircle, User, Sun, Moon, Bell, Award, LogOut, Calendar, Hourglass } from "lucide-react";
import synapseLogoUrl from "@/public/synapseedu_logo.jpeg";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "next-themes";
import Pomodoro from "./Pomodoro";
import { useState } from "react";

export default function Navbar() {
  const { setTheme, theme } = useTheme();
  const [setTimer, setShowTimer] = useState(false);

  return (
    <header className="bg-purple-100 border-b border-border z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* ...existing code... */}
        <div className="flex items-center space-x-2">
        <Link href="/home" className="flex items-center space-x-2">
          <Image src={synapseLogoUrl} alt="SynapseEdu" className="h-8 w-8" />
          <span className="text-xl font-bold text-gradient">SynapseEdu</span>
        </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Calendar className="h-4 w-4 mr-2" />
            Calender
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <MessageCircle className="h-4 w-4 mr-2" />
            Feedback
          </Button>
          <Button onClick={() => setShowTimer(true) } variant="outline" size="sm" className="hidden sm:flex" >
            <Hourglass className="h-4 w-4 mr-2" />
            Pomodoro
          </Button>
          {setTimer && <Pomodoro onClose={() => setShowTimer(false)}/>}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center p-0">
                <User className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/achievements" className="cursor-pointer">
                  <Award className="mr-2 h-4 w-4" />
                  Achievements
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}