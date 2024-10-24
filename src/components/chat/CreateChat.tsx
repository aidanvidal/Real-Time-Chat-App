import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  Firestore,
} from "firebase/firestore";

interface CreateChatDialogProps {
  users: any[];
  onCreateChat: (selectedUserIds: any, title: string) => Promise<void>;
  db: Firestore;
}

const CreateChatDialog = ({
  users,
  onCreateChat,
  db,
}: CreateChatDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatTitle, setChatTitle] = useState("");
  const [isExistingChat, setIsExistingChat] = useState(false);
  const user = useAuth();

  const handleUserToggle = (userId: any) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = () => {
    if (selectedUsers.length > 0 && chatTitle.trim() && !isExistingChat) {
      onCreateChat(selectedUsers, chatTitle);
      setIsOpen(false);
      setSelectedUsers([]);
      setChatTitle("");
    }
  };

  const checkForExistingChat = async (users: string[]) => {
    if (!users.length) return false;

    try {
      const membersRef = collection(db, "members");
      const q = query(
        membersRef,
        where("members", "array-contains-any", [users[0], user.user?.uid])
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setIsExistingChat(false);
        return;
      }

      let exists = false;
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        const members = data.members as string[];
        if (
          members.length === users.length + 1 &&
          members.every((m) => users.includes(m) || m === user.user?.uid)
        ) {
          exists = true;
        }
      });

      setIsExistingChat(exists);
    } catch (error) {
      console.error("Error checking for existing chat:", error);
      setIsExistingChat(false);
    }
  };

  useEffect(() => {
    if (selectedUsers.length > 0) {
      checkForExistingChat(selectedUsers);
    } else {
      setIsExistingChat(false);
    }
  }, [selectedUsers]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Create New Chat
      </button>
    );
  }

  const isDisabled =
    selectedUsers.length === 0 || !chatTitle.trim() || isExistingChat;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create New Chat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            placeholder="Chat Title"
            className="w-full px-3 py-2 border rounded-lg mb-4"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {users?.map((user: any) => (
            <div
              key={user.uid}
              className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b"
              onClick={() => handleUserToggle(user.uid)}
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.uid)}
                onChange={() => {}}
                className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">
                {user.displayName || user.email}
              </span>
              <span className="text-xs text-gray-500">
                {user.online ? "Online" : "Offline"}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {selectedUsers.length} users selected
              {isExistingChat && (
                <span className="text-red-500 flex">Chat already exists</span>
              )}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-lg ${
                  isDisabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChatDialog;
