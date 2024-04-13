import { Button } from "../components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon, PersonIcon, BellIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Outlet } from "react-router-dom";
import { useTheme } from "../context/theme";
import { Breadcrumb } from "@/components/ui/breadcrumb"

function DropdownMenuDemo() {
  const {setTheme} = useTheme();
  const {logout} = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <PersonIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {logout()}}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardPage() {
  const { logout, fetchWithAuth } = useAuth();
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchWithAuth("http://localhost:3000/api/authtest", { method: "GET" });
      console.log(data);
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen">
        <nav className="w-full h-16 py-4 px-10 bg-primarydarktone flex justify-between text-primarydarktone-foreground">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Generic Company
            <Separator orientation="vertical" className="mx-4" />
            <p>Cloud Tennent</p>
          </div>
          <div>
            <DropdownMenuDemo />
            <Button variant="ghost" size="icon">
              <BellIcon className="h-5 w-5" />
            </Button>
          </div>
        </nav>
        <div className="flex-1 flex h-screen bg-background">
          <div
            id="sidebar"
            className="flex flex-col justify-between md:min-w-48 h-full lg:min-w-96 p-4 text-foreground"
          >
            <div>
              <Alert>
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>This is a generic alert style.</AlertDescription>
              </Alert>
              <Separator className="my-4" />
              <Button variant="outline" size="wide">
                Test
              </Button>
            </div>
            <footer className="justify-self-end">
              <Separator className="my-4" />
              <Button variant="outline" onClick={() => logout()}>
                Logout
              </Button>
            </footer>
          </div>
          <Separator orientation="vertical" className="h-full mr-4" />
          <div id="main" className="bg-background p-4 w-full ">
            <Breadcrumb></Breadcrumb>
            <Outlet></Outlet>
          </div>
        </div>
      </div>
    </>
  );
}
