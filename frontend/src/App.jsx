import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Candidates from "./pages/Candidates";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
// import Error from "./pages/ErrorPage";
// import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import Logout from "./pages/Logout";
import ProfilePage from "./pages/ProfilePage";
import VoiceNavigator from "./components/VoiceNavigator"; // Import the VoiceNavigator component

const App = () => {
  const handleVoiceCommand = (command) => {
    const lower = command.toLowerCase().trim();

    console.log("[Voice command received]", command);

    // Handle vote for party command first
    if (lower.startsWith("vote ")) {
      const partyName = lower.slice("vote ".length).trim();
      handleVoiceVote(partyName);
      return; // stop further checks
    }

    if (lower.includes("go to home") || lower.includes("home page")) {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (
      lower.includes("show results") ||
      lower.includes("results page")
    ) {
      window.history.pushState({}, "", "/results");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (
      lower.includes("open profile") ||
      lower.includes("my profile") ||
      lower.includes("profile page")
    ) {
      window.history.pushState({}, "", "/profile");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (
      lower.includes("open dashboard") ||
      lower.includes("dashboard page") ||
      lower.includes("go to dashboard")
    ) {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (
      lower.includes("show candidates") ||
      lower.includes("candidates page") ||
      lower.includes("view candidates") ||
      lower.includes("candidates")
    ) {
      window.history.pushState({}, "", "/candidates");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (lower.includes("register") || lower.includes("sign up")) {
      window.history.pushState({}, "", "/register");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (lower.includes("login") || lower.includes("sign in")) {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (lower.includes("logout") || lower.includes("sign out")) {
      window.history.pushState({}, "", "/logout");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else if (lower.includes("footer") || lower.includes("go to footer")) {
      document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" });
    } else if (
      lower.includes("navbar") ||
      lower.includes("go to navbar") ||
      lower.includes("top menu")
    ) {
      document.querySelector(".navbar")?.scrollIntoView({ behavior: "smooth" });
    } else {
      toast.error("Voice command not recognized.");
    }
  };
  const [candidates, setCandidates] = useState([]);

  // Fetch candidates from backend API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("/api/candidates"); // make sure route calls getCandidates controller
        const data = await response.json();
        if (data.candidates) {
          setCandidates(data.candidates);
        }
      } catch (error) {
        toast.error("Failed to load candidates");
      }
    };
    fetchCandidates();
  }, []);

  // Vote for candidate by voice using party name
  const handleVoiceVote = (spokenParty) => {
    if (!spokenParty) return;

    const found = candidates.find(
      (c) =>
        c.party.toLowerCase().replace(/\s+/g, "") ===
        spokenParty.toLowerCase().replace(/\s+/g, "")
    );

    if (found) {
      voteForCandidate(found._id);
    } else {
      toast.error(`Party named "${spokenParty}" not found`);
    }
  };

  // Example vote candidate function, replace with your API call
  const voteForCandidate = async (candidateId) => {
    try {
      const response = await fetch("/api/votes/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      if (!response.ok) {
        throw new Error("Vote submission failed");
      }

      const data = await response.json();

      toast.success(data.message || "Vote cast successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to cast vote");
    }
  };

  return (
    <>
      <BrowserRouter>
        <VoiceNavigator onCommand={handleVoiceCommand} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/results" element={<Results />} />
          <Route path="/candidates" element={<Candidates />} />
          {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
};

export default App;
