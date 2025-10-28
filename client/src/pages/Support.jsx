import "./Support.css"

const Support = () => {
  return (
    <div className="support-container">
      <h1>Frequently Asked Questions (FAQs)</h1>

      <div className="FAQ-wrapper">
        <div className="question">
          <h3 className="qText">Q: What are operating hours for SnailMail?</h3>
          <p className="aText">
            A: Operating hours are 9am - 7pm Monday - Thursday and 10am - 5pm Friday - Sunday.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: What is the maximum weight allowed for a package?</h3>
          <p className="aText">
            A: The maximum weight allowed is 100 lbs or more than 100 inches in length or 140 inches in girth. To avoid this issue, you can try to split the package into multiple packages. If this is not possible, we might have to use a different service.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: Can I use old boxes for shipping?</h3>
          <p className="aText">
            A: Yes, just make sure that the box is sturdy enough to hold the mailing item and old shipping labels/barcodes are completely removed.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: Is anything prohibited from mailing?</h3>
          <p className="aText">
            A: Yes, we do prohibit the shipping of items such as illegal drugs, ammunition, explosives, and certain hazardous materials like poisons, aerosols, and flammable liquids.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: How can I track my package?</h3>
          <p className="aText">
            A: You can use the tracking number that was provided on the receipt or the confirmation email to check the status of your packet.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: What are the estimated delivery times for each service?</h3>
          <p className="aText">
            A: For standard delivery, it takes about 5-7 days. Express delivery takes about 3-5 days. Finally, we also offer overnight delivery, which takes 1 day.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: Can I cancel my package after it has been shipped?</h3>
          <p className="aText">
            A: Unfortunately once mail is shipped, you can't cancel the delivery.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: What payment methods are accepted?</h3>
          <p className="aText">
            A: We accept VISA, Discover, AMEX, and MasterCard.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: How is undeliverable and misdelivered mail handled?</h3>
          <p className="aText">
            A: Mail and packages need to be addressed correctly. If we are not able to deliver the mail or package, we return it to the return address that is provided. If there is no return address, check your local store for the package.
          </p>
        </div>

        <div className="question">
          <h3 className="qText">Q: How do I file a claim?</h3>
          <p className="aText">
            A: To file a claim, you can go to our "File a Claim" page, and follow all the prompts on the screen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
