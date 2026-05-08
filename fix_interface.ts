import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(`export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
interface ChatSession {
  id: string;
  date: string;
  fileName: string;
  documentText: string;
  messages: ChatMessage[];
}`, `export interface ChatSession {
  id: string;
  date: string;
  fileName: string;
  documentText: string;
  messages: ChatMessage[];
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');`);

fs.writeFileSync('src/App.tsx', content);
