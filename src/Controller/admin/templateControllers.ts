import { Request, Response } from 'express';
import TemplateDB from '../../models/NotificationTemplate'
import json2csv from 'json2csv';
import csv from 'csv-parser';


// ___________________________ COMMON TEMPLATE CRUD________________________________________________
export const addTemplate = async (req: Request, res: Response): Promise<any> => {
   

    try {
        const {
            Title,
            Subtitle,
            SLUG,
            For,
            Template_Name,
            Message,
            Lenth,
            Status,
            Template_ID,
            VAR_1,
            VAR_2,
            VAR_3,
            VAR_4,
            Subject,
            Email,
            Reference_message,
        } = req.body;

        const newSMSTemplate = await TemplateDB.create({
            Title,
            Subtitle,
            SLUG,
            For,
            Template_Name,
            Message,
            Lenth,
            Status,
            Template_ID,
            VAR_1,
            VAR_2,
            VAR_3,
            VAR_4,
            Subject,
            Email,
            Reference_message,
        });

        res.status(200).json({ status: 200, message: 'Template added successfully', SMSTemplate: newSMSTemplate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};


export const getTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const Template = await TemplateDB.find({}).exec();

        res.status(200).json({ status: 200, message: 'Template found!', Template });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

export const getTemplateById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const Template = await TemplateDB.findById({"_id":id}).exec();

        if (!Template) {
            return res.status(404).json({ status: 404, message: 'Template not found!' });
        }

        res.status(200).json({ status: 200, message: 'Template found!', Template });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

export const updateTemplate = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const updateObj = req.body;

        const SMSTemplate = await TemplateDB.findByIdAndUpdate({"_id":id}, { $set: updateObj }, { new: true }).exec();

        if (!SMSTemplate) {
            return res.status(404).json({ status: 404, message: 'Template not found!' });
        }

        res.status(200).json({
            status: 200,
            message: 'Template updated successfully',
            SMSTemplate,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};


export const deleteTemplate = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const SMSTemplate = await TemplateDB.findByIdAndDelete({"_id":id}).exec();

        if (!SMSTemplate) {
            return res.status(404).json({ status: 404, message: 'Template not found!' });
        }

        res.status(200).json({
            status: 200,
            message: 'Template deleted successfully',
            SMSTemplate,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

export const downloadTemplateFormatCsv = async (req: Request, res: Response): Promise<any> => {
    try {
        const projection = {
            Title: 1,
            Subtitle: 1,
            SLUG: 1,
            For: 1,
            Template_Name: 1,
            Message: 1,
            Lenth: 1,
            Status: 1,
            Template_ID: 1,
            VAR_1: 1,
            VAR_2: 1,
            VAR_3: 1,
            VAR_4: 1,
            Subject: 1,
            Email: 1,
            Reference_message: 1,
        };

        const SMSTemplates = await TemplateDB.find({}, projection).exec();

        if (!SMSTemplates) {
            return res.status(500).json({ code: 500, message: 'Internal server error.' });
        }

        const options = {
            fields: [
                'Title',
                'Subtitle',
                'SLUG',
                'For',
                'Template_Name',
                'Message',
                'Lenth',
                'Status',
                'Template_ID',
                'VAR_1',
                'VAR_2',
                'VAR_3',
                'VAR_4',
                'Subject',
                'Email',
                'Reference_message',
            ],
        };

        const csv = json2csv.parse(SMSTemplates, options);

        res.setHeader('Content-disposition', 'attachment; filename=SMSTemplatesFormat.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
    }
};

export const uploadTemplateFromCsv = async (req: Request, res: Response): Promise<void> => {
    try {
        const fileBuffer = ((req as any).file.buffer); // Store the file contents in a variable
 
        const results: any[] = [];

        // Parse the CSV from the buffer
        csv()
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', async () => {
                console.log('cccccccccccccccccccccccccccccccccccc', results);

                try {
                    const result = await TemplateDB.insertMany(results);
                    console.log('RESULT----------------->', result);
                    res.status(200).json({ code: 200, message: 'Templates added successfully', data: result });
                } catch (err) {
                    console.error(err);
                    res.status(500).json({ code: 500, message: 'Internal server error', err });
                }
            })
            .end(fileBuffer); // Pass the fileBuffer to the parser
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: 'Internal server error', err: error });
    }
};