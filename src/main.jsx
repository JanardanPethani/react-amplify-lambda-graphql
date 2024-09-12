import ReactDOM from 'react-dom/client';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify'

import './index.css';
import App from './App';
import awsconfig from './aws-exports'

Amplify.configure(awsconfig)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
