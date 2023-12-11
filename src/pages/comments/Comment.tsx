import { Card } from 'react-bootstrap';
import styles from './Comment.module.css';
import { Link } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import { CommentType, CommentsResponseType } from './CommentTypes';
import { Dispatch, SetStateAction, useContext } from 'react';
import { AuthenticatedDeleteContext, CurrentUserContext } from '../../contexts/CurrentUserContext';
import { MoreDropdown } from '../../components/MoreDropdown';
import { PostsResponseType } from '../posts/PostTypes';

type CommentPropsType = CommentType & {
    setPosts: Dispatch<SetStateAction<PostsResponseType>>;
    setComments: Dispatch<SetStateAction<CommentsResponseType>>;
}

function Comment({id, profile_id, profile_image, owner, updated_at, content, setPosts, setComments}: CommentPropsType) {
    const currentUser = useContext(CurrentUserContext);
    const isCommentOwner = currentUser ? currentUser.username === owner : false;
    const authenticatedDelete = useContext(AuthenticatedDeleteContext);

    const handleEdit = () => {
            // navigate(`/posts/${post}/`);
        };

    const handleDelete = async () => {
        try {
            await authenticatedDelete(`/comments/${id}`);
            setPosts((prevPosts: PostsResponseType) => {
                const newCommentsCount = prevPosts.results[0].comments_count - 1
                    return {
                        ...prevPosts,
                        results: [
                            {
                            ...prevPosts.results[0],
                            comments_count: newCommentsCount,
                            }
                        ]
                    };
                });
            setComments((prevComments: CommentsResponseType) => {
                const updatedCommentsResults = prevComments.results.filter(
                    (comment) => comment.id !== id
                );
                return {
                    ...prevComments,
                    results: updatedCommentsResults,
                };
            });
        } catch (err) {
            console.log(err);
        }
        };
  return (
		<Card className={`${styles.Post} mt-3`}>
			<Card.Body>
				<div className="d-flex align-items-center justify-content-between gap-2">
					<div className="d-flex gap-2">
                        <Link to={`/profiles/${profile_id}`} className="d-flex gap-2">
                            <Avatar src={profile_image} height={55} text="" />
                        </Link>
                        <div>
                            <div>
                                <span className={styles.Owner}>{owner}</span>
                                <span className={styles.Date}>{updated_at}</span>
                            </div>
                            <p>{content}</p>
                        </div>
					</div>
					<div className="d-flex gap-1 align-items-center">
							{isCommentOwner && (
								<MoreDropdown
									handleEdit={handleEdit}
									handleDelete={handleDelete}
								/>
							)}
					</div>
				</div>
			</Card.Body>
		</Card>
	);
}

export default Comment