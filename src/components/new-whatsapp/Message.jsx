import React from "react";

function Message({ msg }) {
  const align = msg.fromMe ? "justify-end" : "justify-start";
  const bgColor = msg.fromMe ? "bg-[#dcf8c6]" : "bg-white";
  const time = new Date(msg.timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Handle media messages
  const renderBody = () => {
    if (
      msg.media &&
      msg.media.mimetype &&
      msg.media.mimetype.startsWith("image/")
    ) {
      return (
        <div>
          <img
            src={`data:${msg.media.mimetype};base64,${msg.media.data}`}
            alt="Sent media"
            className="rounded-lg max-w-xs mb-1"
          />
          {msg.body && <p>{msg.body}</p>}
        </div>
      );
    }
    if (msg.hasMedia && !msg.media) {
      return (
        <p className="italic text-gray-500">
          [Media: Unsupported or not downloaded]
        </p>
      );
    }
    return <p>{msg.body}</p>;
  };

  return (
    <div className={`flex ${align} mb-2`}>
      <div className={`rounded-lg px-3 py-2 max-w-md shadow ${bgColor}`}>
        {renderBody()}
        <div className="text-right text-xs text-gray-500 mt-1">{time}</div>
      </div>
    </div>
  );
}

export default Message;
