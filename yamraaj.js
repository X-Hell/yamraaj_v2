const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const pdf = require('html-pdf'); // Ensure html-pdf is installed: npm install html-pdf

const helpDeskNumber='+1 847-484-4593';
const date = getDate();
const billName = getRandomANInvoice();
const productId = getRandomProductID();
const guId = getRandomGuID();

var counter=1;

const subjects = [
    "Order Update: We've Received Your Request",
    "Payment Details: Your Invoice is Ready",
    "Your Receipt is Available for Review",
    "Status Update: Your Payment Has Been Processed",
    "Thank You! Your Payment is Confirmed",
    "Purchase Update: Your Purchase is Finalized",
    "Payment Processed: Transaction Confirmed",
    "Purchase Status: Your Package is on Its Way",
    "We Appreciate Your Purchase! Here's Your Confirmation",
    "Success! Your Purchase Has Been Completed"
];

const subjectsE = [
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

const from2 = [
    "Support Team", "Customer Care", "Billing Assistance", "Sales Team",
    "Shipping Updates", "Customer Help Desk", "Billing Notifications",
    "Sales Assistance", "Fulfillment Team", "Customer Alerts", "Billing Department",
    "Logistics Team", "Support Desk", "Status Updates", "Client Services",
    "Help Team", "Billing Confirmation Team", "Sales Desk", "Info Team",
    "Client Relations", "Billing Services", "Sales Updates", "Shipping Assistance"
];

const from = [
    "James Anderson", "Emily Roberts", "Michael Johnson", "Sarah Thompson",
    "David Williams", "Jessica Brown", "Matthew Davis", "Ashley Wilson",
    "Daniel Miller", "Olivia Martinez", "Christopher Garcia", "Sophia Taylor",
    "Ethan White", "Ava Harris", "Benjamin Clark", "Emma Lewis",
    "William Walker", "Mia Hall", "Alexander Allen", "Charlotte Young",
    "Henry King", "Amelia Scott", "Lucas Green", "Isabella Adams",
    "Mason Nelson", "Harper Carter", "Elijah Baker", "Evelyn Perez",
    "Sebastian Wright", "Lily Morris"
];

const names = [
    "Jonathan Reed", "Samantha Brooks", "Nicholas Scott", "Lauren Bennett",
    "Brandon Carter", "Victoria Cooper", "Tyler Mitchell", "Abigail Ross",
    "Nathan Peterson", "Madison Hughes", "Zachary Flores", "Hailey Richardson",
    "Ryan Foster", "Alyssa Murphy", "Dylan Powell", "Natalie Simmons",
    "Caleb Jenkins", "Brooklyn Patterson", "Connor Ward", "Savannah Torres",
    "Jason Bryant", "Kaitlyn Gray", "Isaiah Rivera", "Caroline Ramirez",
    "Gabriel Sanders", "Lillian Price", "Logan Wood", "Stella Barnes",
    "Hunter Bennett", "Eleanor Morris"
];


const bodies2 = [
    // "your order has been successfully placed. Please find the details in the attached file.",
    "Your payment has been processed. The receipt is available in the attachment.",
    // "your order is now being prepared. See the attached file for the latest update.",
    "Your shipment is on the way! Download the attachment for tracking details.",
    "We appreciate your trust! Your invoice is available in the attachment.",
    "Your order is confirmed! The attached file contains all relevant details.",
    "Payment has been received. Please refer to the attachment for transaction info.",
    "Your order details are enclosed. Thank you for choosing us!",
    "Your order summary is available. Kindly review the attached document.",
    "We value your purchase! Your order confirmation is attached."
];

const bodies = [
    "We've received your money and have confirmed your order. Our top goal is your satisfaction, and we are available to help. Here is a summary of your order. Please contact us at any moment if you need assistance.",
    "Thank you for your payment! Your order has been confirmed, and we are dedicated to providing you with the best experience. Below is a summary of your order. If you need any assistance, feel free to reach out at any time.",
    "We've successfully processed your payment and confirmed your order. Ensuring your satisfaction is our top priority. Please review your order details below, and don't hesitate to contact us if you need any support.",
    "Your order has been confirmed, and we've received your payment. We're here to assist you whenever needed. Please find your order summary below, and let us know if you have any questions.",
    "Great news! Your payment has been processed, and your order is now confirmed. We're committed to making your experience seamless. Check out the details below, and reach out if you need any help!",
    "Thank you for placing your order! Your payment has been received, and we've confirmed everything. We're always available to assist you, so please reach out if you need any help. Here's your order summary."
];

const addressl1 = ''

const sendersFilePath = path.join(__dirname, 'senders.csv');
const receiversFilePath = path.join(__dirname, 'receivers.csv');
const htmlTemplates = [
    path.join(__dirname, 'templates/Bitcoin.html'),
    path.join(__dirname, 'templates/Paypal2.html'),
    path.join(__dirname, 'templates/Paypal.html')
]; // Add more templates as needed
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

function getDate() {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const d = new Date();
    let day = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    // Function to add ordinal suffix
    function getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return "th"; // Covers 4-20
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

function getRandomANInvoice() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    function getRandomChars(source, length) {
        return Array.from({ length }, () => source[Math.floor(Math.random() * source.length)]).join('');
    }

    const part1 = getRandomChars(letters + numbers, 3); // 3 random alphanumeric characters
    const part2 = getRandomChars(letters + numbers, 4); // 4 random alphanumeric characters
    const part3 = getRandomChars(letters + numbers, 4); // 4 random alphanumeric characters

    return `${part1}-${part2}-${part3}`;
}

function getRandomProductID() {   
    const numbers = "0123456789";

    function getRandomChars(source, length) {
        return Array.from({ length }, () => source[Math.floor(Math.random() * source.length)]).join('');
    }

    return getRandomChars(numbers, 10); // Generate 10 random digits
}

function getRandomGuID() {   
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    function getRandomChars(source, length) {
        return Array.from({ length }, () => source[Math.floor(Math.random() * source.length)]).join('');
    }

    return (
        getRandomChars(letters, 2) + // 2 Letters
        getRandomChars(numbers, 4) + // 4 Numbers
        getRandomChars(letters, 1) + // 1 Letter
        getRandomChars(numbers, 1) + // 1 Number
        getRandomChars(letters, 6)   // 6 Letters
    );
}

// Function to replace placeholders in the HTML template
function replacePlaceholders(htmlContent, billName, remail) {
    return htmlContent
        .replace(/#phone#/g, helpDeskNumber)
        .replace(/#invoice#/g, billName)
        .replace(/#name#/g, getRandomElement(names))
        .replace(/#product#/g, productId)
        .replace(/#guid#/g, guId)
        .replace(/#date#/g, date);
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
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: sender.email,
                pass: sender.password
            },
            tls: {
                rejectUnauthorized: false // Set to false if using a self-signed certificate
            }
        });

        // Read and replace placeholders in the HTML template before converting to PDF
        const htmlContent = fs.readFileSync(getRandomElement(htmlTemplates), 'utf-8');
        
        
        const updatedHtmlContent = replacePlaceholders(htmlContent, billName, receiver.email);
        // Generate a random string for the PDF file name
        // const randomString = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, 8);
        const fileName = `INV-${billName}.pdf`; // Properly formatted filename
        const pdfPath = path.join(__dirname, fileName); // Ensure the path uses the actual filename
        const From = getRandomElement(from);
        try {
            // Convert HTML content to a PDF and save it to the specified path
            await convertHtmlToPdf(updatedHtmlContent, pdfPath);

            const mailOptions = {
                from: `"${From}" <${sender.email}>`,
                to: receiver.email,
                subject: getRandomElement(subjectsE),
                text: `${getRandomElement(bodies)}

Invoice Number: INV-${billName}

Regards,
${From}`, // Random body text for the email
                // html: '<!DOCTYPE html>'+
                //         '<html><head><title>Appointment</title>'+
                //         '</head><body><div>'+
                //         '<img src="http://evokebeautysalon1.herokuapp.com/main/img/logo.png" alt="" width="160">'+
                //         '<p>Thank you for your appointment.</p>'+
                //         '<p>Here is summery:</p>'+
                //         '<p>Name: James Falcon</p>'+
                //         '<p>Date: Feb 2, 2017</p>'+
                //         '<p>Package: Hair Cut </p>'+
                //         '<p>Arrival time: 4:30 PM</p>'+
                //         '</div></body>'+
                //         '</html>',
                attachments: [{ filename: fileName, path: pdfPath }], // Attach the generated PDF
                headers: {
                    // List-Unsubscribe header to aid in spam avoidance
                    'List-Unsubscribe': `<mailto:${receiver.email}>`    
                }
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