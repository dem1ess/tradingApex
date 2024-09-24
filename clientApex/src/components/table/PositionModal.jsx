import ReactDOM from 'react-dom'

const PositionModal = ({ children, onClose }) => {
	return ReactDOM.createPortal(
		<div
			className='modal fade show d-block'
			tabIndex='-1'
			role='dialog'
			onClick={onClose}
		>
			<div
				className='modal-dialog modal-dialog-centered modal-md'
				role='document'
				onClick={e => e.stopPropagation()}
			>
				<div className='modal-content'>
					<div className='modal-body'>{children}</div>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default PositionModal
