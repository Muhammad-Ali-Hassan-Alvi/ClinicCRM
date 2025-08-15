// EmailComposer.jsx (FINAL - The Child Component)
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Paperclip, Send } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

// Helper function to create the raw email string for the Gmail API
function createRawEmail({ to, from, subject, body }) {
  const email = [
    `Content-Type: text/plain; charset="UTF-8"`,
    "MIME-Version: 1.0",
    "Content-Transfer-Encoding: 7bit",
    `to: ${to}`,
    `from: ${from}`,
    `subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "",
    body,
  ].join("\n");
  return btoa(email).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const EmailComposer = ({
  isOpen,
  onOpenChange,
  accessToken,
  fromEmail,
  onEmailSent,
}) => {
  const { toast } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { t } = useLocale();

  // Reset the form when it opens
  useEffect(() => {
    if (isOpen) {
      setTo("");
      setSubject("");
      setBody("");
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!accessToken) {
      return toast({
        title: "Not connected",
        description: "Please connect to Gmail first.",
        variant: "destructive",
      });
    }
    if (!to || !subject || !body) {
      return toast({
        title: "Missing fields",
        description: "Please fill all fields.",
        variant: "destructive",
      });
    }

    setIsSending(true);
    const emailData = { to, from: fromEmail, subject, body };
    const rawEmail = createRawEmail(emailData);

    try {
      const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: rawEmail }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error.message || "Failed to send email.");
      }

      toast({
        title: "Email Sent!",
        description: "Your email has been successfully sent.",
      });
      onOpenChange(false); // Close the composer
      if (onEmailSent) {
        onEmailSent(); // Tell the parent to refresh the sent items list
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-transparent border-none max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold gradient-text">
              {t("Email Compose Title")}
            </h2>
          </div>
          <div className="p-6 flex-grow space-y-4 overflow-y-auto">
            <div className="flex items-center gap-4">
              <label className="w-16 text-right text-sm font-medium text-gray-600">
                {t("From")}:
              </label>
              <div className="flex-1 p-2 border rounded-md bg-gray-100 text-gray-700">
                {fromEmail || "Not Connected"}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-16 text-right text-sm font-medium text-gray-600">
                {t("To")}:
              </label>
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={t("To Placeholder")}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-16 text-right text-sm font-medium text-gray-600">
                {t("Subject")}:
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("Subject Placeholder")}
              />
            </div>
            <div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("Email Body Placeholder")}
                rows={12}
                className="min-h-[250px]"
              />
            </div>
          </div>
          <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-2xl">
            <Button variant="ghost" disabled>
              <Paperclip className="w-4 h-4 mr-2" />
              {t("Attach")}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : t("Send")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailComposer;

// 215088288728-bidv6bmfc9gip7sgbc5lr93fr4i2215n.apps.googleusercontent.com
// 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

// client web 2
// 215088288728-q1uutkk9u1d0aq8jbtnicbdq3vj3o47v.apps.googleusercontent.com
// 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
