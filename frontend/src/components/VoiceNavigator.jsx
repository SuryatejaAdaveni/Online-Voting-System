import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import "./VoiceNavigator.css";

const VoiceNavigator = ({ onCommand }) => {
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
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      if (onCommand) onCommand(transcript);
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
  }, [onCommand]);

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
