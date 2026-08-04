const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

const missingState = `
  const [sessionStep, setSessionStep] = useState<'initial' | 'phone' | 'code' | '2fa' | 'details'>('initial');
  const [botCode, setBotCode] = useState('');
  const [tgSessionString, setTgSessionString] = useState('');
`;

code = code.replace(
  "const [addModal, setAddModal] = useState(false);",
  "const [addModal, setAddModal] = useState(false);" + missingState
);

fs.writeFileSync('src/pages/Admin.tsx', code);
