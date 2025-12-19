import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import DesktopOnly from "./DesktopOnly";
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    phone: "",
    role: "role",
    password: "",
    studentType: "",
    offerLetter: null,
    employeeIdProof: null,
    paymentPlan: "",
  });

  // Add validation state
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showStudentTypeDialog, setShowStudentTypeDialog] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  // Add state for invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    paymentId: "",
    amount: 0,
    plan: "",
    name: "",
    email: "",
    date: "",
  });
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Client-side validation function
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    // Password validation
    if (formData.password.length < 8 || formData.password.length > 32) {
      newErrors.password = "Password must be between 8 and 32 characters";
    } else if (
      !/[A-Za-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password) ||
      !/[^A-Za-z0-9]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must include at least one letter, one number, and one special character";
    }

    // Student type validation
    if (formData.role === "student" && !formData.studentType) {
      newErrors.studentType = "Please select a student type";
    }

    // Payment plan validation for regular students
    if (
      formData.role === "student" &&
      formData.studentType === "regular" &&
      !formData.paymentPlan
    ) {
      newErrors.paymentPlan = "Please select a payment plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to show alert message
  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000); // Hide after 5 seconds
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }

    // Show student type dialog if role is student
    if (name === "role" && value === "student") {
      setShowStudentTypeDialog(true);
    } else if (name === "role") {
      setShowStudentTypeDialog(false);
    }
  };

  const handleFileChange = (e) => {
    console.log(`File selected for ${e.target.name}:`, e.target.files[0]?.name);
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });

    // Clear error for this field when user selects a file
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const handleStudentTypeSelection = (type) => {
    setFormData({
      ...formData,
      studentType: type,
    });

    // Clear student type error
    if (errors.studentType) {
      setErrors({
        ...errors,
        studentType: null,
      });
    }

    if (type === "non-regular") {
      setShowOfferLetterModal(true);
    } else if (type === "regular") {
      setShowPaymentPlans(true); // Show payment plans for regular students
    }
    setShowStudentTypeDialog(false);
  };

  const handlePaymentPlanSelection = (plan) => {
    setFormData({
      ...formData,
      paymentPlan: plan,
    });

    // Clear payment plan error
    if (errors.paymentPlan) {
      setErrors({
        ...errors,
        paymentPlan: null,
      });
    }
  };

  const getPlanDisplayName = (planCode) => {
    const planNames = {
      "1_month": "1 Month",
      "3_month": "3 Months",
      "6_month": "6 Months",
      "18_month": "18 Months",
      "24_month": "24 Months",
    };
    return planNames[planCode] || planCode;
  };

  const handlePayment = async (orderId, userId) => {
    const planAmounts = {
      "1_month": 450.89,
      "3_month": 1050.66,
      "6_month": 2500.03,
      "18_month": 6500.75,
      "24_month": 8128.08,
    };

    // This is now the total amount (including taxes)
    const totalAmount = planAmounts[formData.paymentPlan];

    // Calculate base amount by removing taxes
    // If total is X, and we add 10% tax, then X = base + (base * 0.1)
    // So base = X / 1.1
    const baseAmount = totalAmount / 1.1; // Divide by 1.1 to remove 10% tax (5% SGST + 5% CGST)

    // Calculate tax amounts
    const sgst = baseAmount * 0.05;
    const cgst = baseAmount * 0.05;

    const options = {
      key: "rzp_test_mFFaw12AfREkru", // Replace with your Razorpay key
      amount: totalAmount * 100, // Amount in paise (total amount including taxes)
      currency: "INR",
      order_id: orderId,
      name: "SmartStudy",
      description: "Payment for Regular Student Registration (incl. GST)",
      handler: async (response) => {
        // Capture payment
        const captureResponse = await fetch(
          "https://smartstudy-server.onrender.com/api/payment/capture-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId,
              amount: baseAmount, // Pass the base amount to the backend
              totalAmount: totalAmount, // Pass the total amount including taxes
            }),
          }
        );

        const result = await captureResponse.json();
        if (result.success) {
          // Set invoice data and show invoice modal
          const currentDate = new Date();
          setInvoiceData({
            invoiceNumber:
              result.invoiceNumber ||
              `INV-${userId}-${currentDate.getTime().toString().slice(-6)}`,
            paymentId: response.razorpay_payment_id,
            amount: baseAmount,
            sgst: sgst,
            cgst: cgst,
            totalAmount: totalAmount,
            plan: getPlanDisplayName(formData.paymentPlan),
            name: formData.name,
            email: formData.email,
            date: currentDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
          setShowInvoiceModal(true);
        } else {
          showAlertMessage("Payment failed! Please try again.");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      // Show alert for validation errors
      showAlertMessage("Please fix the errors in the form before submitting.");
      return;
    }
    setIsLoading(true);

    // Create FormData object to handle file upload
    const data = new FormData();
    for (const key in formData) {
      if (key === "offerLetter" || key === "employeeIdProof") {
        if (formData[key] !== null) {
          console.log(`Appending file ${key}:`, formData[key].name);
          data.append(key, formData[key]);
        }
      } else {
        data.append(key, formData[key] !== null ? formData[key] : "");
      }
    }

    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const response = await fetch("https://smartstudy-server.onrender.com/api/auth/register", {
        method: "POST",
        body: data, // Use FormData instead of JSON
      });

      if (response.ok) {
        const responseData = await response.json();
        const { orderId, userId, message } = responseData;

        // If the user is a regular student, initiate payment
        if (formData.role === "student" && formData.studentType === "regular") {
          handlePayment(orderId, userId);
        } else {
          // For non-regular students or other roles, show success message and redirect to login
          showAlertMessage(message || "Registration successful!");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        // Handle server validation errors
        const errorData = await response.json();
        if (errorData.field) {
          setErrors({
            ...errors,
            [errorData.field]: errorData.error,
          });
        }
        showAlertMessage(errorData.error || "Registration failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      showAlertMessage("Registration failed. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoiceModal(false);
    navigate("/login");
  };

  const handlePrintInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    const sgst = invoiceData.amount * 0.05;
    const cgst = invoiceData.amount * 0.05;
    const totalAmount = invoiceData.amount + sgst + cgst;

    // Add necessary styles for the print window
    printWindow.document.write(`
     <html>
      <head>
        <title>SmartStudy - Payment Invoice</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
        <style>
          body { 
            padding: 20px; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .invoice-header {
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo-image {
            max-width: 180px;
            height: auto;
          }
          .invoice-title {
            background: linear-gradient(135deg, #001f3f 0%, #0a4b78 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-details-col {
            flex: 1;
          }
          .invoice-id {
            font-size: 18px;
            font-weight: bold;
            color: #0a4b78;
          }
          .invoice-date {
            color: #666;
          }
          .billed-to {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .billed-to h5 {
            color: #0a4b78;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .payment-info {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .payment-info h5 {
            color: #0a4b78;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
          }
          .table th {
            background-color: #0a4b78;
            color: white;
            padding: 12px;
            text-align: left;
          }
          .table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .table tfoot th {
            background-color: #f9f9f9;
            color: #333;
            font-weight: bold;
          }
          .amount-col {
            text-align: right;
          }
          .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }
          .success-message h5 {
            color: #155724;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #666;
          }
          .thank-you {
            font-size: 18px;
            font-weight: bold;
            color: #0a4b78;
            margin-bottom: 10px;
          }
          .contact-info {
            margin-top: 15px;
            font-size: 14px;
          }
          .print-buttons {
            text-align: center;
            margin-top: 30px;
          }
          .print-btn {
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-right: 10px;
            transition: all 0.3s ease;
          }
          .print-btn:hover {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .close-btn {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          .close-btn:hover {
            background-color: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          @media print {
            .print-buttons { display: none; }
            .invoice-container {
              box-shadow: none;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="logo-container">
            <img src="/assets/owl.png" alt="JobLMS Logo" class="logo-image">
          </div>
          
          <div class="invoice-title">
            <h2>PAYMENT INVOICE</h2>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-details-col">
              <div class="invoice-id">Invoice #: ${
                invoiceData.invoiceNumber
              }</div>
              <div class="invoice-date">Date: ${invoiceData.date}</div>
            </div>
            <div class="invoice-details-col text-end">
              <div><strong>SmartStudy</strong></div>
              <div>SmartStudy</div>
              <div>support@SmartStudy.com</div>
              <div>+91 9876543210</div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="billed-to">
                <h5><i class="bi bi-person"></i> Billed To:</h5>
                <div><strong>${invoiceData.name}</strong></div>
                <div>${invoiceData.email}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="payment-info">
                <h5><i class="bi bi-credit-card"></i> Payment Info:</h5>
                <div><strong>Payment ID:</strong> ${invoiceData.paymentId}</div>
                <div><strong>Method:</strong> Razorpay</div>
              </div>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Registration Fee - ${invoiceData.plan} Plan</td>
                <td class="amount-col">₹${invoiceData.amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>SGST (5%)</td>
                <td class="amount-col">₹${sgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td>CGST (5%)</td>
                <td class="amount-col">₹${cgst.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th class="amount-col">₹${totalAmount.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
          
          <div class="success-message">
            <h5><i class="bi bi-check-circle"></i> Registration Successful!</h5>
            <p>Your account has been successfully created and payment has been processed. You can now log in to access all features.</p>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for choosing SmartStudy!</div>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <div class="contact-info">
              <div>If you have any questions, please contact us at:</div>
              <div>Email: support@SmartStudy.com | Phone: +91 9876543210</div>
            </div>
          </div>
          
          <div class="print-buttons">
            <button onclick="window.print()" class="print-btn">
              <i class="bi bi-printer"></i> Print Invoice
            </button>
            <button onclick="window.close()" class="close-btn">
              <i class="bi bi-x"></i> Close
            </button>
          </div>
        </div>
      </body>
    </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  // return (
  //   <div className="container mt-5">
  //     {/* Alert for validation errors */}
  //     {showAlert && (
  //       <div
  //         className="alert alert-danger alert-dismissible fade show"
  //         role="alert"
  //       >
  //         {alertMessage}
  //         <button
  //           type="button"
  //           className="btn-close"
  //           onClick={() => setShowAlert(false)}
  //           aria-label="Close"
  //         ></button>
  //       </div>
  //     )}

  //     <div className="row justify-content-center">
  //       <div className="col-md-6 col-lg-5">
  //         <div className="card shadow-lg">
  //           <div className="card-body p-5">
  //             <h2 className="text-center mb-4">Register</h2>
  //             <form onSubmit={handleSubmit}>
  //               <div className="mb-3">
  //                 <input
  //                   type="text"
  //                   className={`form-control ${
  //                     errors.username ? "is-invalid" : ""
  //                   }`}
  //                   name="username"
  //                   placeholder="Username"
  //                   value={formData.username}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //                 {errors.username && (
  //                   <div className="invalid-feedback">{errors.username}</div>
  //                 )}
  //               </div>
  //               <div className="mb-3">
  //                 <input
  //                   type="email"
  //                   className={`form-control ${
  //                     errors.email ? "is-invalid" : ""
  //                   }`}
  //                   name="email"
  //                   placeholder="Email"
  //                   value={formData.email}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //                 {errors.email && (
  //                   <div className="invalid-feedback">{errors.email}</div>
  //                 )}
  //               </div>
  //               <div className="mb-3">
  //                 <input
  //                   type="text"
  //                   className={`form-control ${
  //                     errors.name ? "is-invalid" : ""
  //                   }`}
  //                   name="name"
  //                   placeholder="Full Name"
  //                   value={formData.name}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //                 {errors.name && (
  //                   <div className="invalid-feedback">{errors.name}</div>
  //                 )}
  //               </div>
  //               <div className="mb-3">
  //                 <input
  //                   type="tel"
  //                   className={`form-control ${
  //                     errors.phone ? "is-invalid" : ""
  //                   }`}
  //                   name="phone"
  //                   placeholder="Phone Number (10 digits)"
  //                   value={formData.phone}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //                 {errors.phone && (
  //                   <div className="invalid-feedback">{errors.phone}</div>
  //                 )}
  //               </div>
  //               <div className="mb-3">
  //                 <select
  //                   className={`form-select ${errors.role ? "is-invalid" : ""}`}
  //                   name="role"
  //                   value={formData.role}
  //                   onChange={handleChange}
  //                 >
  //                   <option value="role">Select Role</option>
  //                   <option value="student">Student</option>
  //                   <option value="teacher">Teacher</option>
  //                   <option value="admin">Admin</option>
  //                 </select>
  //                 {errors.role && (
  //                   <div className="invalid-feedback">{errors.role}</div>
  //                 )}
  //               </div>

  //               {/* Student Type Dialog */}
  //               {showStudentTypeDialog && (
  //                 <div className="mb-3">
  //                   <p>Select Student Type:</p>
  //                   <button
  //                     type="button"
  //                     className="btn btn-secondary me-2"
  //                     onClick={() => handleStudentTypeSelection("regular")}
  //                   >
  //                     Regular
  //                   </button>
  //                   <button
  //                     type="button"
  //                     className="btn btn-secondary"
  //                     onClick={() => handleStudentTypeSelection("non-regular")}
  //                   >
  //                     Non-Regular
  //                   </button>
  //                   {errors.studentType && (
  //                     <div className="text-danger mt-2">
  //                       {errors.studentType}
  //                     </div>
  //                   )}
  //                 </div>
  //               )}

  //               {/* Offer Letter Modal */}
  //               {showOfferLetterModal && (
  //                 <div className="mb-3">
  //                   <h5 className="mb-3">Non-Regular Student Documents:</h5>

  //                   <div className="mb-3">
  //                     <label className="form-label">Upload Offer Letter:</label>
  //                     <input
  //                       type="file"
  //                       className={`form-control ${
  //                         errors.offerLetter ? "is-invalid" : ""
  //                       }`}
  //                       name="offerLetter"
  //                       onChange={handleFileChange}
  //                       required
  //                     />
  //                     <small className="text-muted">
  //                       Please upload your company offer letter (PDF or image
  //                       format)
  //                     </small>
  //                     {errors.offerLetter && (
  //                       <div className="invalid-feedback">
  //                         {errors.offerLetter}
  //                       </div>
  //                     )}
  //                   </div>

  //                   <div className="mb-3">
  //                     <label className="form-label">
  //                       Upload Employee ID Proof:
  //                     </label>
  //                     <input
  //                       type="file"
  //                       className={`form-control ${
  //                         errors.employeeIdProof ? "is-invalid" : ""
  //                       }`}
  //                       name="employeeIdProof"
  //                       onChange={handleFileChange}
  //                       required
  //                     />
  //                     <small className="text-muted">
  //                       Please upload your employee ID card or other proof of
  //                       employment
  //                     </small>
  //                     {errors.employeeIdProof && (
  //                       <div className="invalid-feedback">
  //                         {errors.employeeIdProof}
  //                       </div>
  //                     )}
  //                   </div>
  //                 </div>
  //               )}

  //               {/* Payment Plans for Regular Students */}
  //               {showPaymentPlans && (
  //                 <div className="mb-3">
  //                   <p>Select Payment Plan:</p>
  //                   <div className="form-check">
  //                     <input
  //                       type="radio"
  //                       className="form-check-input"
  //                       name="paymentPlan"
  //                       value="1_month"
  //                       onChange={() => handlePaymentPlanSelection("1_month")}
  //                       required
  //                     />
  //                     <label className="form-check-label">
  //                       1 Month - $5.27 (₹450.89)
  //                     </label>
  //                   </div>
  //                   <div className="form-check">
  //                     <input
  //                       type="radio"
  //                       className="form-check-input"
  //                       name="paymentPlan"
  //                       value="3_month"
  //                       onChange={() => handlePaymentPlanSelection("3_month")}
  //                     />
  //                     <label className="form-check-label">
  //                       3 Months - $12.28 (₹1050.66)
  //                     </label>
  //                   </div>
  //                   <div className="form-check">
  //                     <input
  //                       type="radio"
  //                       className="form-check-input"
  //                       name="paymentPlan"
  //                       value="6_month"
  //                       onChange={() => handlePaymentPlanSelection("6_month")}
  //                     />
  //                     <label className="form-check-label">
  //                       6 Months - $29.22 (₹2500.03)
  //                     </label>
  //                   </div>
  //                   <div className="form-check">
  //                     <input
  //                       type="radio"
  //                       className="form-check-input"
  //                       name="paymentPlan"
  //                       value="18_month"
  //                       onChange={() => handlePaymentPlanSelection("18_month")}
  //                     />
  //                     <label className="form-check-label">
  //                       18 Months - $75.98 (₹6500.75)
  //                     </label>
  //                   </div>
  //                   <div className="form-check">
  //                     <input
  //                       type="radio"
  //                       className="form-check-input"
  //                       name="paymentPlan"
  //                       value="24_month"
  //                       onChange={() => handlePaymentPlanSelection("24_month")}
  //                     />
  //                     <label className="form-check-label">
  //                       24 Months - $95 (₹8128.08)
  //                     </label>
  //                   </div>
  //                   {errors.paymentPlan && (
  //                     <div className="text-danger mt-2">
  //                       {errors.paymentPlan}
  //                     </div>
  //                   )}
  //                 </div>
  //               )}

  //               <div className="mb-4 position-relative">
  //                 <input
  //                   type={showPassword ? "text" : "password"}
  //                   className={`form-control ${
  //                     errors.password ? "is-invalid" : ""
  //                   }`}
  //                   name="password"
  //                   placeholder="Password (8-32 chars, include letter, number, special char)"
  //                   value={formData.password}
  //                   onChange={handleChange}
  //                   required
  //                 />
  //                 <button
  //                   type="button"
  //                   className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
  //                   onClick={togglePasswordVisibility}
  //                   style={{ zIndex: 10 }}
  //                 >
  //                   <i
  //                     className={`bi ${
  //                       showPassword ? "bi-eye-slash" : "bi-eye"
  //                     }`}
  //                   ></i>
  //                 </button>
  //                 {errors.password && (
  //                   <div className="invalid-feedback">{errors.password}</div>
  //                 )}
  //               </div>
  //               <button
  //                 type="submit"
  //                 className="btn btn-primary w-100"
  //                 disabled={isLoading}
  //               >
  //                 {isLoading ? "Registering..." : "Register"}
  //               </button>
  //             </form>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Invoice Modal */}
  //     {showInvoiceModal && (
  //       <div
  //         className="modal fade show"
  //         style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
  //       >
  //         <div className="modal-dialog modal-lg">
  //           <div className="modal-content">
  //             <div className="modal-header bg-success text-white">
  //               <h5 className="modal-title">Payment Successful</h5>
  //               <button
  //                 type="button"
  //                 className="btn-close"
  //                 onClick={handleCloseInvoice}
  //               ></button>
  //             </div>
  //             <div className="modal-body" id="invoice-content">
  //               <div className="container">
  //                 <div className="row mb-4">
  //                   <div className="col-8">
  //                     <h2 className="text-primary">JobLMS</h2>
  //                     <p>CIT(177)-ULUBERIA</p>
  //                     <p>Email: support@joblms.com</p>
  //                     <p>Phone: +91 9876543210</p>
  //                   </div>
  //                   <div className="col-4 text-end">
  //                     <h4 className="text-secondary">INVOICE</h4>
  //                     <p>
  //                       <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
  //                     </p>
  //                     <p>
  //                       <strong>Date:</strong> {invoiceData.date}
  //                     </p>
  //                   </div>
  //                 </div>

  //                 <hr className="my-4" />

  //                 <div className="row mb-4">
  //                   <div className="col-8">
  //                     <h5>Billed To:</h5>
  //                     <p>{invoiceData.name}</p>
  //                     <p>{invoiceData.email}</p>
  //                   </div>
  //                   <div className="col-4 text-end">
  //                     <h5>Payment Info:</h5>
  //                     <p>
  //                       <strong>Payment ID:</strong> {invoiceData.paymentId}
  //                     </p>
  //                     <p>
  //                       <strong>Method:</strong> Razorpay
  //                     </p>
  //                   </div>
  //                 </div>

  //                 <div className="table-responsive">
  //                   <table className="table table-bordered">
  //                     <thead className="table-light">
  //                       <tr>
  //                         <th>Description</th>
  //                         <th className="text-end">Amount</th>
  //                       </tr>
  //                     </thead>
  //                     <tbody>
  //                       <tr>
  //                         <td>Registration Fee - {invoiceData.plan} Plan</td>
  //                         <td className="text-end">
  //                           ₹{invoiceData.amount.toFixed(2)}
  //                         </td>
  //                       </tr>
  //                       <tr>
  //                         <td>SGST (5%)</td>
  //                         <td className="text-end">
  //                           ₹{invoiceData.sgst.toFixed(2)}
  //                         </td>
  //                       </tr>
  //                       <tr>
  //                         <td>CGST (5%)</td>
  //                         <td className="text-end">
  //                           ₹{invoiceData.cgst.toFixed(2)}
  //                         </td>
  //                       </tr>
  //                     </tbody>
  //                     <tfoot>
  //                       <tr>
  //                         <th>Total</th>
  //                         <th className="text-end">
  //                           ₹{invoiceData.totalAmount.toFixed(2)}
  //                         </th>
  //                       </tr>
  //                     </tfoot>
  //                   </table>
  //                 </div>

  //                 <div className="row mt-4">
  //                   <div className="col-12">
  //                     <div className="alert alert-success">
  //                       <h5>Registration Successful!</h5>
  //                       <p>
  //                         Your account has been successfully created and payment
  //                         has been processed. You can now log in to access all
  //                         features.
  //                       </p>
  //                     </div>
  //                   </div>
  //                 </div>

  //                 <div className="row mt-4">
  //                   <div className="col-12 text-center">
  //                     <p className="text-muted">
  //                       Thank you for choosing JobLMS!
  //                     </p>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="modal-footer">
  //               <button
  //                 id="print-invoice-btn"
  //                 type="button"
  //                 className="btn btn-secondary"
  //                 onClick={handlePrintInvoice}
  //               >
  //                 <i className="bi bi-printer me-2"></i>Print Invoice
  //               </button>
  //               <button
  //                 id="close-invoice-btn"
  //                 type="button"
  //                 className="btn btn-primary"
  //                 onClick={handleCloseInvoice}
  //               >
  //                 Continue to Login
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
  const EligibilityNotice = () => (
    <div className="eligibility-notice p-4 bg-light rounded mb-4">
      <h5 className="text-primary mb-3">Important Eligibility Criteria</h5>
      
      <div className="criteria-section mb-3">
        <h6 className="text-danger">⚠️ Warning for Interns:</h6>
        <ul className="list-unstyled">
          <li>• Interns must register as Regular Students</li>
          <li>• Submitting internship letter as work experience will result in permanent account block within 7 days</li>
        </ul>
      </div>
  
      <div className="criteria-section mb-3">
        <h6 className="text-info">Non-IT Professionals:</h6>
        <ul className="list-unstyled">
          <li>• Must initially subscribe for 6 months as Regular Student</li>
          <li>• After subscription period, can apply for Work Professional status</li>
          <li>• Requires detailed description and documentation for admin verification</li>
        </ul>
      </div>
  
      <div className="criteria-section">
        <h6 className="text-success">IT Professionals:</h6>
        <ul className="list-unstyled">
          <li>• Must provide valid full-time employment proof</li>
          <li>• Company ID and offer letter verification required</li>
        </ul>
      </div>
      <div className="criteria-section mb-3">
      <h6 className="text-danger">Legal Notice for Document Verification:</h6>
      <div className="legal-warning p-2 border-danger border-start">
        <p className="mb-0">
          <strong>⚠️ WARNING:</strong> Submitting edited, fake, or fraudulent documents is a serious offense. 
          If such manipulation is detected during admin verification, the institute reserves the right to take 
          legal action against the student under applicable cybercrime and fraud prevention laws. This may 
          result in criminal charges and academic penalties.
        </p>
      </div>
    </div>
    </div>
  );
  // Update the return statement in your Register component
  return (
    <DesktopOnly>
    <div className="register-container">
      {/* Alert for validation errors */}
      {showAlert && (
        <div
          className="alert alert-danger alert-dismissible fade show container"
          role="alert"
        >
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowAlert(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="register-card card shadow-lg">
            <div className="card-header-custom">
              <div className="logo-container">
                <img
                  src="/assets/owl.png"
                  alt="JobLMS Logo"
                  className="logo-image"
                />
              </div>
              <h2 className="text-white mb-0">Create Your Account</h2>
            </div>
            <EligibilityNotice />
            <div className="card-body p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    name="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    name="phone"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Select Role</label>
                  <select
                    className={`form-select ${errors.role ? "is-invalid" : ""}`}
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="role">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && (
                    <div className="invalid-feedback">{errors.role}</div>
                  )}
                </div>
                {/* Student Type Dialog */}
                {showStudentTypeDialog && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <label className="form-label">Select Student Type:</label>
                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className="btn student-type-btn flex-grow-1 py-2"
                        onClick={() => handleStudentTypeSelection("regular")}
                      >
                        <i className="bi bi-mortarboard me-2"></i>
                        Regular Student
                      </button>
                      <button
                        type="button"
                        className="btn student-type-btn flex-grow-1 py-2"
                        onClick={() =>
                          handleStudentTypeSelection("non-regular")
                        }
                      >
                        <i className="bi bi-briefcase me-2"></i>
                        Working Professional
                      </button>
                    </div>
                    {errors.studentType && (
                      <div className="text-danger mt-2">
                        {errors.studentType}
                      </div>
                    )}
                  </div>
                )}
                {/* Offer Letter Modal */}
                {showOfferLetterModal && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h5 className="mb-3">Professional Documents</h5>

                    <div className="mb-3">
                      <label className="form-label">Upload Offer Letter:</label>
                      <input
                        type="file"
                        className={`form-control ${
                          errors.offerLetter ? "is-invalid" : ""
                        }`}
                        name="offerLetter"
                        onChange={handleFileChange}
                        required
                      />
                      <small className="text-muted d-block mt-1">
                        Please upload your company offer letter (PDF or image
                        format)
                      </small>
                      {errors.offerLetter && (
                        <div className="invalid-feedback">
                          {errors.offerLetter}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Upload Employee ID Proof:
                      </label>
                      <input
                        type="file"
                        className={`form-control ${
                          errors.employeeIdProof ? "is-invalid" : ""
                        }`}
                        name="employeeIdProof"
                        onChange={handleFileChange}
                        required
                      />
                      <small className="text-muted d-block mt-1">
                        Please upload your employee ID card or other proof of
                        employment
                      </small>
                      {errors.employeeIdProof && (
                        <div className="invalid-feedback">
                          {errors.employeeIdProof}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Payment Plans for Regular Students */}
                {showPaymentPlans && (
                  <div className="mb-4 payment-plan-container">
                    <h5 className="mb-3">Select Payment Plan</h5>

                    <div className="payment-plan-option">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="plan-1-month"
                          name="paymentPlan"
                          value="1_month"
                          onChange={() => handlePaymentPlanSelection("1_month")}
                          required
                        />
                        <label
                          className="form-check-label"
                          htmlFor="plan-1-month"
                        >
                          <strong>1 Month</strong> - $5.27 (₹450.89)
                        </label>
                      </div>
                    </div>

                    <div className="payment-plan-option">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="plan-3-month"
                          name="paymentPlan"
                          value="3_month"
                          onChange={() => handlePaymentPlanSelection("3_month")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="plan-3-month"
                        >
                          <strong>3 Months</strong> - $12.28 (₹1050.66)
                        </label>
                      </div>
                    </div>

                    <div className="payment-plan-option">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="plan-6-month"
                          name="paymentPlan"
                          value="6_month"
                          onChange={() => handlePaymentPlanSelection("6_month")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="plan-6-month"
                        >
                          <strong>6 Months</strong> - $29.22 (₹2500.03)
                        </label>
                      </div>
                    </div>

                    <div className="payment-plan-option">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="plan-18-month"
                          name="paymentPlan"
                          value="18_month"
                          onChange={() =>
                            handlePaymentPlanSelection("18_month")
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="plan-18-month"
                        >
                          <strong>18 Months</strong> - $75.98 (₹6500.75)
                        </label>
                      </div>
                    </div>

                    <div className="payment-plan-option">
                      <div className="form-check">
                        <input
                          type="radio"
                          className="form-check-input"
                          id="plan-24-month"
                          name="paymentPlan"
                          value="24_month"
                          onChange={() =>
                            handlePaymentPlanSelection("24_month")
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="plan-24-month"
                        >
                          <strong>24 Months</strong> - $95 (₹8128.08)
                        </label>
                      </div>
                    </div>

                    {errors.paymentPlan && (
                      <div className="text-danger mt-2">
                        {errors.paymentPlan}
                      </div>
                    )}
                  </div>
                )}
                {/* <div className="mb-4 position-relative">
                  <label className="form-label">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    name="password"
                    placeholder="8-32 chars, with letters, numbers & special chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn position-absolute end-0 top-50 translate-middle-y me-3"
                    onClick={togglePasswordVisibility}
                    style={{ zIndex: 10, marginTop: "10px" }}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div> */}
               
                <div className="mb-4 position-relative">
                  <label className="form-label">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    name="password"
                    placeholder="8-32 chars, with letters, numbers & special chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <p className="mb-0">
                      Already have an account?{" "}
                      <a href="/login" className="text-decoration-none fw-bold">
                        Login here
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle me-2"></i>
                  Payment Successful
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseInvoice}
                ></button>
              </div>
              <div className="modal-body" id="invoice-content">
                <div className="container">
                  <div className="row mb-4">
                    <div className="col-8">
                      <h2 className="text-primary">SmartStudy</h2>
                      <p>CIT(177)-ULUBERIA</p>
                      <p>Email: support@SmartStudy.com</p>
                      <p>Phone: +91 9876543210</p>
                    </div>
                    <div className="col-4 text-end">
                      <h4 className="text-secondary">INVOICE</h4>
                      <p>
                        <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
                      </p>
                      <p>
                        <strong>Date:</strong> {invoiceData.date}
                      </p>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="row mb-4">
                    <div className="col-8">
                      <h5>Billed To:</h5>
                      <p>{invoiceData.name}</p>
                      <p>{invoiceData.email}</p>
                    </div>
                    <div className="col-4 text-end">
                      <h5>Payment Info:</h5>
                      <p>
                        <strong>Payment ID:</strong> {invoiceData.paymentId}
                      </p>
                      <p>
                        <strong>Method:</strong> Razorpay
                      </p>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Description</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Registration Fee - {invoiceData.plan} Plan</td>
                          <td className="text-end">
                            ₹{invoiceData.amount.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td>SGST (5%)</td>
                          <td className="text-end">
                            ₹{invoiceData.sgst.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td>CGST (5%)</td>
                          <td className="text-end">
                            ₹{invoiceData.cgst.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>Total</th>
                          <th className="text-end">
                            ₹{invoiceData.totalAmount.toFixed(2)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="alert alert-success">
                        <h5>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Registration Successful!
                        </h5>
                        <p>
                          Your account has been successfully created and payment
                          has been processed. You can now log in to access all
                          features.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12 text-center">
                      <p className="text-muted">
                        Thank you for choosing SmartStudy!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  id="print-invoice-btn"
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrintInvoice}
                >
                  <i className="bi bi-printer me-2"></i>Print Invoice
                </button>
                <button
                  id="close-invoice-btn"
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCloseInvoice}
                >
                  Continue to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </DesktopOnly>
  );
};

export default Register;
