import { Route, Routes, Link } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import SurveyPage from "./SurveyPage";
import { AuthContextProvider } from "./AuthContext";

function App() {
    return (
        <AuthContextProvider>
            <Routes>
                <Route
                    index
                    element={
                        <div className="wrapper">
                            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                                <h1>Welcome to SuperPolls</h1>
                                <p>Create and manage your surveys easily!</p>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                                    <Link to="/login" className="btn btn-primary">Login</Link>
                                    <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
                                    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                                </div>
                            </div>
                        </div>
                    }
                />
                <Route path="/login" element={<LoginPage isSignup={false} />} />
                <Route path="/signup" element={<LoginPage isSignup={true} />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/survey/:surveyId" element={<SurveyPage />} />
            </Routes>
        </AuthContextProvider>
    );
}

export default App;
