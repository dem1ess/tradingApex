const multer = require('multer')
const path = require('path')

// Указываем, где сохранять файлы
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../uploads/avatars'))
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname)
	},
})

// Фильтрация файлов по типу
const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
	if (!allowedTypes.includes(file.mimetype)) {
		return cb(new Error('Only images are allowed'), false)
	}
	cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

module.exports = upload
