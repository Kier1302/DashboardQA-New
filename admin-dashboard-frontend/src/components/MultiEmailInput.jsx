import React, { useState } from "react";

const MultiEmailInput = ({ emails, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [emailList, setEmailList] = useState(emails || []);

  const addEmail = (email) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && !emailList.includes(trimmedEmail) && validateEmail(trimmedEmail)) {
      const newEmails = [...emailList, trimmedEmail];
      setEmailList(newEmails);
      onChange(newEmails);
    }
  };

  const removeEmail = (email, event) => {
    event.stopPropagation();
    const newEmails = emailList.filter(e => e !== email);
    setEmailList(newEmails);
    onChange(newEmails);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      if (inputValue) {
        addEmail(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && emailList.length) {
      removeEmail(emailList[emailList.length - 1], e);
    }
  };

  const handleBlur = () => {
    if (inputValue) {
      addEmail(inputValue);
      setInputValue("");
    }
  };

  const validateEmail = (email) => {
    // Simple email regex validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "5px", borderRadius: "4px", minHeight: "40px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
      {emailList.map((email) => (
        <div key={email} style={{ backgroundColor: "#2563eb", color: "white", padding: "5px 10px", borderRadius: "15px", display: "flex", alignItems: "center", gap: "5px" }}>
          <span>{email}</span>
          <button
            type="button"
            onClick={(e) => removeEmail(email, e)}
            style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontWeight: "bold" }}
            aria-label={`Remove ${email}`}
          >
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter email and press Enter"
        style={{ flex: 1, border: "none", outline: "none", minWidth: "150px" }}
      />
    </div>
  );
};

export default MultiEmailInput;
