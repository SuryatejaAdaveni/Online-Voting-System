import React, { useRef, useState, useEffect, useCallback } from "react";
import VoiceNavigator from "./components/VoiceNavigator";
import Candidates from "./pages/Candidates";
import { toast } from "react-toastify";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ProfilePage from "./pages/ProfilePage";
// import Error from "./pages/ErrorPage";

const App = () => {
  const candidatesRef = useRef();
  const capturePhotoRef = useRef();
  const verifyVoteRef = useRef();

  const [candidates, setCandidates] = useState([]);
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userData")) || { role: "voter" }
  );
  const [loadingVote, setLoadingVote] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/candidates/getCandidates"
      );
      const data = await response.json();
      if (data.candidates) setCandidates(data.candidates);
    } catch {
      toast.error("Failed to load candidates");
    }
  }, []);

  useEffect(() => {
    if (userData._id) {
      const votedId = localStorage.getItem(`votedCandidateId_${userData._id}`);
      if (votedId) setVotedCandidateId(votedId);
    }
    if (userData.role === "voter") fetchCandidates();
  }, [userData._id, userData.role, fetchCandidates]);

  // Full voice command handler including navigation and voting
  const handleVoiceCommand = (command) => {
    const lower = command.toLowerCase().trim();

    console.log("[Voice command received]", command);

    if (lower.startsWith("vote ")) {
      const partyName = lower.slice("vote ".length).trim();
      handleVoteByParty(partyName);
      return;
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

  // Vote by party name
  const handleVoteByParty = (partyName) => {
    if (!candidatesRef.current) return;
    const candidate = candidatesRef.current.find(
      (c) =>
        c.party.toLowerCase().replace(/\s+/g, "") ===
        partyName.toLowerCase().replace(/\s+/g, "")
    );
    if (candidate) {
      voteForCandidate(candidate._id);
    } else {
      toast.error(`Party named "${partyName}" not found`);
    }
  };

  // API call to vote for candidate
  const voteForCandidate = async (candidateId) => {
    setLoadingVote(true);
    try {
      const response = await fetch("http://localhost:3000/api/votes/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, voterId: userData._id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Vote cast successfully!");
        setVotedCandidateId(candidateId);
        localStorage.setItem(`votedCandidateId_${userData._id}`, candidateId);
      } else {
        toast.error(data.message || "Failed to cast vote.");
      }
    } catch {
      toast.error("An error occurred while voting.");
    }
    setLoadingVote(false);
  };

  // Trigger capture photo in candidates component
  const handleCapturePhoto = () => {
    if (capturePhotoRef.current) capturePhotoRef.current();
  };

  // Trigger verify & vote in candidates component
  const handleVerifyAndVote = () => {
    if (verifyVoteRef.current) verifyVoteRef.current();
  };

  return (
    <BrowserRouter>
      <VoiceNavigator
        onCommand={handleVoiceCommand}
        onVote={handleVoteByParty}
        onCapture={handleCapturePhoto}
        onVerifyVote={handleVerifyAndVote}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        <Route
          path="/candidates"
          element={
            <Candidates
              ref={candidatesRef}
              setCandidates={setCandidates}
              capturePhotoRef={capturePhotoRef}
              verifyVoteRef={verifyVoteRef}
              loadingVote={loadingVote}
              votedCandidateId={votedCandidateId}
              voteForCandidate={voteForCandidate}
              userData={userData}
              setUserData={setUserData}
            />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* <Route path="*" element={<Error />} /> */}
      </Routes>
      {/* <Footer /> */}
    </BrowserRouter>
  );
};

export default App;
