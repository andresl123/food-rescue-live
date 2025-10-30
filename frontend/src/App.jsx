import "./App.css";
import { JobDataProvider } from './context/JobDataContext';
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <JobDataProvider>
      <AppRoutes />
    </JobDataProvider>
  );
}

export default App;
