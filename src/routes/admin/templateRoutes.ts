import express from 'express';
import {
  addTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  downloadTemplateFormatCsv,
  uploadTemplateFromCsv,
  getTemplateById
} from '../../Controller/admin/templateControllers'; 

import {
    addSMSTemplateValidation,
    handleValidationErrors
  } from "../../services/validators";

import { uploadMiddleware } from '../../services/uploads';

const router = express.Router();

router.post('/addTemplate',addSMSTemplateValidation,handleValidationErrors, addTemplate);
router.get('/getTemplate', getTemplate);
router.get('/getTemplate/:id', getTemplateById);
router.post('/updateTemplate/:id', updateTemplate);
router.post('/deletetemplate/:id', deleteTemplate);
router.get('/downloadTemplate', downloadTemplateFormatCsv);
router.post('/uploadTemplate',[uploadMiddleware],uploadTemplateFromCsv)

export default router;
