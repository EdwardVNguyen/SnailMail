import InfoCard from "../components/InfoCard";
import ph from "../assets/placeholder.png";
import './About.css';

const About = () => {
  return (

    <div className="container">
        <div className="mission-statement">
          <h2>Our SnailMail Mission</h2>
          <p>Our mission is to transform the way mail and parcels move — combining innovation, technology, and trusted service to deliver speed, transparency, and satisfaction to every customer.</p>
        </div>
        <div className="members">
          <h2>Meet the Team</h2>
          <div className="row1">
            <div className="member">
              <InfoCard 
                img={ph}
                imgDescription=""
                title="Grace"
                paragraph=""
              />
            </div>
            <div className="member">
              <InfoCard 
                img={ph}
                imgDescription="Edward"
                title="Edward"
                paragraph=""
              />
            </div>
            <div className="member">
              <InfoCard 
                img={ph}
                imgDescription="Jay"
                title="Jay"
                paragraph=""
              />
            </div>
          </div>
          <div className="row2">
            <div className="member">
              <InfoCard 
                img={ph}
                imgDescription="Nate"
                title="Nate"
                paragraph=""
              />
            </div>
            <div className="member">
              <InfoCard 
                img={ph}
                imgDescription=""
                title="Juan"
                paragraph=""
              />
            </div>
          </div>
        </div>
    </div>


  );
};

export default About;

