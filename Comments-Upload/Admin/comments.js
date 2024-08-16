/**
 * CommentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const _ = require("lodash");
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');

module.exports = {

    createComment: async function (req, res){
        let params = req.allParams();
        var userHelper = await sails.helpers.user();
        let user = await userHelper.getUser(req);
        if(!user)
            return res.apiResponse(false, {}, sails.config.responses.notFound);
        sails.log.info(params);
        let commentData = {
            description: params.description || undefined,
            user: user.id,
            status: params.status || undefined
        };
        let comment = await Comments.create(commentData).fetch();
        if(!comment)
            return res.apiResponse(false, {}, sails.config.responses.ormError);
        return res.ok(comment);
    },

    updateComment: async function(req, res){
        let params = req.allParams();

        var userHelper = await sails.helpers.user();
        let user = await userHelper.getUser(req);
        if(!user)
            return res.apiResponse(false, {}, sails.config.responses.notFound);
        if(!params.id)
            return res.apiResponse(false, {}, sails.config.responses.idRequired);
        let updateData = {user: user.id};
        if(params.description)
            updateData.description = params.description;
        if(params.status)
            updateData.status = params.status;
        let comment = await Comments.updateOne({id: params.id, user:user.id}).set(updateData);
        if(comment)
            return res.ok(comment);
        else
            return res.apiResponse(false, {}, sails.config.responses.ormError);
    },

    deleteComment: async function(req, res){
        let params = req.allParams();

        var userHelper = await sails.helpers.user();
        let user = await userHelper.getUser(req);
        if(!user)
            return res.apiResponse(false, {}, sails.config.responses.notFound);

        if(!params.id)
            return res.apiResponse(false, {}, sails.config.responses.idRequired);
        
        let comment = await Comments.destroyOne({id:params.id, user:user.id});
        if(comment){
            return res.ok({msg:"Comment destroyed successfully.", comment});
        }
        return res.apiResponse(false, {}, sails.config.responses.notFound);
    },

    deleteLibraryComment: async function(req, res){
        let params = req.allParams();

        var userHelper = await sails.helpers.user();
        let user = await userHelper.getUser(req);
        if(!user)
            return res.apiResponse(false, {}, sails.config.responses.notFound);

        if(!params.id)
            return res.apiResponse(false, {}, sails.config.responses.idRequired);
        
        let comment = await LibraryComments.destroyOne({id:params.id, user:user.id});
        if(comment){
            return res.ok({msg:"Comment destroyed successfully.", comment});
        }
        return res.apiResponse(false, {}, sails.config.responses.notFound);
    },

    getComments: async function(req, res){
        let params = req.allParams();
        var userHelper = await sails.helpers.user();
        let user = await userHelper.getUser(req);
        if(!user)
            return res.apiResponse(false, {}, sails.config.responses.notFound);
        let pageNo = params.page ? parseInt(params.page) : 0;
        if (_.isUndefined(pageNo) || _.isNaN(pageNo)) {
            pageNo = 0;
        }
        let conditions = {};
        if(params.input){
            conditions =  {
                or:[
                {description: {"contains":params.input}},
                ]
            };
        }
        conditions.user = user.id;
        let sort = params.sort == "ASC" ? "ASC" : "DESC";
        let records = await Comments.find(conditions).sort('id '+sort).paginate(pageNo, sails.config.constant.recordPerPage );
        let totalRecords    = await Comments.count(conditions);
        let results = {};
        results.totalRecords    = totalRecords;
        results.recordPerPage   = sails.config.constant.recordPerPage;
        results.pageNo          = (pageNo + 1);
        results.records         = records;
        return res.ok(results);
    },

    getLibraryComment: async function (req, res) {
        try {
            let filterText = req.param("query", "");
            let status = req.param("status", null);
            let commenter = req.param("commenter", null);
            let sort = req.param("sort", "DESC");
            let pageNo = req.param("page", 0);
            let requestFrom = req.param("requester", "app");
            let userHelper = await sails.helpers.user();
            let user = await userHelper.getUser(req);
            let userCriteria = { user: user.id };
            let adminCriteria = { commenter: "admin" };
            if (status) {
                userCriteria.status = status;
                adminCriteria.status = status;
            }
            if(req.param("id")){
                userCriteria.id = req.param("id");
                adminCriteria.id = req.param("id");
            }
            if(filterText) {
                userCriteria.description = { contains: filterText };
                adminCriteria.description = { contains: filterText };
            }
            let userLibComments = "";
            let adminLibComments = "";
            let totalRecords = "";
            let results = {};
            switch (commenter) {
                case "admin":
                    if (requestFrom == "app"){
                        adminLibComments = await LibraryComments.find(adminCriteria);
                        return res.ok(adminLibComments);
                    }
                    adminLibComments = await LibraryComments.find(adminCriteria).meta({makeLikeModifierCaseInsensitive: true}).sort('id '+sort).paginate(pageNo, sails.config.constant.recordPerPage );
                    totalRecords    = await LibraryComments.count(adminCriteria);
                    results = {};
                    results.totalRecords    = totalRecords;
                    results.recordPerPage   = sails.config.constant.recordPerPage;
                    results.pageNo          = (pageNo + 1);
                    results.records         = adminLibComments;
                    return res.ok(results);
                case "user":
                    if (requestFrom == "app"){
                        userLibComments = await LibraryComments.find(userCriteria);
                        return res.ok(userLibComments);
                    }
                    userLibComments = await LibraryComments.find(userCriteria).meta({makeLikeModifierCaseInsensitive: true}).sort('id '+sort).paginate(pageNo, sails.config.constant.recordPerPage );
                    totalRecords    = await LibraryComments.count(userCriteria);
                    results = {};
                    results.totalRecords    = totalRecords;
                    results.recordPerPage   = sails.config.constant.recordPerPage;
                    results.pageNo          = (pageNo + 1);
                    results.records         = userLibComments;
                    return res.ok(results);
                case 'dashboard':
                    let dashboardCriteria = {
                        or: [
                            { user: user.id },
                            { commenter: 'admin' }
                          ]
                    };
                    if (status) {
                        dashboardCriteria.status = status;
                    }
                    if(req.param("id")){
                        dashboardCriteria.id = req.param("id");
                    }
                    if(filterText) {
                        dashboardCriteria.description = { contains: filterText };
                    }
                    userLibComments = await LibraryComments.find(dashboardCriteria).meta({makeLikeModifierCaseInsensitive: true}).sort([{commenter: 'DESC'}]).paginate(pageNo, sails.config.constant.recordPerPage );
                    totalRecords    = await LibraryComments.count(dashboardCriteria);
                    results = {};
                    results.totalRecords    = totalRecords;
                    results.recordPerPage   = sails.config.constant.recordPerPage;
                    results.pageNo          = (pageNo + 1);
                    results.records         = userLibComments;
                    return res.ok(results);
                default:
                    adminLibComments = await LibraryComments.find(adminCriteria);
                    userLibComments = await LibraryComments.find(userCriteria);
                    return res.ok(_.concat(userLibComments, adminLibComments));
            }
        } catch (error) {
            return res.apiResponse(false, {}, sails.config.responses.unknown);
        }
    },

    createLibraryComment: async function (req, res) {
        try {
            let description = req.param("description", null);
            let status = req.param("status", null);
            let commenter = req.param("commenter", 'user');
            let userHelper = await sails.helpers.user();
            let user = await userHelper.getUser(req);
            if(commenter != "user" && user.userType != "admin") {
                return res.apiResponse(false, {}, sails.config.responses.notAdmin);
            }
            let statuses = ['deficiency', 'information', 'safety', 'acceptable', 'notinspected'];
            if (!user) {
                return res.apiResponse(false, {}, sails.config.responses.notFound);
            } else if (user.userType != "admin" && commenter == "admin")  {
                return res.apiResponse(false, {}, sails.config.responses.notAdmin);
            } else if (!description) {
                return res.apiResponse(false, "Invalid description data", sails.config.responses.invalidInput);
            } else if (!status || !_.includes(statuses, status)) {
                return res.apiResponse(false, "Invalid status", sails.config.responses.invalidInput);
            }
            let commentData = {
                description: description || undefined,
                user: user.id,
                status: status || undefined,
                commenter
            };
            let commentObj = await LibraryComments.create(commentData).fetch();
            return res.ok(commentObj);
        } catch (error) {
            return res.apiResponse(false, error, sails.config.responses.ormError);
        }
    },

    updateLibraryComment: async function (req, res) {
        try {
            let id = req.param("id", null);
            let description = req.param("description", null);
            let status = req.param("status", null);
            let userHelper = await sails.helpers.user();
            let user = await userHelper.getUser(req);
            let statuses = ['deficiency', 'information', 'safety', 'acceptable', 'notinspected'];
            if (!user) {
                return res.apiResponse(false, {}, sails.config.responses.notFound);
            } else if (!id) {
                return res.apiResponse(false, "", sails.config.responses.invalidId);
            } else if (!description) {
                return res.apiResponse(false, "Invalid description data", sails.config.responses.invalidInput);
            } else if (!status || !_.includes(statuses, status)) {
                return res.apiResponse(false, "Invalid status", sails.config.responses.invalidInput);
            }
            let commentData = {
                description: description || undefined,
                user: user.id,
                status: status || undefined
            };
            let oldComment = await LibraryComments.findOne({ id });
            if(!oldComment) {
                return res.apiResponse(false, "Invalid Library Comment ID", sails.config.responses.unknown);
            } else if (oldComment.commenter == "admin" && user.userType != "admin") {
                return res.apiResponse(false, {}, sails.config.responses.notAdmin);
            }
            let commentObj = await LibraryComments.updateOne({ id }).set(commentData);
            return res.ok(commentObj);
        } catch (error) {
            return res.apiResponse(false, error, sails.config.responses.ormError);
        }
    },

    uploadCommentsFile: async function(req, res) {
        try {
            let userHelper = await sails.helpers.user();
            let user = await userHelper.getUser(req);
            if (!user) {
                return res.apiResponse(false, {}, sails.config.responses.notFound);
            }

            req.file('file').upload({
                maxBytes: 10000000 // 10 MB file size limit
            }, async function whenDone(err, uploadedFiles) {
                if (err) {
                    return res.serverError(err);
                }

                if (uploadedFiles.length === 0) {
                    return res.badRequest('No file was uploaded');
                }

                const file = uploadedFiles[0];
                const fileExtension = file.filename.split('.').pop().toLowerCase();

                let comments = [];

                if (fileExtension === 'csv') {
                    comments = await parseCSV(file.fd);
                } else if (['xls', 'xlsx'].includes(fileExtension)) {
                    comments = parseExcel(file.fd);
                } else {
                    return res.badRequest('Unsupported file type');
                }

                let successCount = 0;
                let failureCount = 0;

                for (let comment of comments) {
                    if (isValidComment(comment)) {
                        try {
                            await LibraryComments.create({
                                description: comment.description,
                                status: comment.status,
                                user: user.id,
                                commenter: 'user'
                            });
                            successCount++;
                        } catch (error) {
                            failureCount++;
                            sails.log.error('Error creating comment:', error);
                        }
                    } else {
                        failureCount++;
                    }
                }

                return res.ok({
                    message: 'File processed successfully',
                    successCount,
                    failureCount
                });
            });
        } catch (error) {
            return res.serverError(error);
        }
    }
};

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

function parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
}

function isValidComment(comment) {
    const validStatuses = ['deficiency', 'information', 'safety', 'acceptable', 'notinspected'];
    return comment.description && 
           comment.status && 
           validStatuses.includes(comment.status.toLowerCase()) &&
           typeof comment.description === 'string' &&
           comment.description.trim() !== '';
}
