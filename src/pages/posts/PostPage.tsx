import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';

import classes from './PostCreateEditForm.module.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import PostDetail from './PostDetail';

export type PostResultType = {
	id: string;
	owner: string;
	profile_id: number;
	profile_image: string;
	comments_count: number;
	likes_count: number;
	like_id: number;
	title: string;
	content: string;
	image: string;
	updated_at: string;
};

type PostResults = {
    results: PostResultType[]
}

const PostPage = () => {
	const { id } = useParams();
    const [post, setPost] = useState<PostResultType| null>(null);

    useEffect(() => {
        const handleMount = async () => {
            try {
                // Promise.all() returns an array of resolved data 
                const [{data}] = await Promise.all([
                    axiosReq.get<PostResults>(`/posts/${id}`)
                ])
                if (data.results &&
                    data.results[0]
                    ) {
                        setPost(data.results[0]);
                    }
                console.log(data)
            } catch(err) {
                console.log(err)
            }
        }

        handleMount();
    }, [id])

	return (
		<Row className="h-100">
			<Col className="py-2 p-0 p-lg-2" lg={8}>
				<p>Popular profiles for mobile</p>
                {/* postPage will evaluate as truthy */}
				{post && <PostDetail {...post} setPost={setPost} postPage/>}
				<Container className={classes.content}>Comments</Container>
			</Col>
			<Col lg={4} className="d-none d-lg-block p-0 p-lg-2">
				Popular profiles for desktop
			</Col>
		</Row>
	);
}

export default PostPage;