const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const pdf = require('html-pdf'); // Ensure html-pdf is installed: npm install html-pdf

const helpDeskNumber='+1 443-951-9190'

var counter=1;

const subjects = [
    "🛒 Order Update: We've Received Your Request",
    "📄 Payment Details: Your Invoice is Ready",
    "🧾 Your Receipt is Available for Review",
    "🔄 Status Update: Your Payment Has Been Processed",
    "🙏 Thank You! Your Order is Confirmed",
    "✅ Purchase Update: Your Order is Finalized",
    "💳 Payment Processed: Transaction Confirmed",
    "📦 Order Status: Your Package is on Its Way",
    "🛍️ We Appreciate Your Purchase! Here’s Your Confirmation",
    "🎉 Success! Your Order Has Been Completed"
];

const from = [
    "Order Support Team", "Customer Care", "Billing Assistance", "Sales Team",
    "Shipping Updates", "Order Services", "Customer Help Desk", "Billing Notifications",
    "Sales Assistance", "Fulfillment Team", "Customer Alerts", "Billing Department",
    "Logistics Team", "Support Desk", "Order Status Updates", "Client Services",
    "Order Help Team", "Billing Confirmation Team", "Sales Desk", "Order Info Team",
    "Client Relations", "Billing Services", "Sales Updates", "Shipping Assistance"
];

const bodies = [
    "Your order has been successfully placed. Please find the details in the attached file.",
    "Your payment has been processed. The receipt is available in the attachment.",
    "Your order is now being prepared. See the attached file for the latest update.",
    "Your shipment is on the way! Download the attachment for tracking details.",
    "We appreciate your trust! Your invoice is available in the attachment.",
    "Your order is confirmed! The attached file contains all relevant details.",
    "Payment has been received. Please refer to the attachment for transaction info.",
    "Your order details are enclosed. Thank you for choosing us!",
    "Your order summary is available. Kindly review the attached document.",
    "We value your purchase! Your order confirmation is attached."
];

const bodyPrefix = [
    "As a service to ",
    "To provide support for ",
    "To ensure a smooth experience for ",
    "To offer guidance to ",
    "With the help of "
];

const NortonBodies = [
    ", The remittance for your current transaction with Paypal. has been performed strongly. Below mentioned are some specifics related to the RIF invoice no. for your confirmation. Kindly allude to the paper attached , for additional information on your ",

    ", The settlement for your ongoing exchange with Paypal. has been performed emphatically. Underneath referenced are a few points of interest connected with the RIF receipt no. for your affirmation. Mercifully insinuate the paper joined , for extra data on your ",

    ", The settlement for your continuous trade with Paypal. has been performed vehemently. Under referred to are a couple of focal points associated with the RIF receipt no. for your assertion. Benevolently imply the paper joined , for additional information on your ",

    ", The payment for your ongoing trade with Paypal. has been performed vehemently. Under reference are a couple of central points associated with the RIF receipt number. for your final words. Benevolently imply the paper joined for more updates on your ",

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
                text: `${getRandomElement(bodyPrefix)}${receiver.email}. ${getRandomElement(bodies)} ${billName}`, // Random body text for the email
                attachments: [{ filename: fileName, path: pdfPath }] // Attach the generated PDF
            };

            // Send the email with the generated PDF attachment
            await transporter.sendMail(mailOptions);
            console.log(`${counter++}: Email sent from ${sender.email} to ${receiver.email} with attachment: ${fileName}`);
        } catch (error) {
            console.error(`${counter++}: Error sending email from ${sender.email} to ${receiver.email}`, error.message);
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