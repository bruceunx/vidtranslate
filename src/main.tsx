import ReactDOM from 'react-dom/client';
import App from './App';
import DataProvider from './store/DataContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <DataProvider>
    <App />
  </DataProvider>
);
