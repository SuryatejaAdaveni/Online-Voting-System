import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import "./VoiceNavigator.css";

const VoiceNavigator = ({ onCommand, onVote, onCapture, onVerifyVote }) => {
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API not supported.");
      return;
    }
    recognition.current = new SpeechRecognition();
    recognition.current.lang = "en-US";
    recognition.current.interimResults = false;

    recognition.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();

      if (transcript.startsWith("vote ")) {
        const partyName = transcript.slice("vote ".length).trim();
        onVote && onVote(partyName);
        onCommand && onCommand(transcript);
      } else if (transcript.includes("capture photo")) {
        onCapture && onCapture();
        onCommand && onCommand(transcript);
      } else if (
        transcript.includes("verify and vote") ||
        transcript.includes("verify & vote")
      ) {
        onVerifyVote && onVerifyVote();
        onCommand && onCommand(transcript);
      } else {
        onCommand && onCommand(transcript);
      }

      setListening(false);
      recognition.current.stop();
    };

    recognition.current.onerror = () => {
      setListening(false);
      recognition.current.stop();
    };

    recognition.current.onend = () => {
      setListening(false);
    };

    return () => {
      if (recognition.current) recognition.current.stop();
    };
  }, [onCommand, onVote, onCapture, onVerifyVote]);

  const toggleListening = () => {
    if (listening) {
      recognition.current.stop();
      setListening(false);
    } else {
      recognition.current.start();
      setListening(true);
    }
  };

  return (
    <button
      className={`voice-navigator-fab${listening ? " listening" : ""}`}
      onClick={toggleListening}
      aria-label={
        listening ? "Stop voice navigation" : "Start voice navigation"
      }
      title={
        listening
          ? "Listening... Click to stop"
          : "Click to start voice navigation"
      }
    >
      <FaMicrophone />
    </button>
  );
};

export default VoiceNavigator;
