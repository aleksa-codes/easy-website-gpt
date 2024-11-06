# Easy WebsiteGPT 🤖

Easy WebsiteGPT is a Chrome extension that allows you to chat with any webpage using OpenAI's GPT model. Simply install the extension, add your OpenAI API key, and start asking questions about the content of any webpage you're viewing.

![Easy WebsiteGPT Demo](demo.gif)

## ✨ Features

- 🔍 Chat with any webpage using OpenAI's GPT model
- 💬 Real-time streaming responses
- 🎨 Beautiful and responsive UI with animations
- 💾 Local storage for chat history and settings
- 📱 Compact and user-friendly interface
- 🔄 Conversation reset functionality
- ⚙️ Advanced settings page

## 🛠️ Tech Stack

- **Frontend Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Markdown Rendering**: React Markdown
- **API Integration**: OpenAI API
- **Build Tool**: Vite
- **Extension Framework**: Chrome Extensions API

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/aleksa-codes/easy-website-gpt.git
cd easy-website-gpt
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Build the extension:

```bash
npm run build
# or
yarn build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" in the top left
   - Select the `dist` folder from the project directory

### Configuration

1. Get your OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys)
2. Click the extension icon in Chrome
3. Open settings (gear icon)
4. Enter your OpenAI API key
5. Click "Save Key"
6. Start chatting with any webpage!

## 💡 Usage

1. Navigate to any webpage you want to chat about
2. Click the Easy WebsiteGPT extension icon
3. Type your question in the input field
4. Press Enter or click the Send button
5. Receive AI-powered responses based on the page content

### Features in Detail

- **Smart Content Processing**: Automatically extracts and processes relevant content from webpages
- **Streaming Responses**: See the AI's response in real-time as it's being generated
- **Chat History**: Conversations are saved per webpage and persist between sessions
- **Message Limit**: Maximum of 20 messages per conversation to ensure optimal performance
- **Reset Conversation**: Clear the current conversation with one click
- **Advanced Settings**: Configure your API key and other settings in the options page

## 🔒 Privacy & Security

- API keys are stored securely in Chrome's storage system
- Page content is processed locally before being sent to OpenAI
- No data is stored on external servers
- You have full control over your data with easy clear/reset options

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clear commit messages
- Add appropriate documentation
- Test your changes thoroughly
- Update the README if needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by <a href="https://github.com/aleksa-codes">aleksa.codes</a></p>
