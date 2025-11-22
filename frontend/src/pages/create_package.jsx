import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './create_package.css';

const create_package = () => {

    // // package details
    // const [weight, setWeight] = useState('');
    // const [height, setHeight] = useState('');
    // const [width, setWidth] = useState('');
    // const [length, setLength] = useState('');
    
    // // sender details
    // const [senderFName, setSenderFName] = useState('');
    // const [senderLName, setSenderLName] = useState('');
    // const [senderEmail, setSenderEmail] = useState('');
    // const [senderPhone, setSenderPhone] = useState('');
    // const [senderAddress, setSenderAddress] = useState('');
    // const [senderCity, setSenderCity] = useState('');
    // const [senderState, setSenderState] = useState('');
    // const [senderZip, setSenderZip] = useState('');

    // // receiver details
    // const [receiverFName, setReceiverFName] = useState('');
    // const [receiverLName, setReceiverLName] = useState('');
    // const [receiverAddress, setReceiverAddress] = useState('');
    // const [receiverCity, setReceiverCity] = useState('');
    // const [receiverState, setReceiverState] = useState('');
    // const [receiverZip, setReceiverZip] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <>
            <div className="form-container">
                <div className="form-wrapper">
                    <div className="form-column">
                        <h2>Sender Information</h2>
                        <div className="input-field">
                            <label htmlFor="sender_fname">First Name</label>
                            <input type="text" name="sender_fname" id="sender_fname"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_lname">Last Name</label>
                            <input type="text" name="sender_lname" id="sender_lname"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_email">Email</label>
                            <input type="email" name="sender_email" id="sender_email"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_pNumber">Phone Number</label>
                            <input type="tel" name="pNumber" id="pNumber" />
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_address">Address</label>
                            <input type="text" name="sender_address" id="sender_address"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_city">City</label>
                            <input type="text" name="sender_city" id="sender_city"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_state">State</label>
                            <input type="text" name="sender_state" id="sender_state"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="sender_zipcode">Zip Code</label>
                            <input type="number" name="sender_zipcode" id="sender_zipcode"/>
                        </div>
                    </div>

                    <div className="form-column">
                        <h2>Receiver Information</h2>
                        <div className="input-field">
                            <label htmlFor="receiver_fname">First Name</label>
                            <input type="text" name="receiver_lname" id="receiver_lname" />
                        </div>
                        <div className="input-field">
                            <label htmlFor="receiver_lname">Last Name</label>
                            <input type="text" name="receiver_fname" id="receiver_fname" />
                        </div>
                        <div className="input-field">
                            <label htmlFor="receiver_address">Address</label>
                            <input type="text" name="receiver_address" id="receiver_address"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="receiver_city">City</label>
                            <input type="text" name="receiver_city" id="receiver_city"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="receiver_state">State</label>
                            <input type="text" name="receiver_state" id="receiver_state"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="receiver_zipcode">Zip Code</label>
                            <input type="number" name="receiver_zipcode" id="receiver_zipcode"/>
                        </div>
                    </div>

                    <div className="form-column">
                        <h2>Package Information</h2>
                        <div className="input-field">
                            <label htmlFor="height">Height (in.)</label>
                            <input type="number" name="height" id="height"/>
                        </div>
                        <div className="input-field">
                            <label htmlFor="length">Length (in.)</label>
                            <input type="number" name="length" id="length"/></div>
                        <div className="input-field">                        
                            <label htmlFor="width">Width (in.)</label>
                            <input type="number" name="width" id="width"/></div>
                        <div className="input-field">
                            <label htmlFor="weight">Weight (lbs)</label>
                            <input type="number" name="weight" id="weight"/>
                        </div>
                    </div>
                </div>

                <div className="button-row">
                    <button className="submit-button" onClick={handleSubmit}>Create Package</button>
                </div>
            </div>
        </>
    );
};

export default create_package;