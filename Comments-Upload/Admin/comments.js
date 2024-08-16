import React from 'react';
import { connect } from 'react-redux';
import { sessionService } from 'redux-react-session';
import { setRowsPerPage } from '../../../redux/actions/appAction';
import { addComment, deleteComment, getAllComments, updateComment, uploadCommentsFile } from '../../../redux/apiCalls/appData';
import CommentAddEditModal from '../../components/modal/commentAddEditModal';
import CustomTable from "../../components/tables/CustomTable";
import { PlusIcon, SearchIcon, UploadIcon } from '../../icons/Icons';
import Spinner from '../../shared/Spinner';
import CommentLibraryUploadInstructions from './CommentLibraryUploadInstructions';

class CommentsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0,
            input: '',
            sort: 'DESC',
            sortIcon: 'caret-down',
            comments: [],
            filterComments: [],
            loading: true,
            totalRecords: 0,
            recordsPerPage: 20,
            userType: "",
            activeType: '',
            search: {
                type: "all",
                field: "",
            },
            commentEditModalSettings: {
                show: false,
                description: {},
                status: '',
                action: 'add',
                id: null
            },
            uploadStatus: '',
            showUploadInstructions: false,
        };
        this.fileInputRef = React.createRef();
        this.load = true;
    }

    componentDidMount = () => {
        this.timer = null;
        let userType = this.props.user && this.props.user.userType ? this.props.user.userType : "";
        if (userType !== "") {
            this.loadComments(userType);
        } else {
            sessionService.loadSession().then((currentSession) => {
                userType = currentSession.userType;
                this.loadComments(userType);
            });
        }
    }

    loadComments = (userType) => {
        this.props.getAllComments({
            requester: "web",
            commenter: userType === "inspector" ? "dashboard" : userType,
            sort: this.state.sort,
            input: this.state.input,
            page: this.state.page,
            rowsPerPage: this.state.recordsPerPage
        }, (data) => {
            this.setState({
                loading: false,
                comments: this.props.comments,
                filterComments: this.props.comments,
                totalRecords: data.totalRecords,
                recordsPerPage: this.state.recordsPerPage,
                userType
            });
        });
    }

    handleChangeRowsPerPage = (event) => {
        this.setState({ page: 0, loading: true, recordsPerPage: event.target.value });
        this.props.setRowsPerPage(event.target.value);
        this.loadComments(this.state.userType);
    }

    handleChangePage = (page) => {
        this.setState({ page, loading: true });
        this.loadComments(this.state.userType);
    }

    editCommentModalClose = (action, description, status, id, type) => {
        if (action === "Save") {
            let comment = {
                status,
                description,
                id,
                commenter: this.props.user.userType === "admin" ? this.props.user.userType : "user",
                user: this.props.user.id
            };
            this.setState({ commentEditModalSettings: { show: false } });

            if (type !== "edit") {
                this.props.addComment(comment, () => {
                    this.loadComments(this.state.userType);
                });
            } else {
                this.props.updateComment(comment, () => {
                    this.loadComments(this.state.userType);
                });
            }
        } else if (action === "Cancel") {
            this.setState({
                commentEditModalSettings: {
                    show: false,
                    description: {},
                    status: '',
                    action: 'add',
                    id: null
                }
            });
        }
    }

    openCommentModal = (settings, action) => {
        let commentEditModalSettings = {
            show: true,
            status: 'deficiency',
        };

        if (action === "edit" || action === "clone") {
            commentEditModalSettings = {
                ...commentEditModalSettings,
                id: action === "edit" ? settings.id : null,
                action,
                status: settings.status,
                description: settings.description
            };
        }

        this.setState({ commentEditModalSettings });
    }

    deleteComment = (id) => {
        this.props.deleteComment({ id }, () => {
            this.loadComments(this.state.userType);
        });
    }

    handleChangeFilter = (e) => {
        this.setState(prevState => ({
            search: {
                ...prevState.search,
                [e.target.name]: e.target.value
            }
        }), this.searchComment);
    }

    handleSearchFilter = (e) => {
        this.setState(prevState => ({
            search: {
                ...prevState.search,
                field: e.target.value.toLowerCase()
            }
        }), this.searchComment);
    }

    handleTypeFilter = (type) => {
        this.setState({
            search: {
                ...this.state.search,
                type
            },
            activeType: type
        }, this.searchComment);
    }

    searchComment = () => {
        this.setState({ page: 0, loading: true }, () => {
            this.loadComments(this.state.userType);
        });
    }

    handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            this.setState({ uploadStatus: 'Uploading...' });

            this.props.uploadCommentsFile(formData, (response) => {
                if (response.success) {
                    this.setState({ uploadStatus: 'Upload successful' });
                    this.loadComments(this.state.userType);
                } else {
                    this.setState({ uploadStatus: 'Upload failed' });
                }
            });
        }
    }

    triggerFileInput = () => {
        this.fileInputRef.current.click();
    }

    toggleUploadInstructions = () => {
        this.setState(prevState => ({ showUploadInstructions: !prevState.showUploadInstructions }));
    }

    render = () => {
        const { rowsPerPage, user } = this.props;
        const { loading, comments, page, totalRecords, commentEditModalSettings, filterComments, uploadStatus, showUploadInstructions } = this.state;

        return (
            <div>
                <div className="scope-templetes-heading">
                    <div className="scope-comment-title">Comments</div>
                    <div className="scope-comment-search">
                        <div className="input-group">
                            <div className="input-group-append">
                                <div className='search-icon-box'>
                                    <SearchIcon />
                                </div>
                            </div>
                            <input
                                className="form-control"
                                id="comment-search-input"
                                type="text"
                                placeholder="Search Comments"
                                onChange={this.handleSearchFilter}
                            />
                        </div>
                    </div>
                    <div className="scope-comment-filters">
                        <div className="scope-templetes-filters-option">
                            {['', 'deficiency', 'information', 'notinspected'].map(type => (
                                <div
                                    key={type}
                                    className={`scope-templetes-filters-button ${this.state.activeType === type ? 'active' : ''}`}
                                    onClick={() => this.handleTypeFilter(type)}
                                >
                                    <div className="scope-templetes-filters-field">
                                        {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="scope-templetes-add-new-button" onClick={() => this.openCommentModal()}>
                        <PlusIcon className="plus" />
                        <div className="scope-templetes-add-new-title">Comment</div>
                    </div>
                    <div className="scope-templetes-upload-button" onClick={this.triggerFileInput}>
                        <UploadIcon className="upload" />
                        <div className="scope-templetes-upload-title">Upload CSV/XLS</div>
                    </div>
                    <input
                        type="file"
                        ref={this.fileInputRef}
                        style={{ display: 'none' }}
                        onChange={this.handleFileUpload}
                        accept=".csv,.xls,.xlsx"
                    />
                    {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
                    <button onClick={this.toggleUploadInstructions}>
                        {showUploadInstructions ? 'Hide' : 'Show'} Upload Instructions
                    </button>
                </div>

                {showUploadInstructions && <CommentLibraryUploadInstructions />}

                {loading ? (
                    <Spinner />
                ) : filterComments.length > 0 ? (
                    <CustomTable
                        tableHead={tableHead}
                        tableData={filterComments}
                        editRow={this.openCommentModal}
                        clone={this.openCommentModal}
                        remove={this.deleteComment}
                        type="comments"
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalNumber={totalRecords}
                        currentUser={user}
                        handleChangePage={this.handleChangePage}
                        handleChangeRowsPerPage={this.handleChangeRowsPerPage}
                        disableDrag={true}
                    />
                ) : (
                    <h4 className="scope-templetes-heading">No Comment Found</h4>
                )}
                <CommentAddEditModal modalSettings={commentEditModalSettings} close={this.editCommentModalClose} />
            </div>
        );
    }
}

const tableHead = [
    { id: 'commentDescription', label: 'Description', sortable: false, width: "450px" },
    { id: 'status', label: 'Type', sortable: false, width: "190px" },
    { id: 'commenter', label: 'Commenter', sortable: false, width: "190px" },
    { id: 'commentEdit/delete', label: 'Action', sortable: false, width: "10px" },
];

const mapStateToProps = (state) => ({
    comments: state.appData.comments,
    user: state.authData.user,
    rowsPerPage: state.appData.rowsPerPage,
});

const mapDispatchToProps = (dispatch) => ({
    getAllComments: (object, cb) => dispatch(getAllComments(object, cb)),
    setRowsPerPage: (rows) => dispatch(setRowsPerPage(rows)),
    updateComment: (object, cb) => dispatch(updateComment(object, cb)),
    addComment: (object, cb) => dispatch(addComment(object, cb)),
    deleteComment: (object, cb) => dispatch(deleteComment(object, cb)),
    uploadCommentsFile: (formData, cb) => dispatch(uploadCommentsFile(formData, cb)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CommentsPage);
