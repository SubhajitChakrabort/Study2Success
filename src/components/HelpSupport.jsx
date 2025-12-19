import React, { useRef } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser"; // Import EmailJS
import "./HelpSupport.css"; // Optional: Add custom styles

const HelpSupport = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    // Replace with your EmailJS service ID, template ID, and public key
    const serviceID ="service_pu0huzp";
    const templateID = "template_bs3vtq6";
    const publicKey = "SVwM-CPv6nvolRb78";

    emailjs
      .sendForm(serviceID, templateID, form.current, publicKey)
      .then(
        (result) => {
          console.log("Email sent successfully!", result.text);
          alert("Your message has been sent successfully!");
          form.current.reset(); // Reset the form after sending
        },
        (error) => {
          console.error("Failed to send email:", error.text);
          alert("Failed to send the message. Please try again later.");
        }
      );
  };

  return (
    <div className="help-support">
      <header>
        <div className="logo">
           <Link className="navbar-brand" to="/dashboard">
                                <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" />
                                SmartStudy
                              </Link>
        </div>
        <h1>Help & Support</h1>
        <p>We're here to help you! Reach out to us for any assistance.</p>
      </header>

      <main>
        <div className="contact-info">
          <div className="contact-item">
            <i className="bi bi-telephone-fill"></i>
            <p>
              Phone: <a href="tel:+919885871166">+91 9885871166</a>
            </p>
          </div>
          <div className="contact-item">
            <i className="bi bi-envelope-fill"></i>
            <p>
              Email: <a href="mailto:admin@gmail.com">admin@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="support-form">
          <h2>Contact Us</h2>
          <form ref={form} onSubmit={sendEmail}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 SmartStudy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HelpSupport;