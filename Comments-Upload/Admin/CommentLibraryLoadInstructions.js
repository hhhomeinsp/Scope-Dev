// CommentLibraryUploadInstructions.js

import React from 'react';

const CommentLibraryUploadInstructions = () => {
  return (
    <div className="upload-instructions">
      <h2>How to Upload Your Comment Library</h2>
      
      <h3>Supported File Formats</h3>
      <p>We support the following file formats:</p>
      <ul>
        <li>CSV (Comma-Separated Values)</li>
        <li>XLS (Microsoft Excel 97-2003)</li>
        <li>XLSX (Microsoft Excel 2007+)</li>
      </ul>

      <h3>File Structure</h3>
      <p>Your file should have the following columns:</p>
      <ol>
        <li><strong>description</strong>: The text content of the comment</li>
        <li><strong>status</strong>: The type of comment (must be one of: deficiency, information, safety, acceptable, notinspected)</li>
      </ol>

      <h3>Example</h3>
      <table>
        <thead>
          <tr>
            <th>description</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>The roof shingles are worn and need replacement.</td>
            <td>deficiency</td>
          </tr>
          <tr>
            <td>The HVAC system is functioning properly.</td>
            <td>acceptable</td>
          </tr>
        </tbody>
      </table>

      <h3>Important Notes</h3>
      <ul>
        <li>The first row of your file should be the column headers: "description" and "status".</li>
        <li>The "status" field is case-insensitive, but must be one of the allowed values.</li>
        <li>Ensure there are no empty rows in your file.</li>
        <li>The maximum file size allowed is 10MB.</li>
        <li>Special characters are allowed in the description field.</li>
        <li>If using Excel, avoid using formulas. All cells should contain plain text.</li>
      </ul>

      <h3>Steps to Upload</h3>
      <ol>
        <li>Prepare your file according to the format described above.</li>
        <li>Click on the "Upload CSV/XLS" button in the Comments page.</li>
        <li>Select your file when prompted.</li>
        <li>Wait for the upload and processing to complete. This may take a few moments for larger files.</li>
        <li>You'll see a confirmation message with the number of successfully added comments and any failures.</li>
      </ol>

      <h3>After Upload</h3>
      <p>After a successful upload:</p>
      <ul>
        <li>New comments will be added to your library.</li>
        <li>Duplicate comments (based on exact description match) will be skipped.</li>
        <li>The page will refresh to show your updated comment library.</li>
      </ul>

      <h3>Troubleshooting</h3>
      <p>If you encounter issues:</p>
      <ul>
        <li>Ensure your file meets all the format requirements described above.</li>
        <li>Check that you're not exceeding the 10MB file size limit.</li>
        <li>If using CSV, ensure commas within descriptions are properly escaped.</li>
        <li>For persistent issues, please contact our support team.</li>
      </ul>
    </div>
  );
};

export default CommentLibraryUploadInstructions;
