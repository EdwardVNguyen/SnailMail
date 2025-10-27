import './Footer.css'
import homeLogo from '../assets/homeLogo.svg';

const Footer = () => {
  return (
    <div className="footer"> 
      <div className="line"/> 
      <div className="container">
        <img className="homeLogo" src={homeLogo} alt="Home"/>       
        <div className="text"> 2025 SnailMail | All rights reserved</div>
      </div>
    </div>
  );
};

export default Footer;
