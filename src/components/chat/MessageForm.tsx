import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface MessageFormProps {
  chatId: string;
  db: any;
}

const MessageForm = ({ chatId, db }: MessageFormProps) => {
  const [message, setMessage] = useState("");
  const user = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;

    // send message to the server
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId));
    const messages = await getDocs(q);

    // Create a new message document if the chat has no messages
    if (messages.empty) {
      await setDoc(doc(messagesRef), {
        chatId: chatId,
        messages: [
          {
            content: message,
            sender: user.user?.uid,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } else {
      // Add the message to the existing messages
      const chatDoc = messages.docs[0];
      const chatData = chatDoc.data();
      await updateDoc(chatDoc.ref, {
        messages: [
          ...chatData.messages,
          {
            content: message,
            sender: user.user?.uid,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    // clear the input field
    setMessage("");
  };

  return (
    <form
      onSubmit={(e) => {
        if (!chatId) {
          e.preventDefault();
          // Print an error message to user
          console.error("No chat ID provided");
          return;
        }
        handleSubmit(e);
      }}
      className="flex items-center p-4 bg-gray-100 rounded-lg shadow-md"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow p-2 mr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message..."
      />
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send
      </button>
    </form>
  );
};

export default MessageForm;
