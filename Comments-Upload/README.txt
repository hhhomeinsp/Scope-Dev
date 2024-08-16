# Comment Library Upload Feature

This repository contains updates for implementing a file upload feature for the Comments functionality in our home inspection report app. The changes allow users to upload CSV or Excel files containing multiple comments to be added to the library.

## Files in this Repository

1. `Comments-Upload/Admin/comments.js` = `scope-inspect-server/api/controllers/CommentsController.js`: Updated React component for the CommentsPage.
2. `Comments-Upload/Server/comments.js` = `src/app/views/comments/comments.js`: Updated Sails.js controller for handling comments.
3.  `CommentLibraryUploadInstructions.js: New React component for user instructions

Integration Steps
1. Frontend Integration
a. Replace the existing CommentsPage component in your codebase with the new version from frontend/comments.js.
b. Add the new CommentLibraryUploadInstructions.js file to your components directory.
c. Update your Redux actions to include the new uploadCommentsFile action:
javascriptCopy// In your actions file (e.g., commentActions.js)
export const uploadCommentsFile = (formData, callback) => {
    return (dispatch) => {
        return axios.post('/api/upload-comments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            callback({ success: true, data: response.data });
        })
        .catch(error => {
            callback({ success: false, error });
        });
    };
};
d. Ensure the new action is imported and included in your mapDispatchToProps.
e. Update your CSS to style the new upload button, status message, and instructions component.
2. Backend Integration
a. Replace the existing CommentsController.js file in your Sails.js app with the new version from backend/comments.js.
b. Add the new route to your config/routes.js file:
javascriptCopy'POST /api/upload-comments': 'CommentsController.uploadCommentsFile',
c. Install required dependencies:
Copynpm install csv-parser xlsx
d. Ensure your Sails.js app is configured to handle file uploads. You may need to install and configure sails-hook-uploads if not already set up.
3. Testing
a. Test the new file upload functionality:

Upload valid CSV and Excel files
Test with invalid file formats
Test with files containing both valid and invalid comments
Test with large files

b. Verify that existing comment functionality still works as expected.
c. Check for any console errors or warnings.
4. Error Handling and Validation
a. Implement frontend validation for file type and size before upload.
b. Ensure error messages are clear and informative.
c. Verify backend validation and error handling.
