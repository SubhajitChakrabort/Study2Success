import React, { useState, useEffect, useRef } from "react";
import "./CommissionReport.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaMoneyBillWave,
  FaUserTie,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaFilePdf,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";

const CommissionReport = () => {
  const [commissionData, setCommissionData] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [adminTotalCommission, setAdminTotalCommission] = useState(0);
  const [teacherTotalCommission, setTeacherTotalCommission] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const reportRef = useRef(null);

  useEffect(() => {
    // First, get profile data directly from the API
    fetchProfileData();
  }, [dateRange]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://smartstudy-server.onrender.com/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Profile data:", data);

      if (data && data.role) {
        setUserRole(data.role);
        setUserId(data.id);
        setIsAdmin(data.role === "admin");
        console.log(
          "User role set from profile:",
          data.role,
          "Is admin:",
          data.role === "admin"
        );
      }

      // Now fetch commission data
      fetchCommissionData();
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Try to get role from token as fallback
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Token payload:", payload);
          setUserRole(payload.role);
          setUserId(payload.id);
          setIsAdmin(payload.role === "admin");
        } catch (tokenError) {
          console.error("Error parsing token:", tokenError);
        }
      }
      fetchCommissionData();
    }
  };

  const fetchCommissionData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://smartstudy-server.onrender.com/api/payment/commission-report",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        console.log("Commission data received:", data);

        // Update role from API response if available
        if (data.userRole) {
          console.log("Setting user role from API response:", data.userRole);
          setUserRole(data.userRole);
          setIsAdmin(data.userRole === "admin");
        }

        setCommissionData(data.commissions);

        // Calculate admin and teacher commissions separately
        // const totalRegistration = data.commissions.reduce(
        //   (sum, item) => sum + Number(item.registrationAmount || 0),
        //   0
        // );

        // const adminCommission = totalRegistration * 0.3; // 30% for admin
        // const teacherCommission = totalRegistration * 0.7; // 70% for teachers

        // setAdminTotalCommission(adminCommission);
        // setTeacherTotalCommission(teacherCommission);

        // // Set the appropriate total based on user role
        // if (data.userRole === "admin") {
        //   setTotalCommission(adminCommission);
        // } else {
        //   // For teachers, use the commission value from the API or calculate individual share
        //   setTotalCommission(Number(data.totalCommission) || 0);
        // }
        // Calculate admin and teacher commissions separately
const totalRegistrationBase = data.commissions.reduce(
  (sum, item) => sum + Number(item.registrationAmount || 0),
  0
);

// Calculate total amount including taxes
const totalRegistration = data.commissions.reduce(
  (sum, item) => {
    const baseAmount = Number(item.registrationAmount || 0);
    const withTaxes = baseAmount + (baseAmount * 0.05) + (baseAmount * 0.05); // Add SGST (5%) and CGST (5%)
    return sum + withTaxes;
  },
  0
);

const adminCommission = totalRegistration * 0.3; // 30% for admin
const teacherCommission = totalRegistration * 0.7; // 70% for teachers

setAdminTotalCommission(adminCommission);
setTeacherTotalCommission(teacherCommission);

// Set the appropriate total based on user role
if (data.userRole === "admin") {
  setTotalCommission(adminCommission);
} else {
  // For teachers, use the commission value from the API or calculate individual share
  setTotalCommission(Number(data.totalCommission) || 0);
}

      } else {
        console.error("Error in commission data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching commission data:", error);
      setCommissionData([]);
      setTotalCommission(0);
      setAdminTotalCommission(0);
      setTeacherTotalCommission(0);
    } finally {
      setLoading(false);
    }
  };


  // Calculate summary statistics
  const totalStudents = commissionData.length;
  const totalRegistrationAmount = commissionData.reduce(
    (sum, item) => sum + Number(item.registrationAmount || 0),
    0
  );

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    // In a real app, you would filter data based on the selected date range
    // or make a new API call with date parameters
  };

  // Updated print function that will properly generate a PDF
  const handlePrintReport = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
  
    // Get the current date for the report title
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  
    // Add necessary styles and content for the print window with improved styling
    printWindow.document.write(`
      <html>
        <head>
          <title>Commission Report - ${currentDate}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { 
              padding: 0; 
              margin: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
            }
            .report-container {
              max-width: 1000px;
              margin: 0 auto;
              padding: 30px;
            }
            .report-header {
              background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              margin-bottom: 0;
            }
            .report-body {
              background: #fff;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .report-footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .stats-container {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .stat-card {
              background: white;
              border-radius: 10px;
              padding: 20px;
              width: 30%;
              box-shadow: 0 3px 10px rgba(0,0,0,0.08);
              margin-bottom: 15px;
              border-left: 5px solid #2575fc;
            }
            .stat-card.students {
              border-left-color: #2575fc;
            }
            .stat-card.registration {
              border-left-color: #11cb6a;
            }
            .stat-card.commission {
              border-left-color: #cb6a11;
            }
            .stat-title {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .commission-structure {
              background: #f8f9fa;
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 30px;
              border-left: 5px solid #6a11cb;
            }
            .commission-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #444;
            }
            .commission-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #ddd;
            }
            .commission-item:last-child {
              border-bottom: none;
            }
            .commission-label {
              font-weight: 500;
            }
            .commission-value {
              font-weight: bold;
            }
            .student-list {
              margin-top: 30px;
            }
            .student-card {
              background: white;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.05);
              border-left: 3px solid #ddd;
            }
            .student-card:nth-child(odd) {
              border-left-color: #2575fc;
            }
            .student-card:nth-child(even) {
              border-left-color: #6a11cb;
            }
            .student-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .student-name {
              font-weight: bold;
              font-size: 16px;
            }
            .student-date {
              color: #666;
              font-size: 14px;
            }
            .student-details {
              display: flex;
              flex-wrap: wrap;
            }
            .student-detail {
              width: 50%;
              margin-bottom: 5px;
            }
            .detail-label {
              color: #666;
              font-size: 12px;
            }
            .detail-value {
              font-weight: 500;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #eee;
            }
            .amount-item {
              text-align: center;
            }
            .amount-label {
              font-size: 12px;
              color: #666;
            }
            .amount-value {
              font-weight: bold;
              color: #333;
            }
            .amount-value.registration {
              color: #11cb6a;
            }
            .amount-value.admin {
              color: #cb6a11;
            }
            .amount-value.teacher {
              color: #6a11cb;
            }
            .totals-section {
              background: #f8f9fa;
              border-radius: 10px;
              padding: 20px;
              margin-top: 30px;
              border-left: 5px solid #11cb6a;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px dashed #ddd;
            }
            .total-row:last-child {
              border-bottom: none;
            }
            .total-label {
              font-weight: bold;
            }
            .total-value {
              font-weight: bold;
            }
            .no-print { display: none; }
            @media print {
              .no-print { display: none; }
              .page-break { page-break-before: always; }
              body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .report-header {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            .action-buttons {
              margin-top: 30px;
              text-align: center;
            }
            .print-btn {
              background: #2575fc;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin-right: 10px;
              font-weight: 500;
            }
            .close-btn {
              background: #6c757d;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-weight: 500;
            }
          </style>
          <script>
            // Auto-print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          </script>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h2 style="margin-bottom: 5px;">Commission Report</h2>
                  <p style="margin-bottom: 0; opacity: 0.8;">${currentDate}</p>
                </div>
                <div style="text-align: right;">
                <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" style="height: 100px; width: 100px; margin-right: 10px;" />
                  <h3 style="margin-bottom: 5px;">SmartStudy</h3>
                  <p style="margin-bottom: 0; opacity: 0.8;">CIT(177)-ULUBERIA</p>
                </div>
              </div>
            </div>
            
            <div class="report-body">
              <div style="margin-bottom: 20px;">
                
                <p><strong>Role:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
              </div>
              
              <div class="stats-container">
                <div class="stat-card students">
                  <div class="stat-title">Total Students</div>
                  <div class="stat-value">${totalStudents}</div>
                </div>
                <div class="stat-card registration">
                  <div class="stat-title">Total Registration</div>
                  <div class="stat-value">₹${totalRegistrationAmount.toFixed(2)}</div>
                </div>
                <div class="stat-card commission">
                  <div class="stat-title">${isAdmin ? "Admin Commission" : "Your Commission"}</div>
                  <div class="stat-value">₹${(isAdmin ? adminTotalCommission : totalCommission).toFixed(2)}</div>
                </div>
              </div>
              
              <div class="commission-structure">
                <div class="commission-title">Commission Structure</div>
                <div class="commission-item">
                  <div class="commission-label">Admin (30%)</div>
                  <div class="commission-value">₹${adminTotalCommission.toFixed(2)}</div>
                </div>
                <div class="commission-item">
                  <div class="commission-label">Teachers (70%)</div>
                  <div class="commission-value">₹${teacherTotalCommission.toFixed(2)}</div>
                </div>
              </div>
              
              <div class="student-list">
                <h4 style="margin-bottom: 20px; color: #444; border-bottom: 2px solid #eee; padding-bottom: 10px;">Student Registration Details</h4>
                
                ${commissionData.length > 0 
                  ? commissionData.map((item, index) => `
                    <div class="student-card">
                      <div class="student-header">
                        <div class="student-name">${item.studentName || "N/A"}</div>
                        <div class="student-date">${item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</div>
                      </div>
                      <div class="student-details">
                        <div class="student-detail">
                          <div class="detail-label">Department</div>
                          <div class="detail-value">${item.department || "N/A"}</div>
                        </div>
                        <div class="student-detail">
                          <div class="detail-label">Email</div>
                          <div class="detail-value">${item.email || "N/A"}</div>
                        </div>
                        <div class="student-detail">
                          <div class="detail-label">Phone</div>
                          <div class="detail-value">${item.phone || "N/A"}</div>
                        </div>
                      </div>
                      <div class="amount-row">
                        <div class="amount-item">
                          <div class="amount-label">Registration Amount</div>
                          <div class="amount-value registration">₹${Number(item.registrationAmount).toFixed(2)}</div>
                        </div>
                        ${isAdmin 
                          ? `
                            <div class="amount-item">
                              <div class="amount-label">Admin (30%)</div>
                              <div class="amount-value admin">₹${Number(item.adminCommission).toFixed(2)}</div>
                            </div>
                            <div class="amount-item">
                              <div class="amount-label">Teachers (70%)</div>
                              <div class="amount-value teacher">₹${Number(item.teacherTotalCommission).toFixed(2)}</div>
                            </div>
                            <div class="amount-item">
                              <div class="amount-label">Per Teacher</div>
                              <div class="amount-value">₹${Number(item.teacherIndividualCommission).toFixed(2)}</div>
                            </div>
                          `
                          : `
                            <div class="amount-item">
                              <div class="amount-label">Your Commission</div>
                              <div class="amount-value admin">₹${Number(item.commission).toFixed(2)}</div>
                            </div>
                          `
                        }
                      </div>
                    </div>
                  `).join("")
                  : `<div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 10px;">
                      <p style="margin: 0; color: #666;">No commission data available</p>
                    </div>`
                }
              </div>
              
              <div class="totals-section">
                <div class="commission-title">Summary</div>
                <div class="total-row">
                  <div class="total-label">Total Registration Amount</div>
                  <div class="total-value">₹${totalRegistrationAmount.toFixed(2)}</div>
                </div>
                ${isAdmin 
                  ? `
                    <div class="total-row">
                      <div class="total-label">Total Admin Commission (30%)</div>
                      <div class="total-value">₹${adminTotalCommission.toFixed(2)}</div>
                    </div>
                    <div class="total-row">
                      <div class="total-label">Total Teachers Commission (70%)</div>
                      <div class="total-value">₹${teacherTotalCommission.toFixed(2)}</div>
                    </div>
                  `
                  : `
                    <div class="total-row">
                      <div class="total-label">Your Total Commission</div>
                      <div class="total-value">₹${totalCommission.toFixed(2)}</div>
                    </div>
                  `
                }
              </div>
              
              <div class="report-footer">
                <p>This is an automatically generated report. No signature required.</p>
                <p>Generated on ${currentDate}</p>
              </div>
              
              <div class="action-buttons no-print">
                <button onclick="window.print()" class="print-btn">Print Report</button>
                <button onclick="window.close()" class="close-btn">Close</button>
              </div>
            </div>
          </div>
        </body>
      </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};


  // Function to download data as Excel file
  const downloadExcel = () => {
    // Prepare data for Excel
    const excelData = commissionData.map((item) => {
      const baseData = {
        "Student Name": item.studentName || "N/A",
        Department: item.department || "N/A",
        Email: item.email || "N/A",
        Phone: item.phone || "N/A",
        "Registration Amount": Number(item.registrationAmount).toFixed(2),
        Date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
      };

      // Add role-specific columns
      if (isAdmin) {
        return {
          ...baseData,
          "Admin Commission (30%)": Number(item.adminCommission).toFixed(2),
          "Teachers Commission (70%)": Number(
            item.teacherTotalCommission
          ).toFixed(2),
          "Per Teacher": Number(item.teacherIndividualCommission).toFixed(2),
        };
      } else {
        return {
          ...baseData,
          "Your Commission": Number(item.commission).toFixed(2),
        };
      }
    });

    // Add summary row
    const summaryRow = {
      "Student Name": "TOTAL",
      Department: "",
      Email: "",
      Phone: "",
      "Registration Amount": totalRegistrationAmount.toFixed(2),
    };

    if (isAdmin) {
      summaryRow["Admin Commission (30%)"] = adminTotalCommission.toFixed(2);
      summaryRow["Teachers Commission (70%)"] =
        teacherTotalCommission.toFixed(2);
      summaryRow["Per Teacher"] = "";
    } else {
      summaryRow["Your Commission"] = totalCommission.toFixed(2);
    }

    excelData.push(summaryRow);

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Report");

    // Generate Excel file
    const fileName = `Commission_Report_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Function to download data as PDF using html2pdf
  // Function to download data as PDF using html2pdf
  const downloadPDF = () => {
    // Create a new window for the PDF content
    const printWindow = window.open("", "_blank");

    // Get the current date for the report title
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Add necessary styles and content for the PDF
    printWindow.document.write(`
         <html>
      <head>
        <title>Commission Report - ${currentDate}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { 
            padding: 0; 
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
          }
          .report-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 30px;
          }
          .report-header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            margin-bottom: 0;
          }
          .report-body {
            background: #fff;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          .report-footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .stats-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .stat-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            width: 30%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            margin-bottom: 15px;
            border-left: 5px solid #2575fc;
          }
          .stat-card.students {
            border-left-color: #2575fc;
          }
          .stat-card.registration {
            border-left-color: #11cb6a;
          }
          .stat-card.commission {
            border-left-color: #cb6a11;
          }
          .stat-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .commission-structure {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 5px solid #6a11cb;
          }
          .commission-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #444;
          }
          .commission-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #ddd;
          }
          .commission-item:last-child {
            border-bottom: none;
          }
          .commission-label {
            font-weight: 500;
          }
          .commission-value {
            font-weight: bold;
          }
          .student-list {
            margin-top: 30px;
          }
          .student-card {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border-left: 3px solid #ddd;
          }
          .student-card:nth-child(odd) {
            border-left-color: #2575fc;
          }
          .student-card:nth-child(even) {
            border-left-color: #6a11cb;
          }
          .student-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .student-name {
            font-weight: bold;
            font-size: 16px;
          }
          .student-date {
            color: #666;
            font-size: 14px;
          }
          .student-details {
            display: flex;
            flex-wrap: wrap;
          }
          .student-detail {
            width: 50%;
            margin-bottom: 5px;
          }
          .detail-label {
            color: #666;
            font-size: 12px;
          }
          .detail-value {
            font-weight: 500;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
          }
          .amount-item {
            text-align: center;
          }
          .amount-label {
            font-size: 12px;
            color: #666;
          }
          .amount-value {
            font-weight: bold;
            color: #333;
          }
          .amount-value.registration {
            color: #11cb6a;
          }
          .amount-value.admin {
            color: #cb6a11;
          }
          .amount-value.teacher {
            color: #6a11cb;
          }
          .totals-section {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
            border-left: 5px solid #11cb6a;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px dashed #ddd;
          }
          .total-row:last-child {
            border-bottom: none;
          }
          .total-label {
            font-weight: bold;
          }
          .total-value {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div id="pdf-content">
          <div class="report-container">
            <div class="report-header">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h2 style="margin-bottom: 5px;">Commission Report</h2>
                  <p style="margin-bottom: 0; opacity: 0.8;">${currentDate}</p>
                </div>
                <div style="text-align: right;">
                 <img src="/assets/owl.png" alt="JobLMS Logo" className="navbar-logo" style="height: 100px; width: 100px; margin-right: 10px;" />
                  <h3 style="margin-bottom: 5px;">SmartStudy</h3>
                  <p style="margin-bottom: 0; opacity: 0.8;">CIT(177)-ULUBERIA</p>
                </div>
              </div>
            </div>
            
            <div class="report-body">
              <div style="margin-bottom: 20px;">
               
                <p><strong>Role:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
              </div>
              
              <div class="stats-container">
                <div class="stat-card students">
                  <div class="stat-title">Total Students</div>
                  <div class="stat-value">${totalStudents}</div>
                </div>
                <div class="stat-card registration">
                  <div class="stat-title">Total Registration</div>
                  <div class="stat-value">₹${totalRegistrationAmount.toFixed(2)}</div>
                </div>
                <div class="stat-card commission">
                  <div class="stat-title">${isAdmin ? "Admin Commission" : "Your Commission"}</div>
                  <div class="stat-value">₹${(isAdmin ? adminTotalCommission : totalCommission).toFixed(2)}</div>
                </div>
              </div>
              
              <div class="commission-structure">
                <div class="commission-title">Commission Structure</div>
                <div class="commission-item">
                  <div class="commission-label">Admin (30%)</div>
                  <div class="commission-value">₹${adminTotalCommission.toFixed(2)}</div>
                </div>
                <div class="commission-item">
                  <div class="commission-label">Teachers (70%)</div>
                  <div class="commission-value">₹${teacherTotalCommission.toFixed(2)}</div>
                </div>
              </div>
              
              <div class="student-list">
                <h4 style="margin-bottom: 20px; color: #444; border-bottom: 2px solid #eee; padding-bottom: 10px;">Student Registration Details</h4>
                
                ${commissionData.length > 0 
                  ? commissionData.map((item, index) => `
                    <div class="student-card">
                      <div class="student-header">
                        <div class="student-name">${item.studentName || "N/A"}</div>
                        <div class="student-date">${item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</div>
                      </div>
                      <div class="student-details">
                        <div class="student-detail">
                          <div class="detail-label">Department</div>
                          <div class="detail-value">${item.department || "N/A"}</div>
                        </div>
                        <div class="student-detail">
                          <div class="detail-label">Email</div>
                          <div class="detail-value">${item.email || "N/A"}</div>
                        </div>
                        <div class="student-detail">
                          <div class="detail-label">Phone</div>
                          <div class="detail-value">${item.phone || "N/A"}</div>
                        </div>
                      </div>
                      <div class="amount-row">
                        <div class="amount-item">
                          <div class="amount-label">Registration Amount</div>
                          <div class="amount-value registration">₹${Number(item.registrationAmount).toFixed(2)}</div>
                        </div>
                        ${isAdmin 
                          ? `
                            <div class="amount-item">
                              <div class="amount-label">Admin (30%)</div>
                              <div class="amount-value admin">₹${Number(item.adminCommission).toFixed(2)}</div>
                            </div>
                            <div class="amount-item">
                              <div class="amount-label">Teachers (70%)</div>
                              <div class="amount-value teacher">₹${Number(item.teacherTotalCommission).toFixed(2)}</div>
                            </div>
                            <div class="amount-item">
                              <div class="amount-label">Per Teacher</div>
                              <div class="amount-value">₹${Number(item.teacherIndividualCommission).toFixed(2)}</div>
                            </div>
                          `
                          : `
                            <div class="amount-item">
                              <div class="amount-label">Your Commission</div>
                              <div class="amount-value admin">₹${Number(item.commission).toFixed(2)}</div>
                            </div>
                          `
                        }
                      </div>
                    </div>
                  `).join("")
                  : `<div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 10px;">
                      <p style="margin: 0; color: #666;">No commission data available</p>
                    </div>`
                }
              </div>
              
              <div class="totals-section">
                <div class="commission-title">Summary</div>
                <div class="total-row">
                  <div class="total-label">Total Registration Amount</div>
                  <div class="total-value">₹${totalRegistrationAmount.toFixed(2)}</div>
                </div>
                ${isAdmin 
                  ? `
                    <div class="total-row">
                      <div class="total-label">Total Admin Commission (30%)</div>
                      <div class="total-value">₹${adminTotalCommission.toFixed(2)}</div>
                    </div>
                    <div class="total-row">
                      <div class="total-label">Total Teachers Commission (70%)</div>
                      <div class="total-value">₹${teacherTotalCommission.toFixed(2)}</div>
                    </div>
                  `
                  : `
                    <div class="total-row">
                      <div class="total-label">Your Total Commission</div>
                      <div class="total-value">₹${totalCommission.toFixed(2)}</div>
                    </div>
                  `
                }
              </div>
              
              <div class="report-footer">
                <p>This is an automatically generated report. No signature required.</p>
                <p>Generated on ${currentDate}</p>
              </div>
            </div>
          </div>
        </div>
        
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <script>
          // Function to generate and download PDF
          window.onload = function() {
            const element = document.getElementById('pdf-content');
            const opt = {
              margin: 10,
              filename: 'Commission_Report_${new Date().toISOString().split("T")[0]}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate PDF and download
            html2pdf().set(opt).from(element).save().then(() => {
              // Close the window after download
              setTimeout(() => {
                window.close();
              }, 1000);
            });
          };
        </script>
      </body>
    </html>
      `);

    printWindow.document.close();
  };

  return (
    <div className="container mt-4" ref={reportRef}>
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>
            <FaMoneyBillWave className="me-2 text-success" />
            Commission Report
          </h2>
          <p className="text-muted">
            View your commission earnings from student registrations
          </p>
        </div>
        <div className="col-md-4 text-end">
          <div className="btn-group">
            <button
              className="btn btn-primary me-2"
              onClick={handlePrintReport}
            >
              <FaPrint className="me-2" /> Print Report
            </button>
            <button className="btn btn-success me-2" onClick={downloadExcel}>
              <FaFileExcel className="me-2" /> Export Excel
            </button>
            <button className="btn btn-danger" onClick={downloadPDF}>
              <FaFilePdf className="me-2" /> Export PDF
            </button>
          </div>
        </div>
      </div>
{/* 
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="dateRange">Date Range:</label>
            <select
              id="dateRange"
              className="form-control"
              value={dateRange}
              onChange={handleDateRangeChange}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div> */}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading commission data...</p>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        <FaUserTie className="me-2" />
                        Total Students
                      </h6>
                      <h3 className="card-title">{totalStudents}</h3>
                    </div>
                    <div className="icon-bg bg-primary">
                      <FaUserTie className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        <FaMoneyBillWave className="me-2" />
                        Total Registration
                      </h6>
                      <h3 className="card-title">
                        ₹{totalRegistrationAmount.toFixed(2)}
                      </h3>
                    </div>
                    <div className="icon-bg bg-success">
                      <FaMoneyBillWave className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-subtitle mb-2 text-muted">
                        <FaMoneyBillWave className="me-2" />
                        {isAdmin ? "Admin Commission" : "Your Commission"}
                      </h6>
                      <h3 className="card-title">
                        ₹
                        {(isAdmin
                          ? adminTotalCommission
                          : totalCommission
                        ).toFixed(2)}
                      </h3>
                    </div>
                    <div className="icon-bg bg-danger">
                      <FaMoneyBillWave className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Commission Structure</h5>
            </div>
            <div className="card-body">
              <p>
                For each student registration, the commission is distributed as
                follows:
              </p>
              <ul>
                <li>
                  <strong>Admin:</strong> 30% of the registration amount (₹
                  {adminTotalCommission.toFixed(2)})
                </li>
                <li>
                  <strong>Teachers:</strong> 70% of the registration amount (₹
                  {teacherTotalCommission.toFixed(2)}), divided equally among
                  all teachers
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Commission Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registration Amount</th>
                      {isAdmin ? (
                        <>
                          <th>Admin (30%)</th>
                          <th>Teachers (70%)</th>
                          <th>Per Teacher</th>
                        </>
                      ) : (
                        <th>Your Commission</th>
                      )}
                      <th>
                        <FaCalendarAlt className="me-1" /> Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionData.length > 0 ? (
                      commissionData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.studentName || "N/A"}</td>
                          <td>{item.department || "N/A"}</td>
                          <td>{item.email || "N/A"}</td>
                          <td>{item.phone || "N/A"}</td>
                          <td className="text-end">
                            ₹{Number(item.registrationAmount).toFixed(2)}
                          </td>
                          {isAdmin ? (
                            <>
                              <td className="text-end">
                                ₹{Number(item.adminCommission).toFixed(2)}
                              </td>
                              <td className="text-end">
                                ₹
                                {Number(item.teacherTotalCommission).toFixed(2)}
                              </td>
                              <td className="text-end">
                                ₹
                                {Number(
                                  item.teacherIndividualCommission
                                ).toFixed(2)}
                              </td>
                            </>
                          ) : (
                            <td className="text-end">
                              ₹{Number(item.commission).toFixed(2)}
                            </td>
                          )}
                          <td>
                            {item.date
                              ? new Date(item.date).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={isAdmin ? 9 : 7}
                          className="text-center py-4"
                        >
                          No commission data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="table-active">
                      <th colSpan={4}>TOTAL</th>
                      <th className="text-end">
                        ₹{totalRegistrationAmount.toFixed(2)}
                      </th>
                      {isAdmin ? (
                        <>
                          <th className="text-end">
                            ₹{adminTotalCommission.toFixed(2)}
                          </th>
                          <th className="text-end">
                            ₹{teacherTotalCommission.toFixed(2)}
                          </th>
                          <th></th>
                        </>
                      ) : (
                        <th className="text-end">
                          ₹{totalCommission.toFixed(2)}
                        </th>
                      )}
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommissionReport;
