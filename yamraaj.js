const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const pdf = require('html-pdf'); // Ensure html-pdf is installed: npm install html-pdf
const app = express();

const helpDeskNumber='+1 443-951-9190'

var counter=1;

const subjects = [
    "Order Confirmation: Your Purchase Has Been Received",
    "Invoice Details: Thank You for Your Payment",
    "Receipt for Your Recent Transaction",
    "Order Update: Payment Received Successfully",
    "Thank You for Your Order: Payment Processed",
    "Purchase Receipt: Order Completed",
    "Transaction Success: Your Payment Confirmation",
    "Order Processed: Payment Received",
    "Thank You for Shopping with Us: Payment Confirmed",
    "Your Order Has Been Successfully Paid"
];

const from = [
    "Order Confirmation Team", "Customer Service", "Billing Support", "Sales Confirmation",
    "Shipping Notifications", "Order Processing", "Customer Assistance", "Billing Alerts",
    "Sales Support", "Order Fulfillment", "Customer Notifications", "Billing Team",
    "Shipping Department", "Support Team", "Order Updates", "Customer Care Team",
    "Order Assistance", "Billing Confirmation", "Sales Department", "Order Information",
    "Customer Relations", "Billing Operations", "Sales Notifications", "Shipping Info"
];

const bodies = [
    "Your purchase was successful! Check the attached document for details.",
"Your payment is confirmed. Find your receipt in the attachment.",
"Your order is being processed! Review the attached file for your order details.",
"Your package is on the way! Download the attached file for shipping info.",
"Thank you for your business! Your invoice is attached for your records.",
"Your order is confirmed! The attached document has all the details.",
"Payment received! Please see the attached document for transaction details.",
"Your order information is attached. Thank you for choosing us!",
"Your order summary is ready! Please review the attached document.",
"We appreciate your order! The attached file contains your order confirmation."
];

const bodyPrefix = [
    "For the benefit of ",
    "To support ",
    "To help ",
    "To aid ",
    "To assist ",
    "For the solution of ",
    "With the assistance of ",
];

const NortonBodies = [
    ", The remittance for your current transaction with Paypal. has been performed strongly. Below mentioned are some specifics related to the RIF invoice no. for your confirmation. Kindly allude to the paper attached , for additional information on your ",

    ", The settlement for your ongoing exchange with Paypal. has been performed emphatically. Underneath referenced are a few points of interest connected with the RIF receipt no. for your affirmation. Mercifully insinuate the paper joined , for extra data on your ",

    ", The settlement for your continuous trade with Paypal. has been performed vehemently. Under referred to are a couple of focal points associated with the RIF receipt no. for your assertion. Benevolently imply the paper joined , for additional information on your ",

    ", The payment for your ongoing trade with Paypal. has been performed vehemently. Under reference are a couple of central points associated with the RIF receipt number. for your final words. $invoice_no. Benevolently imply the paper joined for more updates on your ",

    ", The payment for your ongoing deal with Paypal. has been made firmly. There are several main areas related to the RIF receipt number. For your final words kindly suggest the paper joined for additional updates on your ",

    // "To aid $name, The installment for your continuous arrangement with Coin Base Inc. has been made immovably. There are a few primary regions connected to the RIF receipt number. For your last words, $invoice_no. Compassionately propose the paper joined for extra updates on your $invoice_no check.",

    // "To assist $name, The payment for your ongoing transaction with Coin Base Inc. has been made firmly. There are numerous major aspects to the RIF receipt number. For your final words, $invoice_number. Please go to the paper for more information on your $invoice_no check.",
    
    // "For the solution of $name, Your payment for your ongoing transaction with Coin Base Inc. has been done securely. The RIF receipt number is associated with numerous key areas. Your final words are $invoice_no. Please refer to the paper for more updates on your $invoice_no check.",

    // "For the support of $name, The remission for your ongoing transaction with Coin Base Inc. has been paid in full. The RIF receipt number is divided into three major categories. $invoice_number, please say your closing remarks. Please advise that the paper be joined for more updates on your $invoice_no check.",

    // "With the assistance of $name, your ongoing transaction with Coin Base Inc. has been paid in full. There are three primary sorts of RIF receipt numbers. $invoice_number, please conclude. Please request that the document be joined for further information on your $invoice_no check.",
];

const sendersFilePath = path.join(__dirname, 'senders.csv');
const receiversFilePath = path.join(__dirname, 'receivers.csv');
const htmlTemplates = [path.join(__dirname, 'templates/Amazon.html')]; // Add more templates as needed
const senders = [];
const receivers = [];

// Load senders from CSV file
function loadSenders() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(sendersFilePath)
            .pipe(csv())
            .on('data', (row) => senders.push(row))
            .on('end', () => resolve())
            .on('error', (error) => reject(`Error loading senders: ${error.message}`));
    });
}

// Load receivers from CSV file
function loadReceivers() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(receiversFilePath)
            .pipe(csv(['email']))
            .on('data', (row) => {
                if (row.email) receivers.push({ email: row.email.trim() });
            })
            .on('end', () => resolve())
            .on('error', (error) => reject(`Error loading receivers: ${error.message}`));
    });
}

// Utility function to get a random element from an array
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomANInvoice() {    //INV-ABC123456
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    function getRandomChars(source, length) {
        return Array.from({ length }, () => source[Math.floor(Math.random() * source.length)]).join('');
    }

    const randomLetters = getRandomChars(letters, 3); // Generate 3 random letters
    const randomNumbers = getRandomChars(numbers, 6); // Generate 6 random numbers

    return `INV-${randomLetters}${randomNumbers}`;
}

// Function to replace placeholders in the HTML template
function replacePlaceholders(htmlContent, billName) {
    return htmlContent
        .replace(/############/g, helpDeskNumber)
        .replace(/##########/g, billName);
}

// Function to convert HTML to PDF using html-pdf and save it to the specified output path
function convertHtmlToPdf(htmlContent, outputPath) {
    return new Promise((resolve, reject) => {
        const options = { format: 'A4' }; // Options for the PDF format
        pdf.create(htmlContent, options).toFile(outputPath, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.filename);
            }
        });
    });
}

// Function to send emails with PDF attachments
async function sendEmails() {
    for (const receiver of receivers) {
        const sender = getRandomElement(senders);
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Adjust the service based on the sender email provider
            auth: {
                user: sender.email,
                pass: sender.password
            }
        });

        // Read and replace placeholders in the HTML template before converting to PDF
        const htmlContent = fs.readFileSync(getRandomElement(htmlTemplates), 'utf-8');
        
        const billName = getRandomANInvoice();
        const updatedHtmlContent = replacePlaceholders(htmlContent, billName);
        // Generate a random string for the PDF file name
        // const randomString = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, 8);
        const fileName = `${billName}.pdf`; // Properly formatted filename
        const pdfPath = path.join(__dirname, fileName); // Ensure the path uses the actual filename

        try {
            // Convert HTML content to a PDF and save it to the specified path
            await convertHtmlToPdf(updatedHtmlContent, pdfPath);

            const mailOptions = {
                from: `"${getRandomElement(from)}" <${sender.email}>`,
                to: receiver.email,
                subject: getRandomElement(subjects),
                text: `${getRandomElement(bodies)}`, // Random body text for the email
                attachments: [{ filename: fileName, path: pdfPath }] // Attach the generated PDF
            };

            // Send the email with the generated PDF attachment
            await transporter.sendMail(mailOptions);
            console.log(`Email sent from ${sender.email} to ${receiver.email} with attachment: ${fileName} num:${counter++}`);
        } catch (error) {
            console.error(`Error sending email from ${sender.email} to ${receiver.email}:${counter++}`, error.message);
        } finally {
            // Clean up the generated PDF file after sending the email
            if (fs.existsSync(pdfPath)) {
                try {
                    fs.unlinkSync(pdfPath);
                } catch (cleanupError) {
                    console.error(`Error cleaning up file ${fileName}:`, cleanupError.message);
                }
            }
        }
    }
}

// Load data and start the email sending process
(async () => {
    try {
        await loadSenders();
        await loadReceivers();
        await sendEmails();
    } catch (error) {
        console.error('Error initializing email process:', error.message);
    }
})();