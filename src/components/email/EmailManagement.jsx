// EmailManagement.jsx (FINAL - With all logic restored)
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Edit, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmailList from "@/components/email/EmailList";
import EmailComposer from "@/components/email/EmailComposer";
import EmailViewModal from "@/components/email/EmailViewModal"; // The new component
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/components/ui/use-toast";
import { CLIENT_ID, SCOPES } from "../../main";

const parseHeaders = (headers) => {
  const headerMap = new Map(
    headers.map((h) => [h.name.toLowerCase(), h.value])
  );
  const to = headerMap.get("to") || "";
  const subject = headerMap.get("subject") || "(No Subject)";
  const date = headerMap.get("date") || new Date().toISOString();
  const nameMatch = to.match(/(.*)<.*>/);
  const displayName = nameMatch ? nameMatch[1].trim().replace(/"/g, "") : to;
  return { to, subject, date, displayName: displayName || "Unknown" };
};

const EmailManagement = () => {
  const { folder = "sent" } = useParams();
  const navigate = useNavigate(); // useNavigate is imported but not used, can be removed if not needed for folders
  const { t } = useLocale();
  const { toast } = useToast();

  const [emails, setEmails] = useState([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [viewingEmailId, setViewingEmailId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const tokenClientRef = useRef(null);

  // ===================================================================
  // *** THE FIX IS HERE: Restored logic for fetching data ***
  // ===================================================================
  async function loadSentEmails() {
    if (!accessToken) return;
    toast({ title: "Loading Sent Emails..." });
    try {
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=SENT&maxResults=20`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const listData = await listRes.json();
      if (!listData.messages) {
        setEmails([]);
        return;
      }
      const details = await Promise.all(
        listData.messages.map(async (m) => {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=To&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          return detailRes.json();
        })
      );
      const formattedEmails = details.map((e) => {
        const headers = parseHeaders(e.payload.headers);
        return {
          id: e.id,
          folder: "sent",
          subject: headers.subject,
          from: headers.displayName,
          date: headers.date,
          snippet: e.snippet,
          read: true,
        };
      });
      setEmails(formattedEmails);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load sent emails.",
        variant: "destructive",
      });
    }
  }

  async function getProfileInfo(token) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user info.");
      const data = await res.json();
      setUserEmail(data.email);
    } catch (e) {
      toast({
        title: "Authentication Error",
        description: "Could not verify your email address.",
        variant: "destructive",
      });
      setAccessToken(null); // Invalidate the token if profile info fails
    }
  }

  // ===================================================================
  // *** THE FIX IS HERE: Restored authentication logic ***
  // ===================================================================
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            return toast({
              title: "Login Error",
              description: tokenResponse.error,
              variant: "destructive",
            });
          }
          if (tokenResponse.access_token) {
            const token = tokenResponse.access_token;
            setAccessToken(token);
            getProfileInfo(token);
            toast.success("Gmail connected successfully!");
          }
        },
      });
    }
  }, [toast]); // Add toast to dependency array as it's used inside

  useEffect(() => {
    if (accessToken) {
      loadSentEmails();
    }
  }, [accessToken]);

  const connectGmail = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: "consent" });
    }
  };

  const handleSelectEmail = (email) => {
    setViewingEmailId(email.id);
    setIsViewModalOpen(true);
  };

  const folders = [{ id: "sent", name: t("Sent"), icon: Send }];
  const filteredEmails = emails
    .filter((email) => email.folder === folder)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
      <EmailComposer
        isOpen={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        accessToken={accessToken}
        fromEmail={userEmail}
        onEmailSent={loadSentEmails}
      />

      <EmailViewModal
        isOpen={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        emailId={viewingEmailId}
        accessToken={accessToken}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-60 border-r border-gray-200 bg-white shadow-sm p-4 flex flex-col"
      >
        <Button
          onClick={() => setIsComposerOpen(true)}
          disabled={!accessToken}
          className="mb-6 flex items-center justify-center gap-2 font-medium shadow hover:shadow-md transition-all"
        >
          <Edit className="w-4 h-4" /> {t("Email Compose Title")}
        </Button>
        <nav className="space-y-2">{/* Folder buttons can go here */}</nav>
      </motion.div>

      {/* Email List */}
      <div className="w-96 border-r border-gray-200 bg-white">
        <EmailList emails={filteredEmails} onSelectEmail={handleSelectEmail} />
      </div>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6">
        <Mail className="w-24 h-24 mb-4 text-gray-300" />
        <h2 className="text-2xl font-semibold mb-1">Welcome to your Inbox</h2>
        <p className="text-gray-400 text-sm">
          Connect your account to send and receive emails.
        </p>
        {!accessToken ? (
          <Button
            onClick={connectGmail}
            className="mt-6 px-6 py-2 rounded-lg shadow hover:shadow-md transition-all"
          >
            Connect Gmail
          </Button>
        ) : (
          <Button
            onClick={loadSentEmails}
            className="mt-6 px-6 py-2 rounded-lg shadow hover:shadow-md transition-all"
          >
            Refresh Sent Items
          </Button>
        )}
      </main>
    </div>
  );
};

export default EmailManagement;
