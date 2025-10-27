import './LogInOrSignUp.css';

import signUpImg from '../assets/signupImg.svg';

import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

const LogInOrSignUp = ( {setAuth, setGlobalAccountType, setGlobalAuthId} ) => {
  const [mode, switchMode] = useState("Login"); 
  const [step, setStep] = useState(1)

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [accountType, setAccountType] = useState("");

  const navigate = useNavigate();

  // on sign up, go to next slide
  const handleNext = async (e) => {
    e.preventDefault();
    
    // checks at first page if email is already taken or not
    if (step === 1) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/checkEmail`, {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify( {email} )
        });
        const data = await res.json();

        if (!data.exists) {
          setStep(2); // no other email exists, so move forward
        } else {
          alert("This email is already registered");
        }
      } catch (err) {
        console.log("error checking email", err);
        alert("Something went wrong, please try again");
      }
    } else {
      // goes forward after email is valid
      setStep( prev => prev + 1);
    }
  };

  // on sign up, go back if user wants to make changes
  const handleBack = (e) => {
    e.preventDefault();
    setStep(step - 1);
  }

  // submits all user details and user signs up into system
  const handleSignUp = async (e) => {
    e.preventDefault();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/userSignUp`, {
                                   method: 'POST',
                                   headers: {'Content-Type': 'application/json' },
                                   body: JSON.stringify( {email, password, phoneNumber, street, city, state, zipCode, firstName, middleName, lastName, accountType })
                                  });
    const data = await response.json();

    if (data.success) {
      setAuth(true);
      setGlobalAuthId(data.auth_id);
      navigate('/customerPage');
    } else {
      alert('Something went wrong with user sign up');
    }
  };

  // function to handle user login, checks if email and password exist in the database
  const handleLogin = async (e) => {
    e.preventDefault();

    // response - sends a POST request to server code, server code returns an JSON object {success: true/false message: 'message here'}
    // data - convert json code into javascript object
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                                   method: 'POST',
                                   headers: {'Content-Type': 'application/json' }, 
                                   body: JSON.stringify({ email, password })
                                  });
    const data = await response.json(); 

    // navigate to home page if success, alert about wrong credentials otherwise
    if (data.success) {
      setAuth(true);
      // send to different page depending on user credentials
      if (data.account_type === 'individual' || data.account_type === 'prime' || data.account_type === 'business') {
        setGlobalAccountType(data.account_type);
        setGlobalAuthId(data.auth_id);
        navigate('/customerPage');
      } else if (data.account_type === 'clerk' || data.account_type === 'courier') {
        setGlobalAccountType(data.account_type);
        setGlobalAuthId(data.auth_id);
        navigate('/employeePage');
      } else if (data.account_type === 'manager') {
        setGlobalAccountType(data.account_type);
        setGlobalAuthId(data.auth_id);
        navigate('/managerPage');
      } else {
        setAuth(false);
        alert('Invalid account type when logging in')
      }
    } else {
      alert('Invalid email or password.');
    }
  };
   
  return (
    <div className="pageBackground">
    <div className="signContainer">
      <div className="left"> 
       
        {/* switches bewtween login and sign up depending on mode state, controlled by the span with className "click" */}
        {mode === "Login" ? (
          <>
          <b className="bigText"> Start shipping with confidence today</b>
          <p className="description">SnailMail, a blazing fast delivery service</p>
          <form className="signIn" onSubmit={handleLogin} > {/* login form handles login authentication */}
            <AuthInput name="email" 
                       type="email" 
                       id="email-1" 
                       htmlFor="email-1" 
                       text="Email" 
                       value={email} 
                       onChange={ ((e) => setEmail(e.target.value))}
                       />
            <AuthInput name="password" 
                       type="password" 
                       id="password-1" 
                       htmlFor="password-1" 
                       text="Password" 
                       maxLength="100" 
                       value={password}
                       onChange={ (e) => setPassword(e.target.value)}
                       />
            <p className="switch"> Don't have an account,  
              <span className="click" onClick={()=>{switchMode("Signup")}}> click here </span> 
              to sign up! 
            </p>
            <AuthButton text="Log In" type="submit"/> 
          </form>
          </>
        ) : (
          <>
          {/* Sign up page, user goes through 4 pages, inserting their info before submitting it all */}

          <b className="bigText"> Ready to start your shipping journey?</b>
          <p className="description"> "A journey of a thousand miles begins with a single step."</p>
          <form className="signUp" onSubmit={step === 4 ? handleSignUp : handleNext }>
            {step === 1 && (
              <> 
              <AuthInput name="email" 
                       type="email" 
                       id="email-2" 
                       htmlFor="email-2" 
                       text="Email" 
                       value={email}
                       onChange={ ((e) => setEmail(e.target.value))} 
                       required={true}
                       />
              <AuthInput name="password" 
                       type="password" 
                       id="password-2" 
                       htmlFor="password-2" 
                       text="Password" 
                       maxLength={100}
                       value={password}
                       onChange={ (e) => setPassword(e.target.value)}
                       required={true}
                       />
              <AuthInput type="tel" 
                       name="phone"
                       id="phone-1" 
                       htmlFor="phone-1" 
                       text="Phone Number - optional" 
                       maxLength={10}
                       minLength={10}
                       pattern="[0-9]*"
                       value={phoneNumber}
                       onChange={ (e) => setPhoneNumber(e.target.value)}
                       />
                <p className="switch"> Already have an account,
                  <span className="click" onClick={()=>{switchMode("Login")}}> click here </span>
                    to log in!
                 </p>
              <AuthButton text="Continue" type="submit"/> 
              </>
            )}
            {step === 2 && (
              <> 
              <AuthInput type="text" 
                       name="street-address"
                       id="street-1" 
                       htmlFor="street-1" 
                       text="Street Name" 
                       value={street}
                       onChange={ (e) => setStreet(e.target.value)}
                       required={true}
                       />
              <AuthInput type="text" 
                       name="city-address"
                       id="city-1" 
                       htmlFor="city-1" 
                       text="City Name" 
                       value={city}
                       onChange={ (e) => setCity(e.target.value)}
                       required={true}
                       />
              <AuthInput type="text" 
                       name="state-address"
                       id="state-1" 
                       htmlFor="state-1" 
                       text="State" 
                       maxLength={2}
                       minLength={2}
                       pattern="[A-Z]*"
                       value={state}
                       onChange={ (e) => setState(e.target.value.toUpperCase())}
                       onInvalid={ (e) => e.target.setCustomValidity("Must be a valid 2 letter state code")}
                       onInput={ (e) => e.target.setCustomValidity("")}
                       required={true}
                       />
              <AuthInput type="text" 
                       name="zipCode-address"
                       id="zip-1" 
                       htmlFor="zip-1" 
                       text="ZIP Code" 
                       value={zipCode}
                       onChange={ (e) => setZipCode(e.target.value)}
                       required={true}
                       maxLength={5}
                       minLength={5}
                       pattern="[0-9]*"
                       onInvalid={ (e) => e.target.setCustomValidity("Must be a valid 5 digit zip code")}
                       onInput={ (e) => e.target.setCustomValidity("")}
                       />
                 <p className="switch" /> 
                <div className="goBack">
                   <AuthButton text="Back" type="button" onClick={handleBack}/>
                  <AuthButton text="Continue" type="submit"/> 
                </div>
              </>
            )}
          {step === 3 && (
              <> 
              <AuthInput type="text" 
                       name="first-name"
                       id="fname-1" 
                       htmlFor="fname-1" 
                       text="First Name" 
                       value={firstName}
                       onChange={ (e) => setFirstName(e.target.value)}
                       required={true}
                       />
              <AuthInput type="text" 
                       name="middle-name"
                       id="mname-1" 
                       htmlFor="mname-1" 
                       text="Middle Name - optional" 
                       value={middleName}
                       onChange={ (e) => setMiddleName(e.target.value)}
                       />
              <AuthInput type="text" 
                       name="last-name"
                       id="lname-1" 
                       htmlFor="lname-1" 
                       text="Last Name" 
                       value={lastName}
                       onChange={ (e) => setLastName(e.target.value)}
                       required={true}
                       />
                <p className="switch" /> 
                <div className="goBack">
                  <AuthButton text="Back" type="button" onClick={handleBack}/>
                  <AuthButton text="Continue " type="submit"/> 
                </div>
              </>
            )}
          {step === 4 && (
            <>
              {/* Credit to CodingFlag for custom radio input */}
            <div className="accountType">
              <label className="formInput" htmlFor='individual-acc'>
                    <input type="radio" name="accountType" id="individual-acc" value="individual" onChange={ (e) => setAccountType(e.target.value)} required/>
                    <div className="title">Individual Account</div>
                    <div className="price">Free</div>
                    <p> Per Month</p>
                    <div className="desc"> Perfect for personal use, giving you access to all basic features at no cost.</div>
              </label>

              <label className="formInput" htmlFor="prime-acc">
                    <input type="radio" name="accountType" id="prime-acc" value="prime" onChange={ (e) => setAccountType(e.target.value)}/>
                    <div className="title">Prime Account</div>
                    <div className="price">$9.99</div>
                    <p> Per Month</p>
                    <div className="desc"> Enjoy enhanced features, priority support, and exclusive content for a low monthly fee.</div>
              </label>

              <label className="formInput" htmlFor="business-acc">
                    <input type="radio" name="accountType" id="business-acc" value="business" onChange={ (e) => setAccountType(e.target.value)}/>
                    <div className="title">Business Account</div>
                    <div className="price">$24.99</div>
                    <p> Per Month</p>
                    <div className="desc"> Designed for teams and companies, offering advanced tools, analytics, and collaboration options.</div>
                </label>
            </div>

              <div className="goBack">
                <AuthButton text="Back" type="button" onClick={handleBack}/>
                <AuthButton text="Sign up" type="submit"/> 
              </div>
            </>
          )}

          </form>
          </>
        )}
      </div>
      <div className="middle" />
      <div className="right">
        <img className="signUpImg" src={signUpImg} alt="image of Company Logo and man carrying packages"/>
      </div>
    </div>
    </div>
  );
};

export default LogInOrSignUp;
