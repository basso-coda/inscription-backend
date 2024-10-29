const path = require('path')
const fs = require('fs')
const sharp = require('sharp')

class Upload {

    static destinationPath = path.resolve('./') + path.sep + 'public' + path.sep + 'uploads'

    /**
     * Sauvegarder l'image et génerer
     * son thumbnail
     */
    static async save(file, fileDestinationName, options = { compressed: true, thumbnail: true }) {
        try {
            let fileDestination;

            if (fileDestinationName) {
                fileDestination = this.destinationPath + path.sep + fileDestinationName.split('/').join(path.sep) + path.sep + file.name;
            }

            const extname = fileDestination ? path.extname(fileDestination) : path.extname(file.name)
            const defaultFileName = Date.now() + extname

            const finalFileName = fileDestination ? Date.now() + '_' + path.basename(fileDestination) : defaultFileName

            const thumbName = path.parse(finalFileName).name + '_thumb' + path.extname(finalFileName)
            const destinationFolder = fileDestination ? path.dirname(fileDestination) : this.destinationPath
            const filePath = destinationFolder + path.sep + finalFileName
            const thumbPath = destinationFolder + path.sep + thumbName

            if (!fs.existsSync(destinationFolder)) {
                fs.mkdirSync(destinationFolder, { recursive: true })
            }

            const isImage = ['image/jpeg', 'image/gif', 'image/png'].includes(file.mimetype)

            let thumbInfo = undefined

            let fileInfo = {}

            if (isImage && options.compressed) {

                fileInfo = await sharp(file.data).resize(500).toFormat(extname.substring(1), { quality: 100 }).toFile(filePath)
            } else {
                fileInfo = await file.mv(filePath)
            }

            let uploadedDir = 'uploads' + path.sep + fileDestinationName.split('/').join(path.sep) + path.sep;

            return {
                fileInfo: { ...fileInfo, fileName: uploadedDir + finalFileName },
                thumbInfo: options.thumbnail ? { ...thumbInfo, thumbName: uploadedDir + thumbName } : undefined
            }
        } catch (error) {
            throw error
        }
    }
}

module.exports = Upload