import nodemailer from 'nodemailer';
import pdfkit from 'pdfkit';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name from the module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Google OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Passwords for security
  },
  tls: {
    rejectUnauthorized: false, // Disable certificate validation
  },
});

// Helper function to generate the PDF receipt
const generatePDFReceipt = (receiptData) => {
  const doc = new pdfkit();
  const filePath = path.resolve(__dirname, `receipt_${Date.now()}.pdf`);
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  // Add custom font and styling
  doc.fontSize(20).fillColor('#4CAF50').text('Receipt', { align: 'center' });
  doc.moveDown(2);

  // Add user details with styling
  doc.fontSize(14).fillColor('#000000')
     .text(`Purchased By: ${receiptData.userName}`, { underline: true });
  doc.moveDown();

  // Handle multiple products or single product
  if (receiptData.isMultipleProducts) {
    // Display multiple products
    doc.fontSize(14).text('Items Purchased:', { underline: true });
    doc.moveDown();

    // Create a table-like structure for products
    receiptData.products.forEach((product, index) => {
      doc.fontSize(12)
         .text(`${index + 1}. ${product.name}`)
         .text(`   Quantity: ${product.quantity}`)
         .text(`   Price: ₱${product.price.toFixed(2)}`)
         .text(`   Subtotal: ₱${product.totalPrice.toFixed(2)}`);
      doc.moveDown(0.5);
    });
  } else {
    // Display single product
    doc.text(`Product: ${receiptData.productName}`);
    doc.text(`Quantity: ${receiptData.quantity}`);
    doc.text(`Price: ₱${receiptData.productPrice.toFixed(2)}`);
  }

  // Add total price and payment method
  doc.moveDown();
  doc.fontSize(14).text(`Total Price: ₱${receiptData.totalPrice.toFixed(2)}`, { underline: true });
  doc.text(`Payment Method: ${receiptData.paymentMethod}`);

  // Add border and some more visual separation
  doc.moveDown();
  doc.rect(50, doc.y, 500, 2).fill('#4CAF50');  // Green separator line

  doc.moveDown();
  doc.text(`Transaction ID: ${receiptData.transactionId}`);
  doc.text(`Transaction Date: ${receiptData.transactionDate}`);

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
};

// Helper function to send email with both HTML content and receipt attachment
const sendEmailWithAttachment = async (email, filePath, receiptData) => {
  // Generate table rows based on whether it's a single product or multiple products
  let productRows = '';

  if (receiptData.isMultipleProducts) {
    // Multiple products
    receiptData.products.forEach(product => {
      productRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₱${product.price.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₱${product.totalPrice.toFixed(2)}</td>
        </tr>
      `;
    });
  } else {
    // Single product
    productRows = `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${receiptData.productName}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${receiptData.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₱${receiptData.productPrice.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₱${receiptData.totalPrice.toFixed(2)}</td>
      </tr>
    `;
  }

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="text-align: center; color: #4CAF50;">Receipt for Your Purchase</h2>
        <p>Dear ${receiptData.userName},</p>
        <p>Thank you for your purchase! Below are the details of your transaction:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #f4f4f4;">
            <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Total Price</th>
          </tr>
          ${productRows}
        </table>
        <p style="margin-top: 20px; font-weight: bold;">Total Amount: ₱${receiptData.totalPrice.toFixed(2)}</p>
        <p style="margin-top: 20px;">Payment Method: ${receiptData.paymentMethod}</p>
        <p style="margin-top: 20px;">Transaction ID: ${receiptData.transactionId}</p>
        <p style="margin-top: 20px;">Transaction Date: ${receiptData.transactionDate}</p>
        <p>We hope to serve you again soon!</p>
        <p>Looking forward to serving you again!<br>thank you for your trust!</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Receipt',
    html: htmlContent,
    attachments: [
      {
        path: filePath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

const getGoogleDriveFileUrl = (fileId) => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

// Helper function to upload the file to Google Drive
const uploadToGoogleDrive = async (filePath) => {
  try {
    // First try with the specified folder ID
    const fileMetadata = {
      name: path.basename(filePath),
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : undefined,
    };

    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath),
    };

    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    return driveResponse.data.id; // Returns the file ID in Google Drive
  } catch (error) {
    console.error('Error uploading to Google Drive with folder ID:', error);

    // If there's an error with the folder ID, try uploading to the root folder
    if (error.message.includes('insufficientParentPermissions') ||
        error.message.includes('Insufficient permissions')) {
      console.log('Attempting to upload to root folder instead...');

      const fileMetadata = {
        name: path.basename(filePath),
        // No parents specified - will upload to root of the drive
      };

      const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(filePath),
      };

      const driveResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      return driveResponse.data.id;
    }

    // If it's another type of error, rethrow it
    throw error;
  }
};

// Receipt Controller
const createReceipt = async (req, res) => {
  const {
    product,
    products,
    quantity,
    totalPrice,
    paymentMethod,
    user,
    transactionId,
    transactionDate,
    isMultipleProducts
  } = req.body;

  // Validate data based on whether it's a single product or multiple products
  if (isMultipleProducts) {
    // Multiple products validation
    if (!products || !Array.isArray(products) || products.length === 0 || !totalPrice || !paymentMethod || !user || !transactionId || !transactionDate) {
      return res.status(400).send({ message: 'Missing required fields for multiple products' });
    }
  } else {
    // Single product validation
    if (!product || !quantity || !totalPrice || !paymentMethod || !user || !transactionId || !transactionDate) {
      return res.status(400).send({ message: 'Missing required fields for single product' });
    }
  }

  // Create receipt data object
  let receiptData = {
    userName: `${user.firstname} ${user.lastname}`,
    totalPrice: totalPrice,
    paymentMethod: paymentMethod,
    transactionId: transactionId,
    transactionDate: transactionDate,
    isMultipleProducts: isMultipleProducts
  };

  // Add product-specific data based on whether it's a single product or multiple products
  if (isMultipleProducts) {
    receiptData.products = products;
  } else {
    receiptData.productName = product.name;
    receiptData.quantity = quantity;
    receiptData.productPrice = product.price;
  }

  try {
    // Generate PDF receipt
    const filePathPDF = await generatePDFReceipt(receiptData);
    console.log('PDF receipt generated at:', filePathPDF);

    // Send email with styled HTML content and PDF attachment
    await sendEmailWithAttachment(user.email, filePathPDF, receiptData);
    console.log('Email sent successfully to:', user.email);

    let driveFileId = null;
    let fileUrl = null;

    try {
      // Try to upload receipt to Google Drive
      driveFileId = await uploadToGoogleDrive(filePathPDF);
      fileUrl = getGoogleDriveFileUrl(driveFileId);
      console.log('Receipt uploaded to Google Drive, file ID:', driveFileId);
    } catch (driveError) {
      console.error('Google Drive upload failed:', driveError);
      // Continue without Google Drive upload - we'll still return success since the email was sent
    }

    // Clean up the file after upload and email
    try {
      fs.unlinkSync(filePathPDF);
      console.log('Temporary PDF file deleted');
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
      // Non-critical error, continue
    }

    // If Google Drive upload failed but email was sent, we still consider it a success
    if (!driveFileId) {
      return res.status(200).send({
        message: 'Receipt generated and emailed successfully, but Google Drive upload failed.',
        emailSent: true,
        driveUpload: false
      });
    }

    // Full success response
    res.status(200).send({
      message: 'Receipt generated, emailed, and uploaded to Google Drive.',
      driveFileId: driveFileId,
      fileUrl: fileUrl,
      emailSent: true,
      driveUpload: true
    });
  } catch (error) {
    console.error('Error creating receipt:', error);

    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to create and send receipt.';
    const errorDetails = error.stack || '';

    res.status(500).send({
      message: errorMessage,
      details: errorDetails,
      error: error.toString()
    });
  }
};

export { createReceipt };
