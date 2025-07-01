import React, { useEffect } from "react";
import { User } from "@/types";

interface TelegramLoginProps {
  onAuth: (userData: TelegramUser) => void;
  botName: string;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth?: (user: TelegramUser) => void;
    };
  }
}

const TelegramLogin: React.FC<TelegramLoginProps> = ({ onAuth, botName }) => {
  useEffect(() => {
    // Create callback function
    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramUser) => {
        onAuth(user);
      },
    };

    // Create script element for Telegram Login Widget
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    // Find container and append script
    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
      delete window.TelegramLoginWidget;
    };
  }, [onAuth, botName]);

  return (
    <div
      id="telegram-login-container"
      className="flex justify-center items-center"
    />
  );
};

export default TelegramLogin;
