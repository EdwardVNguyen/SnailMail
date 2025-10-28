import './AuthInput.css';

const AuthInput = (props) => {
  return (
    <div className="authInput">
      <input name={props.name} 
             type={props.type} 
             id={props.id} 
             className="form_input" 
             autoComplete="off" 
             placeholder=" " 
             onChange={props.onChange} 
             onInvalid={props.onInvalid}
             onInput={props.onInput}
             value={props.value ?? ""} // return "" if props.value is null or undefined
             required={props.required || false} // required is false by default
             maxLength={props.maxLength}
             minLength={props.minLength}
             pattern={props.pattern}
      />
      <label htmlFor={props.htmlFor} className="form_label">{props.text}</label>
    </div>
  );
};

export default AuthInput;
