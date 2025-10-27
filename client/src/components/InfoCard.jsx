import './InfoCard.css';

const InfoCard = (props) => {
  return (
    <div className="card">
      <img className="infoCardImg" src={props.img} alt={props.imgDescription} loading="lazy"/>
      <b>{props.title}</b>
      <p>{props.paragraph}</p>
    </div>
  );
};

export default InfoCard;
