import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Recording } from '../types.js'
import { memoryStore } from '../storage/memory.store.js'
import { processingPipeline } from '../services/processing.pipeline.js'

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({ storage })

const router = Router()

router.post('/recordings', upload.single('video'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No video file provided' })
    return
  }

  const { questionIndex, candidateName } = req.body
  const id = uuidv4()

  const recording: Recording = {
    id,
    questionIndex: parseInt(questionIndex, 10),
    candidateName: candidateName || 'Anonymous',
    filePath: req.file.path,
    status: 'pending',
    createdAt: new Date(),
  }

  memoryStore.save(recording)

  // Launch pipeline async - don't wait
  processingPipeline.execute(recording)

  res.status(202).json({ id, status: 'processing' })
})

router.get('/recordings', (_req, res) => {
  const recordings = memoryStore.getAll()
  res.json(recordings)
})

export default router
