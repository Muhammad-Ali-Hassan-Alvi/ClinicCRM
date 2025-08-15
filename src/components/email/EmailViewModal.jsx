// src/components/email/EmailViewModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper to decode the Base64url body from the Gmail API
const decodeBase64url = (str) => {
  try {
    return decodeURIComponent(
      atob(str.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (e) {
    console.error("Base64url decoding failed:", e);
    return "Could not decode email body.";
  }
};

// Helper to find the plain text part of the email
const getEmailBody = (payload) => {
  if (payload.body.data) {
    return decodeBase64url(payload.body.data);
  }
  if (payload.parts) {
    const textPart = payload.parts.find(
      (part) => part.mimeType === "text/plain"
    );
    if (textPart && textPart.body.data) {
      return decodeBase64url(textPart.body.data);
    }
  }
  return "No readable content found.";
};

const EmailViewModal = ({ isOpen, onOpenChange, emailId, accessToken }) => {
  const [emailContent, setEmailContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmailDetails = async () => {
      if (!emailId || !accessToken) return;

      setLoading(true);
      setEmailContent(null);
      try {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch email details.");
        }
        const data = await res.json();

        // Parse headers and body
        const headers = new Map(
          data.payload.headers.map((h) => [h.name.toLowerCase(), h.value])
        );
        const body = getEmailBody(data.payload);

        setEmailContent({
          subject: headers.get("subject") || "(No Subject)",
          from: headers.get("from"),
          to: headers.get("to"),
          date: headers.get("date"),
          body: body,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        onOpenChange(false); // Close modal on error
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchEmailDetails();
    }
  }, [isOpen, emailId, accessToken, toast, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold truncate">
              {loading ? "Loading..." : emailContent?.subject}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              To: {emailContent?.to}
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            {/* <X className="h-4 w-4" /> */}
          </Button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
              {emailContent?.body}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailViewModal;
