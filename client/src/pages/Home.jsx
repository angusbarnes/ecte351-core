import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button.jsx";
import { LoginPanel } from "@/components/local/LoginPanel.jsx";
import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function HomePage() {
  const Quotes = [
    "Our cutting-edge devices revolutionize connectivity by seamlessly integrating into industrial systems, driving data-driven solutions that elevate efficiency and connectivity to unprecedented levels.",
    "With a focus on real-time data insights, our industrial grade smart sensors pave the way for transformative remote monitoring solutions, empowering businesses to make informed decisions from anywhere in the world.",
    "Embrace the future of connectivity as our IoT devices redefine industry standards, delivering data-driven solutions that facilitate remote monitoring, ensuring seamless operations and enhanced decision-making capabilities.",
    "Unlock the power of data with our revolutionary embedded telementry units, fostering a new era of connectivity that empowers businesses to thrive through efficient remote monitoring and data-driven decision-making.",
    "Experience unparalleled connectivity and remote monitoring capabilities with our IoT devices, spearheading a data-driven revolution that propels industries towards heightened efficiency and innovation.",
  ];

  const getQuote = () => {
    const randomIndex = Math.floor(Math.random() * Quotes.length);
    return Quotes[randomIndex];
  };

  const [quote, setQuote] = useState(getQuote());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setQuote(getQuote());
    }, 4200);

    return () => clearInterval(intervalId);
  });

  return (
    <>
      <div className="md:hidden">
        <img
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <img
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          to="/examples/authentication"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <div className="relative hidden h-screen flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-primary"></div>
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
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;{quote}&rdquo;</p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <Outlet></Outlet>

            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
