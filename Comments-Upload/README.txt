# Comment Library Upload Feature

This repository contains updates for implementing a file upload feature for the Comments functionality in our home inspection report app. The changes allow users to upload CSV or Excel files containing multiple comments to be added to the library.

## Files in this Repository

1. `Comments-Upload/Admin/comments.js` = `scope-inspect-server/api/controllers/CommentsController.js`: Updated React component for the CommentsPage.
2. `Comments-Upload/Server/comments.js` = `src/app/views/comments/comments.js`: Updated Sails.js controller for handling comments.
3. `INTEGRATION_INSTRUCTIONS.md`: Detailed instructions for integrating these changes into the main project.
4. `CommentLibraryUploadInstructions.js`: New React component providing user instructions for file upload.

## New Addition: CommentLibraryUploadInstructions.js

We've added a new file `CommentLibraryUploadInstructions.js` to provide clear instructions to users on how to prepare and upload their comment library files.

### Purpose
This component displays comprehensive instructions for users, including:
- Supported file formats
- Required file structure
- Example of data formatting
- Important notes about formatting and limitations
- Step-by-step upload instructions
- Post-upload information
- Troubleshooting tips

### Integration Steps
1. Place `CommentLibraryUploadInstructions.js` in your components directory.
2. Import the component in your `CommentsPage` or wherever you want to display the instructions:
   ```javascript
   import CommentLibraryUploadInstructions from './CommentLibraryUploadInstructions';
   ```
3. Add the component to your render method:
   ```javascript
   <CommentLibraryUploadInstructions />
   ```
4. Style the component as needed to match your application's design.
5. Consider implementing a toggle or modal to show/hide these instructions for better user experience.

## Implementation Notes
- Ensure that the styling of the new instructions component matches the overall design of the application.
- You may want to add translations if your application supports multiple languages.
- Consider adding analytics to track how often users view these instructions, which could help in further improving the upload process.

## Testing
After integrating the new instructions component:
1. Verify that the instructions are clear and accurate.
2. Test the component's rendering on different screen sizes to ensure responsiveness.
3. If you implement a toggle/modal for the instructions, test its functionality.

For full integration instructions and details on other changes, please refer to the INTEGRATION_INSTRUCTIONS.md file in this repository.

If you encounter any issues or have questions, please contact the project lead or open an issue in this repository.
