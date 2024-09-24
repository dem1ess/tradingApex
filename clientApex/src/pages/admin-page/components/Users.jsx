// Users.js
import { useState } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import UserTable from './UserTable'

const Users = () => {
	const [selectedUser, setSelectedUser] = useState(null)

	const handleUserClick = user => {
		setSelectedUser(user)
	}

	return (
		<Container
			fluid
			style={{
				backgroundColor: '#1a1a1a',
				color: '#ffffff',
				minHeight: '100vh',
			}}
		>
			<Row>
				<Col lg={12}>
					<Card style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
						<Card.Header as='h5'>Users</Card.Header>
						<Card.Body>
							<UserTable onUserClick={handleUserClick} />
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	)
}

export default Users
