import './App.css';
import { Routes , Route } from 'react-router-dom';
import Home from './pages/Home';
import Shipping from './pages/Shipping';
import Tracking from './pages/Tracking';
import About from './pages/About';
import Support from './pages/Support';
import LoginOrSignUp from './pages/LogInOrSignUp';
import TestQuery from './pages/TestQuery';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import CreatePackage from './pages/CreatePackage';

const App = () => {
  return (
    <>
      <NavBar />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shipping" element={<Shipping/>} />
          <Route path="/tracking" element={<Tracking/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/support" element={<Support/>} />
          <Route path="/loginorsignup" element={<LoginOrSignUp/>} />
          <Route path="/testquery" element={<TestQuery/>} />
          <Route path="/createpackage" element={<CreatePackage/>} />
        </Routes>
      </main>

      <Footer />
    </>
  );
};

export default App;
