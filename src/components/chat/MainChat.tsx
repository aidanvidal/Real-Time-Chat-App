import { signOut } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  Timestamp,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import MessageForm from "./MessageForm";
import CreateChatDialog from "./CreateChat";

interface MainChatProps {
  auth: any;
  db: any;
}

const MainChat = ({ auth, db }: MainChatProps) => {
  const user = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<any>(null);
  interface User {
    uid: string;
    [key: string]: any;
  }
  interface Message {
    content: string;
    sender: string;
    timestamp: string;
  }
  interface ChatMember {
    name: string;
    uid: string;
  }
  // All users except the current user
  const [users, setUsers] = useState<User[]>([]);
  // All chats the user is a member of
  const [chats, setChats] = useState<{ id: string; [key: string]: any }[]>([]);
  const [loading, setLoading] = useState(true);
  // Members of the current chat
  const [members, setMembers] = useState<ChatMember[]>([]);
  // Messages in the current chat
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
        .filter((u) => u.uid !== user.user?.uid);
      setUsers(usersList);
    });

    const unsubscribeChats = onSnapshot(
      collection(db, "chats"),
      async (snapshot) => {
        // Get all chats where the user is a member using the members collection
        const q = query(
          collection(db, "members"),
          where("members", "array-contains", user.user?.uid)
        );
        const chatIdList = await getDocs(q).then((querySnapshot) => {
          return querySnapshot.docs.map((doc) => doc.data().chatId);
        });
        const chatsList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((chat) => chatIdList.includes(chat.id));
        setChats(chatsList);
        setLoading(false);
      }
    );

    // Get all members for the current chat and their email and uid
    const handleChatMembers = async () => {
      if (!chat) return;
      const q = query(
        collection(db, "members"),
        where("chatId", "==", chat.id)
      );
      const chatMembers = await getDocs(q).then((querySnapshot) => {
        return querySnapshot.docs.map((doc) => doc.data().members);
      });
      const memberList = chatMembers[0];
      const memberData = await Promise.all(
        memberList.map(async (m: string) => {
          const userRef = doc(db, "users", m);
          const userDoc = await getDoc(userRef);
          return {
            name: userDoc.data()?.email,
            uid: m,
          };
        })
      );
      setMembers(memberData);
    };

    // Handle receiving new messages in the current chat
    const unsubscribeMessages = onSnapshot(
      collection(db, "messages"),
      async (snapshot) => {
        if (!chat) return;
        const q = query(
          collection(db, "messages"),
          where("chatId", "==", chat.id)
        );
        const messagesList = await getDocs(q).then((querySnapshot) => {
          return querySnapshot.docs.map((doc) => doc.data());
        });
        const formattedMessagesList = messagesList.flatMap((msg) =>
          msg.messages.map((m: any) => ({
            content: m.content,
            sender: m.sender,
            timestamp: m.timestamp,
          }))
        );
        setMessages(formattedMessagesList);
      }
    );

    // Call handleChatMembers whenever chat changes
    handleChatMembers();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeChats();
      unsubscribeMessages();
    };
  }, [db, chat]);

  if (!user.user) {
    return <Navigate to="/" />;
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (user.user) {
        await updateDoc(doc(db, "users", user.user.uid), {
          online: false,
          lastSeen: Timestamp.now(),
        });
      }
      navigate("/");
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleCreateChat = async (selectedUserIds: any, title: string) => {
    try {
      // Create new chat document
      const selectedUserEmails =
        selectedUserIds.length > 1
          ? ""
          : users.find((u) => u.uid === selectedUserIds[0])?.email;
      const chatName =
        selectedUserIds.length > 1
          ? title
          : `${user.user?.email}${selectedUserEmails}`;

      const chatRef = await addDoc(collection(db, "chats"), {
        createdAt: serverTimestamp(),
        createdBy: user.user?.uid || "",
        updatedAt: serverTimestamp(),
        lastMessage: null,
        chatName,
        type: selectedUserIds.length > 1 ? "group" : "direct",
      });

      // Add chat members
      const members = [user.user?.uid || "", ...selectedUserIds];
      await addDoc(collection(db, "members"), {
        members,
        chatId: chatRef.id,
      });

      // Update local state
      setChat(chatRef);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const displayMessages = () => (
    <div className="messages-container overflow-y-auto max-h-[calc(100%-80px)] mb-4" ref={(el) => el && (el.scrollTop = el.scrollHeight)}>
      {messages.map((msg, i) => {
        const sender = members.find((m) => m.uid === msg.sender)?.name;
        return (
          <div
            key={i}
            className="message p-2 mb-2 rounded-lg bg-gray-100 shadow-sm"
          >
            <div className="message-content text-sm text-gray-800">
              {msg.content}
            </div>
            <div className="message-sender text-xs text-gray-500 mt-1">
              {sender}
            </div>
          </div>
        );
      })}
    </div>
  );

  const checkOnlineStatus = (email: string) => {
    return users.find((u) => u.email === email)?.online;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex h-screen">
        <div className="flex-1 bg-gray-100 p-4">
          <div className="chat-window h-full bg-white shadow-md rounded-lg p-4 overflow-y-auto relative">
            {chat && displayMessages()}
            <div className="absolute bottom-5 left-5 right-5">
              {chat && <MessageForm chatId={chat.id} db={db} />}
            </div>
          </div>
        </div>
        <div className="w-64 bg-gray-200 p-4 flex flex-col">
          <div className="chat-list flex-1 bg-white shadow-md rounded-lg p-4 overflow-y-auto mb-4 relative">
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => setChat(c)}
                className={`p-3 mb-2 rounded-lg cursor-pointer ${
                  c.id === chat?.id ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                {c.type === "group"
                  ? c.chatName
                  : c.chatName.replace(`${user.user?.email}`, "")}
                {c.type !== "group" && (
                  <span className="ml-2 text-xs text-gray-500">
                    {checkOnlineStatus(
                      c.chatName.replace(`${user.user?.email}`, "")
                    )
                      ? "Online"
                      : "Offline"}
                  </span>
                )}
              </div>
            ))}
            <div className="absolute bottom-5 left-5 right-5">
              <CreateChatDialog
                users={users}
                onCreateChat={handleCreateChat}
                db={db}
              />
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainChat;
