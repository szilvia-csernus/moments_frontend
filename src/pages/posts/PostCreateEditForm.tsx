import React, { ChangeEvent, useContext, useRef, useState } from 'react';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Upload from '../../assets/upload.png';

import styles from './Post.module.css';

import btnStyles from '../../components/Button.module.css';
import Asset from '../../components/Asset';
import { Alert, Image } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
// import { axiosReq } from '../../api/axiosDefaults';
import axios, { type AxiosResponse } from 'axios';
import { RefreshKeyContext } from '../../contexts/CurrentUserContext';


type PostData = {
	title: string;
	content: string;
	image: string;
};

interface AxiosError extends Error {
	response?: {
		status?: number;
		data?: string;
	};
}

type errorDetail = string[];

type errorDataType =
	| {
		title: errorDetail;
		content: errorDetail;
		image: errorDetail;
	}
	| undefined;

type PostError = {
	title?: string[] | undefined;
	content?: string[] | undefined;
	image?: string[] | undefined;
};

interface PostErrorResponse extends AxiosResponse {
	data: PostError | undefined;
}

function PostCreateForm() {
	const [errors, setErrors] = useState<errorDataType>();
	const [postData, setPostData] = useState<PostData>({
		title: '',
		content: '',
		image: '',
	});
	const refreshKey = useContext(RefreshKeyContext);

	const { title, content, image } = postData;

	const imageInput = useRef<HTMLInputElement | null>(null);
	
	const location = useLocation();
	const navigate = useNavigate();

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPostData({
			...postData,
			[event.target.name]: event.target.value,
		});
	};

	const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length) {
			URL.revokeObjectURL(image);
			setPostData({
				...postData,
				image: URL.createObjectURL(event.target.files[0]),
			});
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const formData = new FormData();

		formData.append('title', title);
		formData.append('content', content);
		if (imageInput.current && imageInput.current.files) {
			formData.append('image', imageInput.current.files[0])
		}

		try {
			const accessKeyData = await axios.post('api/token/refresh/', {
					refresh: refreshKey,
				});
			if (accessKeyData.data.access) {
				const { data } = await axios.post('/posts/', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${accessKeyData.data.access}`,
					},
				});
				navigate(`/posts/${data.id}`, { state: { from: location } });
			}
			else {
				// refresKey expired, do stg here
			}
		} catch (err) {
			const axiosError = err as AxiosError;
			console.log('axios error', axiosError)
			if (axiosError.response && axiosError.response.data) {
				const { data } = axiosError.response as PostErrorResponse;
				setErrors({
					title: data?.title || [],
					content: data?.content || [],
					image: data?.image || [],
				});
			}
		}
	}

	const handleCancel = () => {
		const previousLocation = location.state?.from || '/';
		navigate(previousLocation);
	};

	const textFields = (
		<div className="text-center">
			<Form.Group className="mb-2">
				<Form.Label className="">Title</Form.Label>
				<Form.Control
					className={styles.title}
					type="text"
					name="title"
					value={title}
					onChange={handleChange}
				/>
			</Form.Group>
			{errors &&
				errors.title.map((data, idx) => (
					<Alert variant="warning" key={idx}>
						{data}
					</Alert>
				))}
			<Form.Group className="mb-2">
				<Form.Label className="">Content</Form.Label>
				<Form.Control
					className={styles.content}
					as="textarea"
					name="content"
					rows={6}
					value={content}
					onChange={handleChange}
				/>
			</Form.Group>
			{errors &&
				errors.content.map((data, idx) => (
					<Alert variant="warning" key={idx}>
						{data}
					</Alert>
				))}
			<Button
				className={`${btnStyles.Button} ${btnStyles.Blue}`}
				onClick={handleCancel}
			>
				cancel
			</Button>
			<Button
				className={`${btnStyles.Button} ${btnStyles.Blue}`}
				type="submit">
				create
			</Button>
		</div>
	);

	return (
		<Form onSubmit={handleSubmit}>
			<Row>
				<Col className="py-2 p-0 p-md-2" md={6} lg={8}>
					<Container
						className={`Content ${styles.container} d-flex flex-column justify-content-center`}
					>
						<Form.Group className="text-center">
							{image ? (
								<>
									<figure>
										<Image
											src={image}
											className="Image"
											rounded />
									</figure>
									<div>
										<Form.Label
											className={`${btnStyles.Button} ${btnStyles.Blue} btn`}
											htmlFor="image-upload"
										>
											Change the image
										</Form.Label>
									</div>
								</>
							) : (
								<Form.Label
									className="d-flex justify-content-center"
									htmlFor="image-upload"
								>
									<Asset
										spinner={false}
										src={Upload}
										message={'Click or tap to upload an image'}
									/>
								</Form.Label>
							)}
							<Form.Control
								type="file"
								id="image-upload"
								accept="image/*"
								onChange={handleChangeImage}
								ref={imageInput}
							/>
							{errors &&
								errors.image.map((data, idx) => (
									<Alert variant="warning" key={idx}>
										{data}
									</Alert>
								))}
						</Form.Group>
						<div className="d-md-none">{textFields}</div>
					</Container>
				</Col>
				<Col md={5} lg={4} className="d-none d-md-block p-0 my-2">
					<Container className="Content">{textFields}</Container>
				</Col>
			</Row>
		</Form>
	);
}

export default PostCreateForm;
