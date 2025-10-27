import './CreatePackage.css';

const CreatePackage = () => {
    const handleSubmit = (e) => {
         e.preventDefault();
     };
    return (
        <>
            <div className="form-container">
                <div className="form-wrapper">
                    <div className="form-column">
                        <h2>Sender Information</h2>
                        <label htmlFor="sender_fname">First Name</label>
                        <input type="text" name="sender_fname" id="sender_fname"/>
                        <label htmlFor="sender_lname">Last Name</label>
                        <input type="text" name="sender_lname" id="sender_lname"/>
                        <label htmlFor="sender_email">Email</label>
                        <input type="email" name="sender_email" id="sender_email"/>
                        <label htmlFor="sender_pNumber">Phone Number</label>
                        <input type="tel" name="pNumber" id="pNumber" />
                        <label htmlFor="sender_address">Address</label>
                        <input type="text" name="sender_address" id="sender_address"/>
                        <label htmlFor="sender_city">City</label>
                        <input type="text" name="sender_city" id="sender_city"/>
                        <label htmlFor="sender_state">State</label>
                        <input type="text" name="sender_state" id="sender_state"/>
                        <label htmlFor="sender_zipcode">Zip Code</label>
                        <input type="number" name="sender_zipcode" id="sender_zipcode"/>
                    </div>
                    <div className="form-column">
                        <h2>Receiver Information</h2>
                        <label htmlFor="receiver_fname">First Name</label>
                        <input type="text" name="receiver_lname" id="receiver_lname" />
                        <label htmlFor="receiver_lname">Last Name</label>
                        <input type="text" name="receiver_fname" id="receiver_fname" />
                        <label htmlFor="receiver_address">Address</label>
                        <input type="text" name="receiver_address" id="receiver_address"/>
                        <label htmlFor="receiver_city">City</label>
                        <input type="text" name="receiver_city" id="receiver_city"/>
                        <label htmlFor="receiver_state">State</label>
                        <input type="text" name="receiver_state" id="receiver_state"/>
                        <label htmlFor="receiver_zipcode">Zip Code</label>
                        <input type="number" name="receiver_zipcode" id="receiver_zipcode"/>
                    </div>
                    <div className="form-column">
                        <h2>Package Information</h2>
                        <label htmlFor="height">Height (in.)</label>
                        <input type="number" name="height" id="height"/>
                        <label htmlFor="length">Length (in.)</label>
                        <input type="number" name="length" id="length"/>
                        <label htmlFor="width">Width (in.)</label>
                        <input type="number" name="width" id="width"/>
                        <label htmlFor="weight">Weight (lbs)</label>
                        <input type="number" name="weight" id="weight"/>
                    </div>
                </div>

                <div className="button-row">
                    <button className="submit-button" onClick={handleSubmit}>Create Package</button>
                </div>
            </div>
        </>
    );
};

export default CreatePackage;
