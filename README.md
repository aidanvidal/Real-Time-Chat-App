# Chat Application

## Description

This project is a real-time chat application built using React and Firebase. It features user authentication, chat creation, direct messaging, and group chat capabilities. The application allows users to sign in or sign up and engage in chats with other users, displaying messages in real-time and indicating the online status of users.

## Installation and Setup

To set up this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```

2. **Install dependencies:**
   Ensure you have Node.js and npm installed, then run:
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore and Authentication (Email/Password) in your Firebase project.
   - Replace the Firebase configuration in the `firebase.js` file in the `src` directory with your project's configuration.

4. **Run the application:**
   ```bash
   npm start
   ```

Now your application should be running on `http://localhost:3000`.

## Usage

1. **Sign Up / Sign In:**
   - Navigate to the main page to create a new account or sign in with an existing account.

2. **Chat Interface:**
   - Once logged in, you will be taken to the chat dashboard where you can view available chats on the left sidebar.
   - Click on a chat to view messages, send messages, and see which users are online.
   - Use the button to create a new chat with one or more users.

3. **Sending Messages:**
   - In any chat, use the message input field to send messages.
   - Messages are displayed with the sender's email and the timestamp.

4. **Sign Out:**
   - You can sign out at any time by clicking the "Sign Out" button.

## Dependencies

This project uses the following dependencies:

- `react`
- `react-dom`
- `react-router-dom`
- `firebase`
- `@firebase/firestore` (for real-time data handling)

Ensure these packages are included in your `package.json` file, and they will be installed during the `npm install` step.

## Other Information

- The project is structured to follow a modular approach with different components for authentication, chat functionality, and message handling.
- It utilizes Firebase for real-time data operations including user authentication and Firestore for message storage.
- Feel free to extend the functionalities such as adding more user features, improving the UI, and implementing notification systems.

## TODO

- Create a more polished front-end for the chat interface.
- Implement message history retrieval from the database.
- Enhance user experience with notifications for new messages.

## License

This project is open-source and available under the MIT License.
