import './Home.css';
import homeIcon1 from '../assets/homeIcon1.svg';
import item1 from '../assets/item1.svg';
import item2 from '../assets/item2.svg';
import item3 from '../assets/item3.svg';
import InfoCard from '../components/InfoCard'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('loginorsignup');
  };

  return (
    <>
      <div className="section1"> 
        <div className="subSection1">
          <b className="bigText"> With fast delivery times and affordable pricing, get ready to ship packages on the go with SnailMail.</b>
          <div className="line"/> 
          <small className="smallText"> Get a discounted price for every shipment.</small>
          <button onClick={handleClick}>
            <span>
              Create an Account 
            </span>
          </button>
        </div>
        <img className="homeIcon" src={homeIcon1} alt="Graphics of man reading planning in a room filled with packages" loading="lazy"/>
      </div>
      <div className="section2">
          <div className="bigText">
            Get affordable pricing and quick delivery times. 
          </div>
          <div className="items">
            <InfoCard 
              img={item1} 
              imgDescription="illustration of man moving package" 
              title="Quick, easy shipping" 
              paragraph="Send packages without the hassle. Fast, simple, and dependable from start to finish."
            />
            <InfoCard
              img={item2}
              imgDescription="illustration of woman managing packages" 
              title="Your packages, our priority"
              paragraph="We treat every package like it’s our own. Secure, efficient, and always on schedule."
            />
            <InfoCard
              img={item3}
              imgDescription="illustration of man carrying package" 
              title="Personal and reliable"
              paragraph="Reliable shipping backed by real people who care about your packages and your experience."
            />
          </div>
      </div>
      <div className="section3">
        TODO: How it works / process section
      </div>
      <div className="section4">
        TODO: call to action section
      </div>
      <div className="section5">
        TODO: Frequently asked questions 
      </div>
    </>
  );
};

export default Home;
